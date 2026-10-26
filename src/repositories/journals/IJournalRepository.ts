import { Journal } from '../../models/journal';

export interface IJournalRepository {
  /**
   * Mengambil seluruh jurnal milik pengguna tertentu
   */
  getJournals(userId: string): Promise<Journal[]>;

  /**
   * Mengambil jurnal spesifik berdasarkan ID (dengan verifikasi kepemilikan)
   */
  getJournalById(userId: string, journalId: string): Promise<Journal | null>;

  /**
   * Menyimpan jurnal baru ke koleksi privat pengguna
   */
  createJournal(userId: string, journal: Omit<Journal, 'id'>): Promise<Journal>;

  /**
   * Memperbarui jurnal yang sudah ada milik pengguna
   */
  updateJournal(userId: string, journalId: string, updates: Partial<Journal>): Promise<Journal>;

  /**
   * Menghapus jurnal milik pengguna
   */
  deleteJournal(userId: string, journalId: string): Promise<void>;

  /**
   * Membersihkan cache lokal saat pengguna sign out
   */
  clearUserCache(userId: string): Promise<void>;
}
