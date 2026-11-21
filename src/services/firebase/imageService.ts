import * as ImagePicker from 'expo-image-picker';
import { appMode, storage } from '../../config/firebase';
import { ImageFolder, UploadedImage, uploadImage } from '../images/imageUpload';
import { feedback } from '../../components/feedback';

export { MAX_IMAGE_BYTES, ImageUploadError, isRemoteImageUrl } from '../images/imageUpload';
export type { ImageFolder, UploadedImage } from '../images/imageUpload';

/** MIME types reported by the picker, keyed by the local URI it returned. */
const pickedMimeTypes = new Map<string, string>();

const fromResult = (result: ImagePicker.ImagePickerResult): string | null => {
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.mimeType) pickedMimeTypes.set(asset.uri, asset.mimeType);
  return asset.uri;
};

export class ImageService {
  static pickImage(): Promise<string | null> {
    return this.pickImageFromGallery();
  }

  /** Returns the local URI, or null if the user cancelled / denied permission. Errors are rethrown. */
  static async pickImageFromGallery(): Promise<string | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      feedback.showAlert('Izin Diperlukan', 'Izin akses galeri diperlukan untuk memilih foto.');
      return null;
    }
    return fromResult(
      await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 })
    );
  }

  static async takePhotoWithCamera(): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      feedback.showAlert('Izin Diperlukan', 'Izin kamera diperlukan untuk memotret.');
      return null;
    }
    return fromResult(await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 }));
  }

  /** See uploadImage(): throws on any failure, never returns a fake cloud URL. */
  static upload(uri: string, userId: string, folder: ImageFolder): Promise<UploadedImage> {
    return uploadImage({ mode: appMode, storage }, { uri, mimeType: pickedMimeTypes.get(uri), userId, folder });
  }
}
