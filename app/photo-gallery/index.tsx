import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhotoViewerScreen } from '../../src/screens/PhotoViewerScreen';

export default function PhotoGalleryRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    photos?: string;
    initialIndex?: string;
    journalId?: string;
  }>();

  let photos: string[] = [];
  if (params.photos) {
    try {
      photos = JSON.parse(params.photos);
    } catch {
      photos = [params.photos];
    }
  }

  const initialIndex = params.initialIndex ? parseInt(params.initialIndex, 10) : 0;

  return (
    <PhotoViewerScreen
      visible={true}
      photos={photos.length > 0 ? photos : undefined}
      initialIndex={isNaN(initialIndex) ? 0 : initialIndex}
      onClose={() => router.back()}
    />
  );
}
