import { useSyncExternalStore } from 'react';

/**
 * A list of strings kept in localStorage and shared by every component that
 * reads it (one copy, so the header, hub, and cards never disagree).
 * Storage failures (private mode, quota) degrade to in-memory only.
 */
export function createListStore(key: string, max = Infinity) {
  const read = (): string[] => {
    try {
      const v = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : [];
    } catch {
      return [];
    }
  };
  let items = read();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const set = (next: string[]) => {
    items = [...new Set(next)].slice(0, max);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // keep in memory only
    }
    emit();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        items = read();
        emit();
      }
    });
  }

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  return {
    get: () => items,
    set,
    use: () => useSyncExternalStore(subscribe, () => items),
  };
}
