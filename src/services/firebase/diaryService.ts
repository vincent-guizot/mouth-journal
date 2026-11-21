import { Journal } from '../../models/journal';
import { CulinaryStats } from '../../types/diary';

/**
 * Pure statistics over the user's real journals. Data access goes through the
 * repositories directly (no mock fallbacks, no swallowed errors).
 */
export class DiaryService {
  static calculateStats(diaries: Journal[]): CulinaryStats {
    const categoryCounts: Record<string, number> = {};
    let foodCount = 0;
    let drinksCount = 0;
    let wisataCount = 0;
    for (const d of diaries) {
      const cat = d.subCategoryLabel || d.subCategory;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (d.mainCategory === 'food') foodCount++;
      else if (d.mainCategory === 'drinks') drinksCount++;
      else wisataCount++;
    }
    let favoriteCategory: string | null = null;
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    }
    const averageRating =
      diaries.length > 0
        ? Math.round((diaries.reduce((acc, d) => acc + d.overallRating, 0) / diaries.length) * 10) / 10
        : null;
    return {
      totalVisits: diaries.length,
      totalSpent: diaries.reduce((acc, d) => acc + d.totalSpent, 0),
      // Unique by real place ID, not by name (two branches can share a name).
      totalPlaces: new Set(diaries.map((d) => d.placeId)).size,
      favoriteCategory,
      averageRating,
      foodCount,
      drinksCount,
      wisataCount,
    };
  }
}
