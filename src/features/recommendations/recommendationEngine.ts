import { Journal } from '../../models/journal';
import { NearbyPlace } from '../../types/places';
import { FoodPreferences } from '../../models/preferences';
import { formatDistance } from '../../utils/geo';

export interface CategoryStat {
  category: string;
  count: number;
  avgRating: number;
}

export interface TasteProfile {
  totalJournals: number;
  topCategories: CategoryStat[];
  favoriteCategoryNames: string[];
  averageSpend: number | null;
  budgetLabel: string;
  personaTitle: string;
  personaDescription: string;
}

export interface RecommendationItem {
  place: NearbyPlace;
  matchScore: number;
  matchReasons: string[];
  primaryReason: string;
  isAlreadyVisited: boolean;
  isInWishlist: boolean;
}

export interface RankRecommendationsOptions {
  tasteProfile: TasteProfile;
  nearbyPlaces: NearbyPlace[];
  visitedPlaceIds?: Set<string>;
  wishlistPlaceIds?: Set<string>;
}

/**
 * Builds a deterministic, truthful Taste Profile from actual user journals
 * and preferences. Does not hallucinate categories or ratings.
 */
export function buildTasteProfile(
  journals: Journal[],
  preferences?: FoodPreferences
): TasteProfile {
  const favoriteCategoryNames = preferences?.favoriteCategories ?? [];
  const budgetLabel = preferences?.budgetPerVisit ?? 'Sesuai Jurnal';

  if (!journals || journals.length === 0) {
    return {
      totalJournals: 0,
      topCategories: [],
      favoriteCategoryNames,
      averageSpend: null,
      budgetLabel,
      personaTitle: 'Penjelajah Rasa Baru',
      personaDescription:
        'Belum ada riwayat kunjungan jurnal. Catat tempat kulinermu untuk membentuk profil rasa personal!',
    };
  }

  // Aggregate category frequency and ratings
  const categoryMap = new Map<string, { count: number; ratingSum: number }>();
  let totalSpentSum = 0;
  let spentCount = 0;

  for (const j of journals) {
    const cat = j.subCategoryLabel || j.subCategory || j.mainCategory || 'Lainnya';
    const entry = categoryMap.get(cat) ?? { count: 0, ratingSum: 0 };
    entry.count += 1;
    entry.ratingSum += j.overallRating;
    categoryMap.set(cat, entry);

    if (j.totalSpent && j.totalSpent > 0) {
      totalSpentSum += j.totalSpent;
      spentCount += 1;
    }
  }

  const topCategories: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([category, { count, ratingSum }]) => ({
      category,
      count,
      avgRating: Math.round((ratingSum / count) * 10) / 10,
    }))
    .sort((a, b) => b.count * 2 + b.avgRating - (a.count * 2 + a.avgRating));

  const averageSpend = spentCount > 0 ? Math.round(totalSpentSum / spentCount) : null;

  // Determine Persona
  const primaryCat = topCategories[0]?.category.toLowerCase() ?? '';
  let personaTitle = 'Kritikus Kuliner Handal';
  if (primaryCat.includes('kopi') || primaryCat.includes('cafe')) {
    personaTitle = 'Penikmat Kopi & Suasana Senja';
  } else if (primaryCat.includes('bakery') || primaryCat.includes('dessert') || primaryCat.includes('roti')) {
    personaTitle = 'Pencinta Dessert & Artisan Pastry';
  } else if (primaryCat.includes('nusantara') || primaryCat.includes('tradisional') || primaryCat.includes('warung')) {
    personaTitle = 'Penjelajah Kuliner Nusantara Sejati';
  } else if (primaryCat.includes('restoran') || primaryCat.includes('dining')) {
    personaTitle = 'Pencari Rasa & Santapan Pilihan';
  } else if (topCategories[0]) {
    personaTitle = `Pencinta ${topCategories[0].category}`;
  }

  const topNames = topCategories.slice(0, 2).map((c) => c.category).join(' & ');
  const avgOverallRating = Math.round(
    (journals.reduce((sum, j) => sum + j.overallRating, 0) / journals.length) * 10
  ) / 10;

  const personaDescription = `Berdasarkan ${journals.length} catatan jurnalmu, kamu paling sering mengunjungi tempat kategori ${topNames} dengan rata-rata penilaian ${avgOverallRating}⭐.`;

  return {
    totalJournals: journals.length,
    topCategories,
    favoriteCategoryNames,
    averageSpend,
    budgetLabel: averageSpend ? `Rp ${averageSpend.toLocaleString('id-ID')}` : budgetLabel,
    personaTitle,
    personaDescription,
  };
}

/**
 * Ranks real nearby OpenStreetMap places against user's taste profile.
 * High affinity places receive honest explanation tags and top scores.
 */
