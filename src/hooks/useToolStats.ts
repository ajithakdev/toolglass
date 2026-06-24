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
    setEnabled(e => {
      const next = !e;
      localStorage.setItem(TELEMETRY_KEY, String(next));
      if (!next) {
        localStorage.removeItem(STATS_KEY);
      }
      window.dispatchEvent(new Event('toolglass-telemetry'));
      return next;
    });
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
        window.dispatchEvent(new Event('toolglass-telemetry'));
      } catch {
        // ignore
      }
      return next;
    });
  }, [slug]);

  return { count, allStats, increment, enabled, toggleTelemetry };
}
