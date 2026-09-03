import Storage from 'expo-sqlite/kv-store';

/** Native flavour of storage.ts: SQLite-backed key/value store shipped with expo-sqlite (in Expo Go). */
export async function getItem(key: string): Promise<string | null> {
  return Storage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  await Storage.setItem(key, value);
}
