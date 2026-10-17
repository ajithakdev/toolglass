import { useEffect, useState } from 'react';
import { countThirdParty } from '../lib/privacy';

/**
 * Live count of requests this tab has sent to other origins (Resource Timing API).
 * null when the browser can't measure it, so we never show an unproven zero.
 */
export function useThirdPartyCount(): number | null {
  const supported = typeof PerformanceObserver !== 'undefined' && typeof performance?.getEntriesByType === 'function';
  const [count, setCount] = useState<number | null>(supported ? 0 : null);
  useEffect(() => {
    if (!supported) return;
    const all = new Set<PerformanceEntry>(performance.getEntriesByType('resource'));
    const update = () => setCount(countThirdParty([...all], location.origin));
    update();
    const obs = new PerformanceObserver((list) => {
      list.getEntries().forEach((e) => all.add(e));
      update();
    });
    obs.observe({ type: 'resource', buffered: true });
    return () => obs.disconnect();
  }, [supported]);
  return count;
}
