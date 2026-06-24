import { useCallback, useEffect, useState } from 'react';

const STATS_KEY = 'toolglass_stats';
const TELEMETRY_KEY = 'toolglass_telemetry_enabled';

export function useToolStats(slug?: string) {
  const [count, setCount] = useState<number>(0);
  const [allStats, setAllStats] = useState<Record<string, number>>({});
  const [enabled, setEnabled] = useState<boolean>(true);

  const load = useCallback(() => {
    try {
      const isEnabled = localStorage.getItem(TELEMETRY_KEY) !== 'false';
      setEnabled(isEnabled);

      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAllStats(parsed);
        if (slug && typeof parsed[slug] === 'number') {
          setCount(parsed[slug]);
        }
      } else {
        setAllStats({});
        setCount(0);
      }
    } catch {
      // ignore
    }
  }, [slug]);

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    // Custom event to sync across same-window components
    window.addEventListener('toolglass-telemetry', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('toolglass-telemetry', load);
    };
  }, [load]);

  const toggleTelemetry = useCallback(() => {
    let nextState = false;
    setEnabled(e => {
      nextState = !e;
      localStorage.setItem(TELEMETRY_KEY, String(nextState));
      if (!nextState) {
        localStorage.removeItem(STATS_KEY);
      }
      return nextState;
    });
    setTimeout(() => window.dispatchEvent(new Event('toolglass-telemetry')), 0);
  }, []);

  const increment = useCallback(() => {
    if (!slug) return;
    
    setCount((c) => {
      // Re-check inside set state to avoid stale closure if disabled
      if (localStorage.getItem(TELEMETRY_KEY) === 'false') return c;

      const next = c + 1;
      try {
        const stored = localStorage.getItem(STATS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[slug] = next;
        localStorage.setItem(STATS_KEY, JSON.stringify(parsed));
        setAllStats(parsed);
        setTimeout(() => window.dispatchEvent(new Event('toolglass-telemetry')), 0);
      } catch {
        // ignore
      }
      return next;
    });
  }, [slug]);

  return { count, allStats, increment, enabled, toggleTelemetry };
}
