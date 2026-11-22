import { Journal } from '../../models/journal';

export interface CategorySpendStat {
  category: 'food' | 'drinks' | 'wisata';
  label: string;
  count: number;
  spent: number;
  percentage: number;
  color: string;
}

export interface MonthlyDigest {
  monthKey: string;
  monthLabel: string;
  totalSpent: number;
  totalVisits: number;
  averageSpentPerVisit: number;
  uniquePlacesCount: number;
  averageRating: number | null;
  categories: CategorySpendStat[];
  topPlaces: {
    placeId: string;
    placeName: string;
    visitCount: number;
    totalSpent: number;
    averageRating: number;
  }[];
  topDishes: {
    name: string;
    placeName: string;
    price: number;
    rating?: number;
  }[];
}

/**
 * Extracts unique year-month strings from journals, e.g. ['2026-11', '2026-10'] sorted descending.
 */
export function extractAvailableMonths(journals: Journal[]): string[] {
  const set = new Set<string>();
  for (const j of journals) {
    const d = j.visitedAt || j.createdAt;
    if (d && d.length >= 7) {
      set.add(d.slice(0, 7)); // 'YYYY-MM'
    }
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

/**
 * Converts 'YYYY-MM' to human readable Indonesian label, e.g. 'November 2026'
 */
export function formatMonthLabel(monthKey: string): string {
  if (monthKey === 'all') return 'Semua Waktu';
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return monthKey;

  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/**
 * Calculates detailed spending and culinary habit analytics for a chosen month or all-time.
 */
export function calculateMonthlyDigest(journals: Journal[], monthKey: string): MonthlyDigest {
  const filtered =
    monthKey === 'all'
      ? journals
      : journals.filter((j) => {
          const d = j.visitedAt || j.createdAt;
          return d && d.startsWith(monthKey);
        });

  const totalSpent = filtered.reduce((acc, j) => acc + (j.totalSpent || 0), 0);
  const totalVisits = filtered.length;
  const averageSpentPerVisit = totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0;
  const uniquePlaces = new Set(filtered.map((j) => j.placeId));

  const totalRatingSum = filtered.reduce((acc, j) => acc + j.overallRating, 0);
  const averageRating =
    totalVisits > 0 ? Math.round((totalRatingSum / totalVisits) * 10) / 10 : null;

  // 1. Category breakdown
  let foodSpent = 0;
  let foodCount = 0;
  let drinksSpent = 0;
  let drinksCount = 0;
  let wisataSpent = 0;
  let wisataCount = 0;

  for (const j of filtered) {
    const spent = j.totalSpent || 0;
    if (j.mainCategory === 'drinks') {
      drinksSpent += spent;
      drinksCount += 1;
    } else if (j.mainCategory === 'wisata') {
      wisataSpent += spent;
      wisataCount += 1;
    } else {
      foodSpent += spent;
      foodCount += 1;
    }
  }

  const calcPct = (spent: number) =>
    totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

  const categories: CategorySpendStat[] = [
    {
      category: 'food',
      label: 'Makanan',
      count: foodCount,
      spent: foodSpent,
      percentage: calcPct(foodSpent),
      color: '#D04A1E', // Terracotta
    },
    {
      category: 'drinks',
      label: 'Minuman / Kafe',
      count: drinksCount,
      spent: drinksSpent,
      percentage: calcPct(drinksSpent),
      color: '#E67E22', // Amber
    },
    {
      category: 'wisata',
      label: 'Wisata Kuliner',
      count: wisataCount,
      spent: wisataSpent,
      percentage: calcPct(wisataSpent),
      color: '#3B7A57', // Sage / Forest Green
    },
  ];

  // 2. Top Places visited in this period
  const placeMap = new Map<
    string,
    { placeId: string; placeName: string; count: number; spent: number; totalRating: number }
  >();

  for (const j of filtered) {
    const existing = placeMap.get(j.placeId);
    if (!existing) {
      placeMap.set(j.placeId, {
        placeId: j.placeId,
        placeName: j.placeName,
        count: 1,
        spent: j.totalSpent || 0,
        totalRating: j.overallRating,
      });
    } else {
      existing.count += 1;
      existing.spent += j.totalSpent || 0;
      existing.totalRating += j.overallRating;
    }
  }

  const topPlaces = Array.from(placeMap.values())
    .map((p) => ({
      placeId: p.placeId,
      placeName: p.placeName,
      visitCount: p.count,
      totalSpent: p.spent,
      averageRating: Math.round((p.totalRating / p.count) * 10) / 10,
    }))
    .sort((a, b) => b.visitCount - a.visitCount || b.totalSpent - a.totalSpent)
    .slice(0, 3);

  // 3. Top Dishes in this period (highest rating or recommended)
  const allDishes: { name: string; placeName: string; price: number; rating?: number }[] = [];
  for (const j of filtered) {
    for (const m of j.menuItems) {
      allDishes.push({
        name: m.name,
        placeName: j.placeName,
        price: m.price,
        rating: m.rating,
      });
    }
  }

  const topDishes = allDishes
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return {
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    totalSpent,
    totalVisits,
    averageSpentPerVisit,
    uniquePlacesCount: uniquePlaces.size,
    averageRating,
    categories,
    topPlaces,
    topDishes,
  };
}
