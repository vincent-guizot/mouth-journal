import React from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { parseIdParam } from '../../src/navigation/routeParams';
import { NotFoundState } from '../../src/components/feedback/NotFoundState';

/**
 * Wishlist items are keyed by placeId (itemId === placeId), so the wishlist detail
 * is the place detail. Kept as a route for old deep links.
 */
export default function WishlistItemDetailRoute() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const placeId = parseIdParam(itemId);
  if (!placeId) return <NotFoundState title="Tautan wishlist tidak valid" onBack={() => router.back()} />;
  return <Redirect href={{ pathname: '/places/[placeId]', params: { placeId } }} />;
}
