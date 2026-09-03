/**
 * Key/value persistence, web + fallback flavour. Metro picks storage.native.ts
 * on iOS/Android (expo-sqlite kv-store); this file serves web and TypeScript.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota): stay in memory.
  }
}
