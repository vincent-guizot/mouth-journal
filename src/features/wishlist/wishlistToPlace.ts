import { Place } from '../../models/place';
import { WishlistItem } from '../../models/wishlist';

/** Rebuilds a Place from a saved wishlist item without inventing missing data. */
export const wishlistItemToPlace = (item: WishlistItem): Place => ({
  id: item.placeId,
  providerId: item.placeId.startsWith('osm-') ? 'osm' : 'manual',
  name: item.placeName,
  address: item.placeAddress,
  mainCategory: item.mainCategory,
  mainCategoryLabel: '',
  subCategory: item.subCategory,
  subCategoryLabel: item.subCategoryLabel,
  latitude: item.latitude,
  longitude: item.longitude,
  photoUrl: item.photoUrl,
  tags: [],
});
