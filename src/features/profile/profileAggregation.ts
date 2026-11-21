import { Journal, MenuItem } from '../../models/journal';

export interface VisitedPlace {
  placeId: string;
  placeName: string;
  placeAddress: string;
  subCategoryLabel: string;
  visitCount: number;
  averageRating: number;
  lastVisited: string;
  photoUrl?: string;
}

export interface LoggedDish {
  id: string;
  journalId: string;
  dishName: string;
  price: number;
  category?: MenuItem['category'];
  rating?: number;
  isRecommended?: boolean;
  photoUrl?: string;
  notes?: string;
  placeName: string;
  placeId: string;
  date: string;
}

/**
 * Aggregates unique places visited by the user across their real journals.
 * Grouped strictly by `placeId` (not place name, because branches can share names).
 */
export function aggregateVisitedPlaces(journals: Journal[]): VisitedPlace[] {
  const map = new Map<
    string,
    {
      placeId: string;
      placeName: string;
      placeAddress: string;
      subCategoryLabel: string;
      visitCount: number;
      totalRating: number;
      lastVisited: string;
      photos: string[];
    }
  >();

  for (const j of journals) {
    const date = j.visitedAt || j.createdAt;
    const existing = map.get(j.placeId);
    if (!existing) {
      map.set(j.placeId, {
        placeId: j.placeId,
        placeName: j.placeName,
        placeAddress: j.placeAddress,
        subCategoryLabel: j.subCategoryLabel,
        visitCount: 1,
        totalRating: j.overallRating,
        lastVisited: date,
        photos: [...j.photoUrls],
      });
    } else {
      existing.visitCount += 1;
      existing.totalRating += j.overallRating;
      if (date > existing.lastVisited) {
        existing.lastVisited = date;
      }
      if (j.photoUrls.length > 0) {
        existing.photos.push(...j.photoUrls);
      }
    }
  }

  return Array.from(map.values())
    .map((p) => ({
      placeId: p.placeId,
      placeName: p.placeName,
      placeAddress: p.placeAddress,
      subCategoryLabel: p.subCategoryLabel,
      visitCount: p.visitCount,
      averageRating: Math.round((p.totalRating / p.visitCount) * 10) / 10,
      lastVisited: p.lastVisited,
      photoUrl: p.photos[0],
    }))
    .sort((a, b) => b.lastVisited.localeCompare(a.lastVisited));
}

/**
 * Aggregates all menu items/dishes reviewed across user journals,
 * sorted by date descending.
 */
export function aggregateLoggedDishes(journals: Journal[]): LoggedDish[] {
  const dishes: LoggedDish[] = [];
  for (const j of journals) {
    const date = j.visitedAt || j.createdAt;
    for (const m of j.menuItems) {
      dishes.push({
        id: `${j.id}_${m.id}`,
        journalId: j.id,
        dishName: m.name,
        price: m.price,
        category: m.category,
        rating: m.rating,
        isRecommended: m.isRecommended,
        photoUrl: m.photoUrl || (j.photoUrls.length > 0 ? j.photoUrls[0] : undefined),
        notes: m.notes,
        placeName: j.placeName,
        placeId: j.placeId,
        date,
      });
    }
  }
  return dishes.sort((a, b) => b.date.localeCompare(a.date));
}
