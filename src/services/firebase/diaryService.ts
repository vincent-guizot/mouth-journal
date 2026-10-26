import { Journal } from '../../models/journal';
import { WishlistItem, CulinaryStats } from '../../types/diary';
import { journalRepository, wishlistRepository } from '../../repositories';
import { MOCK_JOURNALS, MOCK_WISHLIST } from '../../mocks/data';

export class DiaryService {
  /**
   * Mengambil semua entri catatan diary privat milik pengguna
   */
  static async getMyDiaries(userId: string): Promise<Journal[]> {
    try {
      const journals = await journalRepository.getJournals(userId);
      if (journals && journals.length > 0) return journals;

      // Hanya kembalikan sampel awal jika pengguna belum memiliki catatan dan di mode __DEV__
      if (__DEV__) {
        return MOCK_JOURNALS;
      }
      return [];
    } catch (error) {
      console.error('[DiaryService] Gagal membaca diary:', error);
      return __DEV__ ? MOCK_JOURNALS : [];
    }
  }

  /**
   * Menyimpan entri diary baru
   */
  static async saveDiary(entry: Omit<Journal, 'id'>): Promise<Journal> {
    try {
      return await journalRepository.createJournal(entry.userId, entry);
    } catch (error) {
      console.error('[DiaryService] Gagal menyimpan diary:', error);
      throw error;
    }
  }

  /**
   * Memperbarui entri diary yang ada
   */
  static async updateDiary(userId: string, journalId: string, updates: Partial<Journal>): Promise<Journal> {
    try {
      return await journalRepository.updateJournal(userId, journalId, updates);
    } catch (error) {
      console.error('[DiaryService] Gagal memperbarui diary:', error);
      throw error;
    }
  }

  /**
   * Menghapus entri diary
   */
  static async deleteDiary(userId: string, diaryId: string): Promise<void> {
    try {
      await journalRepository.deleteJournal(userId, diaryId);
    } catch (error) {
      console.error('[DiaryService] Gagal menghapus diary:', error);
      throw error;
    }
  }

  /**
   * Mengambil daftar wishlist pengguna
   */
  static async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const list = await wishlistRepository.getWishlist(userId);
      if (list && list.length > 0) return list as unknown as WishlistItem[];
      return __DEV__ ? (MOCK_WISHLIST as unknown as WishlistItem[]) : [];
    } catch (error) {
      console.error('[DiaryService] Gagal membaca wishlist:', error);
      return __DEV__ ? (MOCK_WISHLIST as unknown as WishlistItem[]) : [];
    }
  }

  /**
   * Menambahkan ke Wishlist
   */
  static async addToWishlist(
    userIdOrItem: string | (Omit<WishlistItem, 'id' | 'createdAt'> & { userId: string }),
    maybeItem?: Omit<WishlistItem, 'id' | 'createdAt'>
  ): Promise<WishlistItem> {
    try {
      const userId = typeof userIdOrItem === 'string' ? userIdOrItem : userIdOrItem.userId;
      const item = typeof userIdOrItem === 'string' ? maybeItem! : userIdOrItem;

      const added = await wishlistRepository.addToWishlist(userId, {
        placeId: item.placeName,
        placeName: item.placeName,
        placeAddress: item.address,
        mainCategory: item.mainCategory,
        subCategory: item.subCategory,
        latitude: item.latitude,
        longitude: item.longitude,
        personalNotes: item.notes,
      });
      return added as unknown as WishlistItem;
    } catch (error) {
      console.error('[DiaryService] Gagal menambah ke wishlist:', error);
      throw error;
    }
  }

  /**
   * Menghapus dari Wishlist
   */
  static async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    try {
      await wishlistRepository.removeFromWishlist(userId, itemId);
    } catch (error) {
      console.error('[DiaryService] Gagal menghapus wishlist:', error);
      throw error;
    }
  }

  /**
   * Menghitung statistik kuliner pengguna
   */
  static calculateStats(diaries: Journal[]): CulinaryStats {
    const totalVisits = diaries.length;
    const totalSpent = diaries.reduce((acc, d) => acc + (d.totalSpent || 0), 0);
    const uniquePlaces = new Set(diaries.map((d) => d.placeName)).size;

    const categoryCounts: Record<string, number> = {};
    let totalRating = 0;
    let ratedCount = 0;

    let foodCount = 0;
    let drinksCount = 0;
    let wisataCount = 0;

    diaries.forEach((d) => {
      const cat = d.subCategoryLabel || d.subCategory || 'Lainnya';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      if (d.overallRating) {
        totalRating += d.overallRating;
        ratedCount++;
      }

      if (d.mainCategory === 'food') foodCount++;
      else if (d.mainCategory === 'drinks') drinksCount++;
      else if (d.mainCategory === 'wisata') wisataCount++;
    });

    let favoriteCategory = 'Kopi/Cafe';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    });

    const averageRating = ratedCount > 0 ? Math.round((totalRating / ratedCount) * 10) / 10 : 0;

    return {
      totalVisits,
      totalSpent,
      totalPlaces: uniquePlaces,
      favoriteCategory,
      averageRating,
      foodCount,
      drinksCount,
      wisataCount,
    };
  }
}
