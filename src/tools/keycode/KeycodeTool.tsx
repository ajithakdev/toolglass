import { useEffect, useState } from 'react';
import { CopyButton } from '../../components/ui/CopyButton';
import { ToolLayout } from '../../components/ToolLayout';

type Info = { key: string; code: string; keyCode: number; location: number; mods: string[]; repeat: boolean };
const LOCATIONS = ['Standard', 'Left', 'Right', 'Numpad'];

export default function KeycodeTool() {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Tab and Escape keep their normal job so keyboard users can leave the page
      if (e.key !== 'Tab' && e.key !== 'Escape') e.preventDefault();
      setInfo({
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        location: e.location,
        repeat: e.repeat,
        mods: (['ctrlKey', 'shiftKey', 'altKey', 'metaKey'] as const).filter((m) => e[m]).map((m) => m.replace('Key', '')),
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const rows: [string, string][] = info
    ? [
        ['event.key', info.key === ' ' ? '" " (Space)' : info.key],
        ['event.code', info.code],
        ['event.keyCode (deprecated)', String(info.keyCode)],
        ['event.location', `${info.location} (${LOCATIONS[info.location] ?? '?'})`],
        ['Modifiers', info.mods.join(' + ') || 'none'],
        ['Repeat', String(info.repeat)],
      ]
    : [];

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        <div aria-live="polite" className="glass-strong num" style={{ minWidth: 200, padding: '28px 40px', borderRadius: 'var(--radius-lg, 20px)', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(48px, 10vw, 80px)', fontWeight: 700, lineHeight: 1 }}>{info ? info.keyCode : '—'}</div>
          <div style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{info ? `${info.mods.length ? info.mods.join('+') + '+' : ''}${info.key === ' ' ? 'Space' : info.key}` : 'Press any key'}</div>
        </div>
        {info && (
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, width: '100%', margin: 0 }}>
            {rows.map(([label, value]) => (
              <div key={label} className="glass-strong" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <dt style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{label}</dt>
                  <dd className="num" style={{ margin: 0, fontWeight: 650, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{value}</dd>
                </div>
                <CopyButton value={value} />
              </div>
            ))}
          </dl>
        )}
      </div>
    </ToolLayout>
  );
}
