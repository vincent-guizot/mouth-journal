import { FirebaseStorage, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { AppMode } from '../../config/env';
import { BackendNotConfiguredError } from '../../repositories/sync/remote';
import { generateId } from '../../utils/ids';

/** Must match firebase/storage.rules. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};
export const IMAGE_FOLDERS = ['journals', 'menus', 'avatars', 'banners'] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export class ImageUploadError extends Error {
  constructor(
    readonly code: 'too-large' | 'unsupported-type' | 'read-failed' | 'upload-failed',
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export interface UploadedImage {
  /** https download URL ('cloud') or the original device URI ('local', demo mode only). */
  url: string;
  kind: 'cloud' | 'local';
  contentType?: string;
  size?: number;
  storagePath?: string;
}

/** Bytes of a local image plus the size/type reported by the platform. */
export interface LoadedImage {
  bytes: Blob | Uint8Array;
  size: number;
  type?: string;
}

export interface ImageUploadDeps {
  mode: AppMode;
  storage: FirebaseStorage | null;
  /** Reads a device URI. Defaults to fetch(uri).blob() (React Native). */
  loadImage?: (uri: string) => Promise<LoadedImage>;
}

const defaultLoadImage = async (uri: string): Promise<LoadedImage> => {
  const res = await fetch(uri);
  if (!res.ok && res.status !== 0) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return { bytes: blob, size: blob.size, type: blob.type };
};

/**
 * Normalises the MIME type. Only the asset's own type or the blob's real type is
 * used; 'image/jpg' is the one well-known alias normalised to 'image/jpeg'.
 */
export const resolveContentType = (declared: string | undefined, blobType: string | undefined): string | null => {
  const candidate = (declared || blobType || '').toLowerCase().trim();
  const normalised = candidate === 'image/jpg' ? 'image/jpeg' : candidate;
  return ALLOWED_IMAGE_TYPES[normalised] ? normalised : null;
};

export const isRemoteImageUrl = (uri: string) => uri.startsWith('https://');

/**
 * Uploads to /users/{uid}/{folder}/{id}.{ext}. Never "succeeds" with a local URI in
 * Firebase mode: a too-large file, unsupported type or failed upload throws.
 * Demo mode returns the local URI explicitly flagged as kind: 'local'.
 */
export const uploadImage = async (
  deps: ImageUploadDeps,
  input: { uri: string; mimeType?: string; userId: string; folder: ImageFolder }
): Promise<UploadedImage> => {
  if (!input.userId) throw new Error('User ID wajib untuk upload foto.');
  if (!IMAGE_FOLDERS.includes(input.folder)) throw new Error(`Folder upload tidak dikenal: ${input.folder}`);
  if (isRemoteImageUrl(input.uri)) return { url: input.uri, kind: 'cloud' };
  if (deps.mode === 'demo') return { url: input.uri, kind: 'local' };
  if (deps.mode !== 'firebase' || !deps.storage) throw new BackendNotConfiguredError();

  let blob: LoadedImage;
  try {
    blob = await (deps.loadImage ?? defaultLoadImage)(input.uri);
  } catch (err) {
    throw new ImageUploadError('read-failed', 'Foto tidak dapat dibaca dari perangkat.', err);
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError(
      'too-large',
      `Ukuran foto ${(blob.size / 1024 / 1024).toFixed(1)} MB melebihi batas 10 MB.`
    );
  }
  const contentType = resolveContentType(input.mimeType, blob.type);
  if (!contentType) {
    throw new ImageUploadError('unsupported-type', `Format foto tidak didukung (${input.mimeType || blob.type || 'tidak diketahui'}). Gunakan JPEG, PNG, WebP, atau HEIC.`);
  }

  const storagePath = `users/${input.userId}/${input.folder}/${generateId()}.${ALLOWED_IMAGE_TYPES[contentType]}`;
  try {
    const storageRef = ref(deps.storage, storagePath);
    await uploadBytes(storageRef, blob.bytes, { contentType });
    const url = await getDownloadURL(storageRef);
    return { url, kind: 'cloud', contentType, size: blob.size, storagePath };
  } catch (err) {
    throw new ImageUploadError('upload-failed', `Upload foto gagal: ${err instanceof Error ? err.message : String(err)}`, err);
  }
};
