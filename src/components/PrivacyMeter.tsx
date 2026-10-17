import { useEffect, useState } from 'react';
import { countThirdParty } from '../lib/privacy';

// A fact, not a claim: read from the browser's own resource timing log
export function PrivacyMeter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;
    const all = new Set<PerformanceEntry>(performance.getEntriesByType('resource'));
    const update = () => setCount(countThirdParty([...all], location.origin));
    update();
    const obs = new PerformanceObserver((list) => {
      list.getEntries().forEach((e) => all.add(e));
      update();
    });
    obs.observe({ type: 'resource', buffered: true });
    return () => obs.disconnect();
  }, []);

  const clean = count === 0;
  return (
    <span
      role="status"
      title="Counted live by your browser (Resource Timing API). Requests you send yourself in the API Tester count too."
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--t-xs)', color: 'var(--ink-soft)' }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: clean ? 'var(--status-success)' : 'var(--status-warn)',
          boxShadow: `0 0 0 3px color-mix(in srgb, ${clean ? 'var(--status-success)' : 'var(--status-warn)'} 20%, transparent)`,
        }}
      />
      <span className="num">
        {count} {count === 1 ? 'request' : 'requests'} to other servers from this tab
      </span>
    </span>
  );
}