export function rankRecommendations(options: RankRecommendationsOptions): RecommendationItem[] {
  const { tasteProfile, nearbyPlaces, visitedPlaceIds = new Set(), wishlistPlaceIds = new Set() } = options;

  const topCategoryNames = tasteProfile.topCategories.map((c) => c.category.toLowerCase());

  const scored: RecommendationItem[] = nearbyPlaces.map((place) => {
    let matchScore = 65;
    const matchReasons: string[] = [];

    const placeSub = (place.subCategoryLabel || place.subCategory || '').toLowerCase();

    const isAlreadyVisited = visitedPlaceIds.has(place.id);
    const isInWishlist = wishlistPlaceIds.has(place.id);

    // 1. Check match with user's top categories
    if (topCategoryNames.length > 0) {
      const topFirst = topCategoryNames[0];
      if (placeSub.includes(topFirst) || topFirst.includes(placeSub)) {
        matchScore += 22;
        matchReasons.push(`Cocok dengan kategori favorit utamamu: ${tasteProfile.topCategories[0].category}`);
      } else {
        const otherMatch = tasteProfile.topCategories.find(
          (c) => placeSub.includes(c.category.toLowerCase()) || c.category.toLowerCase().includes(placeSub)
        );
        if (otherMatch) {
          matchScore += 14;
          matchReasons.push(`Cocok dengan selera kulinermu: ${otherMatch.category}`);
        }
      }
    }

    // 2. Check match with food preferences
    const prefMatch = tasteProfile.favoriteCategoryNames.find((p) =>
      placeSub.includes(p.toLowerCase()) || p.toLowerCase().includes(placeSub)
    );
    if (prefMatch) {
      matchScore += 10;
      matchReasons.push(`Sesuai preferensi pilihanmu (${prefMatch})`);
    }

    // 3. Proximity / Distance bonus
    if (place.distanceMeter !== undefined) {
      if (place.distanceMeter <= 1500) {
        matchScore += 8;
        matchReasons.push(`Sangat dekat (${formatDistance(place.distanceMeter)})`);
      } else if (place.distanceMeter <= 3000) {
        matchScore += 4;
        matchReasons.push(`Terjangkau dalam radius ${formatDistance(place.distanceMeter)}`);
      }
    }

    // 4. Tags / Cuisine bonus
    if (place.cuisine) {
      matchScore += 5;
      matchReasons.push(`Menyajikan kuliner khas ${place.cuisine}`);
    }

    // 5. Visited status adjustment
    if (isAlreadyVisited) {
      matchScore -= 18;
      matchReasons.push('Pernah kamu kunjungi sebelumnya');
    }

    // 6. Wishlist status
    if (isInWishlist) {
      matchScore += 6;
      matchReasons.push('Ada di wishlist tempatmu');
    }

    // Clamp score between 55 and 99
    matchScore = Math.max(55, Math.min(99, Math.round(matchScore)));

    const primaryReason =
      matchReasons.find((r) => r.startsWith('Cocok') || r.startsWith('Sesuai')) ||
      matchReasons[0] ||
      'Rekomendasi kuliner menarik di sekitarmu';

    return {
      place,
      matchScore,
      matchReasons,
      primaryReason,
      isAlreadyVisited,
      isInWishlist,
    };
  });

  // Sort: unvisited places first, then higher matchScore, then closer distance
  return scored.sort((a, b) => {
    if (a.isAlreadyVisited !== b.isAlreadyVisited) {
      return a.isAlreadyVisited ? 1 : -1;
    }
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (a.place.distanceMeter ?? 99999) - (b.place.distanceMeter ?? 99999);
  });
}

/**
 * Optional Gemini AI summary. Falls back transparently to deterministic
 * tasteProfile persona description when API key is unset or network fails.
 */
export async function generateAITasteSummary(
  tasteProfile: TasteProfile,
  apiKey?: string
): Promise<string> {
  if (!apiKey || tasteProfile.totalJournals === 0) {
    return tasteProfile.personaDescription;
  }

  const prompt = `Sebagai pakar kuliner AI, berikan analisis selera rasa personal singkat (maksimal 2 kalimat, gaya hangat dan ramah dalam bahasa Indonesia) untuk pengguna dengan profil:
- Total kunjungan: ${tasteProfile.totalJournals} tempat
- Kategori teratas: ${tasteProfile.topCategories.map((c) => `${c.category} (rata-rata rating ${c.avgRating}⭐)`).join(', ')}
- Rata-rata pengeluaran: ${tasteProfile.budgetLabel}
- Persona: ${tasteProfile.personaTitle}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!res.ok) return tasteProfile.personaDescription;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : tasteProfile.personaDescription;
  } catch {
    return tasteProfile.personaDescription;
  }
}
