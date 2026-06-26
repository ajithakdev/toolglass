import { useState, useEffect, useCallback } from 'react';

const RECENT_TOOLS_KEY = 'toolglass_recent_tools';
const MAX_RECENTS = 3;

export function useRecentTools() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_TOOLS_KEY);
      if (stored) {
        setRecents(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent tools', e);
    }
  }, []);

  const addRecent = useCallback((slug: string) => {
    setRecents(prev => {
      const filtered = prev.filter(s => s !== slug);
      const updated = [slug, ...filtered].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recents, addRecent };
}
