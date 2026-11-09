import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { parseUserAgent } from './user-agent';

interface ClientHints {
  brands: string;
  mobile: string;
  platform: string;
}

// Older browsers and the TypeScript DOM types do not always include this Chromium-only field.
interface WithClientHints {
  userAgentData?: {
    brands?: { brand: string; version: string }[];
    mobile?: boolean;
    platform?: string;
  };
}

/** Chromium only. Returns null on Safari and Firefox so the page renders no empty box. */
function readClientHints(): ClientHints | null {
  const data = (navigator as Navigator & WithClientHints).userAgentData;
  if (!data) return null;
  const brands = (data.brands ?? []).map((b) => `${b.brand} ${b.version}`.trim()).filter(Boolean).join(', ');
  return {
    brands: brands || 'unknown',
    mobile: data.mobile ? 'yes' : 'no',
    platform: data.platform || 'unknown',
  };
}

export default function UserAgentTool() {
  // Start from this browser's own string. The button below restores it after a paste.
  const [ua, setUa] = useState(() => navigator.userAgent);
  // Read once on first paint.
  const [hints] = useState(readClientHints);
  // The cards call the parser. The page itself does not decide browser, OS, or device.
  const info = useMemo(() => parseUserAgent(ua), [ua]);
  const rows: [string, string][] = [
    ['Browser', info.browser],
    ['Version', info.version],
    ['Engine', info.engine],
    ['Operating system', info.os],
    ['Device', info.device],
    ['Bot', info.bot ? 'yes' : 'no'],
  ];

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="User-agent string">
          <TextArea value={ua} onChange={(e) => setUa(e.target.value)} rows={6} placeholder="Paste a user-agent string" />
        </Field>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="soft" onClick={() => setUa(navigator.userAgent)}>Use this browser</Button>
          <CopyButton value={ua.trim() ? JSON.stringify(info, null, 2) : ''} label="Copy as JSON" />
        </div>
        <p style={{ margin: 0, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
          iPadOS Safari in desktop mode uses the same string as a Mac, so this tool cannot tell them apart.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {rows.map(([label, value]) => (
            <div key={label} className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)', wordBreak: 'break-word' }}>{value}</div>
              <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Absent when readClientHints returned null, so non-Chromium browsers skip this block. */}
        {hints && (
          <div className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 'var(--t-sm)', fontWeight: 650, color: 'var(--ink)' }}>Client Hints (this browser)</div>
            <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>Brands: {hints.brands}</div>
            <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>Mobile: {hints.mobile}</div>
            <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>Platform: {hints.platform}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
