import React from 'react';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhotoViewerScreen } from '../../src/screens/PhotoViewerScreen';
import { NotFoundState } from '../../src/components/feedback/NotFoundState';
import { parseJsonParam, singleParam } from '../../src/navigation/routeParams';
import { HttpsUrlSchema, LocalImageUriSchema } from '../../src/schemas/common';

const PhotosParamSchema = z.array(z.union([HttpsUrlSchema, LocalImageUriSchema])).min(1).max(10);

export default function PhotoGalleryRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photos?: string; initialIndex?: string }>();
  const parsed = parseJsonParam(params.photos, PhotosParamSchema);
  if (parsed.status !== 'valid') {
    return <NotFoundState title="Foto tidak valid" message="Daftar foto tidak dapat ditampilkan." onBack={() => router.back()} />;
  }
  const idx = Number.parseInt(singleParam(params.initialIndex) ?? '0', 10);
  const initialIndex = Number.isInteger(idx) && idx >= 0 && idx < parsed.data.length ? idx : 0;
  return <PhotoViewerScreen visible photos={parsed.data} initialIndex={initialIndex} onClose={() => router.back()} />;
}
