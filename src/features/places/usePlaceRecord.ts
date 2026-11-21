import { useCallback, useEffect, useState } from 'react';
import { Place } from '../../models/place';
import { placesService } from '../../services/places/placesService';
import { wishlistRepository } from '../../repositories';
import { feedback } from '../../components/feedback';

export type PlaceStatus = 'loading' | 'ready' | 'not_found' | 'invalid' | 'error';

/**
 * Place detail state: validated initial data or a real OSM lookup, plus the real
 * wishlist state for this placeId.
 */
export function usePlaceRecord(userId: string | undefined, placeId: string | null, initial: Place | null) {
  const [place, setPlace] = useState<Place | null>(initial);
  const [status, setStatus] = useState<PlaceStatus>(!placeId ? 'invalid' : initial ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchPlace = useCallback(async (): Promise<{ place: Place | null; status: PlaceStatus; error: string | null } | null> => {
    // Initial status already covers 'invalid' and 'ready (from initialData)'.
    if (!placeId || initial) return null;
    try {
      const found = await placesService.getPlaceDetails(placeId);
      return { place: found, status: found ? 'ready' : 'not_found', error: null };
    } catch (err) {
      return { place: null, status: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  }, [placeId, initial]);

  const apply = useCallback((o: { place: Place | null; status: PlaceStatus; error: string | null } | null) => {
    if (!o) return;
    setPlace(o.place);
    setStatus(o.status);
    setError(o.error);
  }, []);

  useEffect(() => {
    let active = true;
    fetchPlace().then((o) => active && apply(o));
    return () => {
      active = false;
    };
  }, [fetchPlace, apply]);

  useEffect(() => {
    if (!userId || !placeId) return;
    wishlistRepository
      .isInWishlist(userId, placeId)
      .then(setIsWishlisted)
      .catch((err) => console.warn('[Place] Status wishlist gagal dimuat:', err));
  }, [userId, placeId]);

  const toggleWishlist = useCallback(async () => {
    if (!userId || !place) return;
    try {
      const { sync } = isWishlisted
        ? await wishlistRepository.removeFromWishlist(userId, place.id)
        : await wishlistRepository.addToWishlist(userId, {
            placeId: place.id,
            placeName: place.name,
            placeAddress: place.address,
            mainCategory: place.mainCategory,
            subCategory: place.subCategory || place.mainCategory,
            subCategoryLabel: place.subCategoryLabel || place.mainCategory,
            latitude: place.latitude,
            longitude: place.longitude,
            photoUrl: place.photoUrl,
          });
      setIsWishlisted(!isWishlisted);
      feedback.showAlert(
        'Wishlist',
        `"${place.name}" ${isWishlisted ? 'dihapus dari' : 'disimpan ke'} wishlist${sync === 'pending' ? ' (akan disinkronkan saat online)' : ''}.`
      );
    } catch (err) {
      feedback.showAlert('Wishlist Gagal Diperbarui', err instanceof Error ? err.message : String(err));
    }
  }, [userId, place, isWishlisted]);

  const reload = useCallback(() => {
    setStatus('loading');
    return fetchPlace().then(apply);
  }, [fetchPlace, apply]);

  return { place, status, error, reload, isWishlisted, toggleWishlist };
}
