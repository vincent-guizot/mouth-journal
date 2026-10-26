import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../config/firebase';
import { Journal } from '../../models/journal';
import { JournalSchema } from '../../schemas/journalSchema';
import { IJournalRepository } from './IJournalRepository';

const getCacheKey = (userId: string) => `@mouthjournal_cache_${userId}_journals`;

export class FirestoreJournalRepository implements IJournalRepository {
  /**
   * Mengambil semua jurnal milik userId dari /users/{userId}/journals
   */
  async getJournals(userId: string): Promise<Journal[]> {
    if (!userId) throw new Error('User ID diperlukan untuk mengambil jurnal.');

    // 1. Coba ambil dari Firestore jika terkonfigurasi
    if (isFirebaseConfigured && db) {
      try {
        const journalsRef = collection(db, 'users', userId, 'journals');
        const q = query(journalsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const remoteJournals: Journal[] = [];
        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };
          const parsed = JournalSchema.safeParse(data);
          if (parsed.success) {
            remoteJournals.push(parsed.data);
          }
        });

        // Simpan ke cache lokal terisolasi khusus userId ini
        await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(remoteJournals));
        return remoteJournals;
      } catch (err) {
        console.warn(`[JournalRepository] Gagal mengambil dari Firestore untuk user ${userId}, membaca cache:`, err);
      }
    }

    // 2. Baca dari cache lokal terisolasi
    const cached = await AsyncStorage.getItem(getCacheKey(userId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }

    return [];
  }

  /**
   * Mengambil satu jurnal berdasarkan ID
   */
  async getJournalById(userId: string, journalId: string): Promise<Journal | null> {
    if (!userId || !journalId) return null;

    if (isFirebaseConfigured && db) {
      try {
        const journalRef = doc(db, 'users', userId, 'journals', journalId);
        const docSnap = await getDoc(journalRef);
        if (docSnap.exists()) {
          const parsed = JournalSchema.safeParse({ id: docSnap.id, ...docSnap.data() });
          if (parsed.success) return parsed.data;
        }
      } catch (err) {
        console.warn(`[JournalRepository] Gagal getDoc Firestore ${journalId}:`, err);
      }
    }

    // Fallback baca dari cache lokal
    const all = await this.getJournals(userId);
    return all.find((j) => j.id === journalId) || null;
  }

  /**
   * Membuat jurnal baru di subkoleksi privat /users/{userId}/journals/{newId}
   */
  async createJournal(userId: string, journalInput: Omit<Journal, 'id'>): Promise<Journal> {
    if (!userId) throw new Error('User ID wajib untuk membuat jurnal.');

    const newId = `journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullJournal: Journal = {
      ...journalInput,
      id: newId,
      userId,
      createdAt: journalInput.createdAt || new Date().toISOString(),
    };

    // Validasi skema
    const validated = JournalSchema.parse(fullJournal);

    if (isFirebaseConfigured && db) {
      const journalRef = doc(db, 'users', userId, 'journals', newId);
      await setDoc(journalRef, validated);
    }

    // Perbarui cache lokal user ini
    const existing = await this.getJournals(userId);
    const updated = [validated, ...existing.filter((j) => j.id !== newId)];
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(updated));

    return validated;
  }

  /**
   * Memperbarui jurnal yang ada
   */
  async updateJournal(userId: string, journalId: string, updates: Partial<Journal>): Promise<Journal> {
    if (!userId || !journalId) throw new Error('User ID dan Journal ID diperlukan.');

    const existing = await this.getJournalById(userId, journalId);
    if (!existing) throw new Error(`Jurnal ${journalId} tidak ditemukan.`);

    const merged: Journal = {
      ...existing,
      ...updates,
      id: journalId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    const validated = JournalSchema.parse(merged);

    if (isFirebaseConfigured && db) {
      const journalRef = doc(db, 'users', userId, 'journals', journalId);
      await updateDoc(journalRef, validated as any);
    }

    const all = await this.getJournals(userId);
    const updatedList = all.map((j) => (j.id === journalId ? validated : j));
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(updatedList));

    return validated;
  }

  /**
   * Menghapus jurnal
   */
  async deleteJournal(userId: string, journalId: string): Promise<void> {
    if (!userId || !journalId) return;

    if (isFirebaseConfigured && db) {
      const journalRef = doc(db, 'users', userId, 'journals', journalId);
      await deleteDoc(journalRef);
    }

    const all = await this.getJournals(userId);
    const filtered = all.filter((j) => j.id !== journalId);
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(filtered));
  }

  /**
   * Membersihkan seluruh cache lokal milik user ini saat sign out
   */
  async clearUserCache(userId: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.removeItem(getCacheKey(userId));
  }
}
