import { DiaryEntry } from '../../../types/diary';
import { DiarySegment } from '../constants/diaryConstants';

export function filterDiaryEntries(
  entries: DiaryEntry[],
  segment: DiarySegment,
  category: string,
  searchQuery: string
): DiaryEntry[] {
  const query = searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    // 1. Segment filter (Favorites = rating >= 4.5)
    if (segment === 'favorites' && entry.overallRating < 4.5) {
      return false;
    }

    // 2. Category filter
    if (category !== 'all') {
      if (category === 'kopi' && entry.mainCategory !== 'drinks') return false;
      if (category === 'restoran' && entry.mainCategory !== 'food') return false;
      if (
        category === 'dessert' &&
        !entry.tags?.some((t) => t.toLowerCase().includes('dessert'))
      ) {
        return false;
      }
      if (
        category === 'street_food' &&
        !entry.tags?.some((t) => t.toLowerCase().includes('street'))
      ) {
        return false;
      }
    }

    // 3. Search query filter
    if (query) {
      const matchPlace = entry.placeName.toLowerCase().includes(query);
      const matchReview = (entry.reviewText || '').toLowerCase().includes(query);
      const matchTag = entry.tags?.some((t) => t.toLowerCase().includes(query));
      const matchMenu = entry.menuItems?.some((m) => m.name.toLowerCase().includes(query));

      if (!matchPlace && !matchReview && !matchTag && !matchMenu) {
        return false;
      }
    }

    return true;
  });
}
