import { useCallback, useEffect, useState } from 'react';

const STATS_KEY = 'toolglass_stats';

export function useToolStats(slug: string) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed[slug] === 'number') {
          setCount(parsed[slug]);
        }
      }
    } catch {
      // ignore
    }
  }, [slug]);

  const increment = useCallback(() => {
    setCount((c) => {
      const next = c + 1;
      try {
        const stored = localStorage.getItem(STATS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[slug] = next;
        localStorage.setItem(STATS_KEY, JSON.stringify(parsed));
      } catch {
        // ignore
      }
      return next;
    });
  }, [slug]);

  return { count, increment };
}
