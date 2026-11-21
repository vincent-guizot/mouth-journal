import { Journal } from '../../models/journal';
import { WishlistItem } from '../../models/wishlist';
import { AppSettings } from '../../models/preferences';
import { UserProfile } from '../../models/user';

export interface ExportArchive {
  version: 1;
  exportedAt: string;
  user: Pick<UserProfile, 'uid' | 'email' | 'displayName'>;
  stats: { totalJournals: number; totalWishlistItems: number; totalSpent: number };
  journals: Journal[];
  wishlist: WishlistItem[];
  settings: AppSettings;
}

/**
 * Builds the user's export. Rejects (throws) if any record does not belong to the
 * user instead of silently filtering — that would indicate a cache/ownership bug.
 */
export const buildExportArchive = (
  user: Pick<UserProfile, 'uid' | 'email' | 'displayName'>,
  journals: Journal[],
  wishlist: WishlistItem[],
  settings: AppSettings,
  now: Date = new Date()
): ExportArchive => {
  const foreign = [...journals, ...wishlist].filter((r) => r.userId !== user.uid);
  if (foreign.length > 0) {
    throw new Error(`${foreign.length} data bukan milik akun ini; ekspor dibatalkan.`);
  }
  return {
    version: 1,
    exportedAt: now.toISOString(),
    user: { uid: user.uid, email: user.email, displayName: user.displayName },
    stats: {
      totalJournals: journals.length,
      totalWishlistItems: wishlist.length,
      totalSpent: journals.reduce((sum, j) => sum + j.totalSpent, 0),
    },
    journals,
    wishlist,
    settings,
  };
};
