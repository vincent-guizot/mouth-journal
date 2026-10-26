import AsyncStorage from '@react-native-async-storage/async-storage';
import { Journal } from '../../models/journal';
import { IJournalRepository } from '../../repositories/journals/IJournalRepository';
import { MOCK_JOURNALS } from '../data/mockJournals';

const getStorageKey = (userId: string) => `@mouthjournal_mock_${userId}_journals`;

export class MockJournalRepository implements IJournalRepository {
  private inMemoryJournals: Map<string, Journal[]> = new Map();

  private async loadUserJournals(userId: string): Promise<Journal[]> {
    if (this.inMemoryJournals.has(userId)) {
      return this.inMemoryJournals.get(userId)!;
    }

    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.inMemoryJournals.set(userId, parsed);
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    // Default mock data initialized for this user
    const defaultData = MOCK_JOURNALS.map((j) => ({ ...j, userId }));
    this.inMemoryJournals.set(userId, defaultData);
    return defaultData;
  }

  private async persistUserJournals(userId: string, journals: Journal[]): Promise<void> {
    this.inMemoryJournals.set(userId, journals);
    try {
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(journals));
    } catch {
      // Ignore in mock environment
    }
  }

  async getJournals(userId: string): Promise<Journal[]> {
    if (!userId) return [];
    return this.loadUserJournals(userId);
  }

  async getJournalById(userId: string, journalId: string): Promise<Journal | null> {
    const list = await this.loadUserJournals(userId);
    return list.find((j) => j.id === journalId) ?? null;
  }

  async createJournal(userId: string, journalData: Omit<Journal, 'id'>): Promise<Journal> {
    const list = await this.loadUserJournals(userId);
    const newJournal: Journal = {
      ...journalData,
      id: `mock-journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: journalData.createdAt || new Date().toISOString(),
    };

    const updated = [newJournal, ...list];
    await this.persistUserJournals(userId, updated);
    return newJournal;
  }

  async updateJournal(userId: string, journalId: string, updates: Partial<Journal>): Promise<Journal> {
    const list = await this.loadUserJournals(userId);
    const index = list.findIndex((j) => j.id === journalId);

    if (index === -1) {
      throw new Error(`Jurnal dengan ID ${journalId} tidak ditemukan.`);
    }

    const updatedJournal: Journal = {
      ...list[index],
      ...updates,
      id: journalId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...list];
    updatedList[index] = updatedJournal;
    await this.persistUserJournals(userId, updatedList);
    return updatedJournal;
  }

  async deleteJournal(userId: string, journalId: string): Promise<void> {
    const list = await this.loadUserJournals(userId);
    const filtered = list.filter((j) => j.id !== journalId);
    await this.persistUserJournals(userId, filtered);
  }

  async clearUserCache(userId: string): Promise<void> {
    this.inMemoryJournals.delete(userId);
    try {
      await AsyncStorage.removeItem(getStorageKey(userId));
    } catch {
      // Ignore
    }
  }
}
