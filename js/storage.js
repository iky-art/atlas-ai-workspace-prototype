export const STORAGE_KEYS = {
  sessions: 'atlas_sessions',
  activeSession: 'atlas_active_session',
  theme: 'atlas_theme',
  settings: 'atlas_settings',
  auth: 'atlas_auth',
};

/**
 * Reads and JSON-parses a key from localStorage. Returns `fallback` if the
 * key is missing, empty, or the stored value is corrupted (invalid JSON) —
 * never throws.
 */
export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[atlas/storage] Failed to read "${key}", using fallback.`, error);
    return fallback;
  }
}

/**
 * Serializes and writes a value to localStorage. Returns true on success,
 * false if storage is unavailable or full — never throws.
 */
export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[atlas/storage] Failed to write "${key}".`, error);
    return false;
  }
}

export function readString(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    console.warn(`[atlas/storage] Failed to read "${key}".`, error);
    return fallback;
  }
}

export function writeString(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[atlas/storage] Failed to write "${key}".`, error);
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[atlas/storage] Failed to remove "${key}".`, error);
  }
}

export function clearAtlasData() {
  Object.values(STORAGE_KEYS).forEach(removeKey);
}
