/**
 * Minimal subset of the AsyncStorage API used by repositories. Repositories depend
 * on this interface (not on AsyncStorage directly) so they can run in Node tests
 * against a real in-memory store while production uses AsyncStorage.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}

/** In-memory implementation with AsyncStorage semantics (string values only). */
export const createMemoryKeyValueStore = (): KeyValueStore & { dump(): Record<string, string> } => {
  const data = new Map<string, string>();
  return {
    async getItem(key) {
      return data.has(key) ? (data.get(key) as string) : null;
    },
    async setItem(key, value) {
      if (typeof value !== 'string') throw new TypeError('KeyValueStore only accepts string values');
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
    async getAllKeys() {
      return Array.from(data.keys());
    },
    dump() {
      return Object.fromEntries(data.entries());
    },
  };
};

/** All per-user keys share this prefix so a user's local data can be wiped precisely. */
export const userKeyPrefix = (userId: string) => `@mouthjournal_cache_${userId}_`;

export const clearAllUserKeys = async (kv: KeyValueStore, userId: string): Promise<number> => {
  if (!userId) throw new Error('User ID wajib untuk membersihkan cache.');
  const prefix = userKeyPrefix(userId);
  const keys = (await kv.getAllKeys()).filter((k) => k.startsWith(prefix));
  for (const key of keys) await kv.removeItem(key);
  return keys.length;
};
