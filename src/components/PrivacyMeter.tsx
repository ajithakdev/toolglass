import { useThirdPartyCount } from '../hooks/useThirdPartyCount';

// A fact, not a claim: read from the browser's own resource timing log
export function PrivacyMeter() {
  const count = useThirdPartyCount();

  if (count === null) {
    return <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>This browser can't count network requests</span>;
  }
  const clean = count === 0;
  return (
    <span
      role="status"
      title="Counted live by your browser (Resource Timing API). Requests you send yourself in the API Tester count too."
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--t-xs)', color: 'var(--ink-soft)' }}
    >
      <span aria-hidden className="status-dot" style={{ '--dot': clean ? 'var(--status-success)' : 'var(--status-warn)' } as React.CSSProperties} />
      <span className="num">
        {count} {count === 1 ? 'request' : 'requests'} to other servers from this tab
      </span>
    </span>
  );
}
