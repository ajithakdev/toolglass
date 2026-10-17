import type { ReactNode } from 'react';
import { getMethodColor } from './curl';

export function MethodBadge({ method }: { method: string }) {
  const c = getMethodColor(method);
  return (
    <span
      className="mono"
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        color: c,
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
        flexShrink: 0,
      }}
    >
      {method}
    </span>
  );
}

const TONES = { info: 'var(--accent)', warn: 'var(--status-warn)', error: 'var(--status-error)' };

/** Tinted callout used for privacy notes, warnings, and errors. */
export function Notice({ tone = 'info', icon, children, action }: { tone?: keyof typeof TONES; icon?: ReactNode; children: ReactNode; action?: ReactNode }) {
  const c = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, ${c} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 22%, transparent)`,
        fontSize: 'var(--t-sm)',
        color: tone === 'error' ? c : 'var(--ink-soft)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
        {icon && <span style={{ color: c, display: 'grid', flexShrink: 0, marginTop: 2 }}>{icon}</span>}
        <span style={{ minWidth: 0 }}>{children}</span>
      </span>
      {action}
    </div>
  );
}

export const panelStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' } as const;
