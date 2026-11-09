import { useMemo, useState } from 'react';
import { CopyButton } from '../../components/ui/CopyButton';
import { Field, TextInput } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { CLASSES, searchCodes } from './codes';

const COLOR: Record<number, string> = { 1: 'var(--ink-mute)', 2: 'var(--status-success)', 3: 'var(--accent)', 4: 'var(--status-warn)', 5: 'var(--status-error)' };

export default function HttpStatusTool() {
  const [q, setQ] = useState('');
  const list = useMemo(() => searchCodes(q), [q]);
  const groups = [1, 2, 3, 4, 5].map((c) => [c, list.filter((s) => Math.floor(s.code / 100) === c)] as const).filter(([, l]) => l.length);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Search" hint={`${list.length} codes`}>
          <TextInput autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="404, 4xx, redirect, rate limit…" />
        </Field>
        {groups.map(([cls, items]) => (
          <section key={cls} aria-labelledby={`cls-${cls}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 id={`cls-${cls}`} className="section-label">{cls}xx · {CLASSES[cls]}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
              {items.map((s) => (
                <div key={s.code} className="glass-strong" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 12 }}>
                  <span className="num" style={{ fontSize: 20, fontWeight: 700, color: COLOR[cls], minWidth: 44 }}>{s.code}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 650, color: 'var(--ink)' }}>{s.name}</div>
                    <div style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>{s.description}</div>
                  </div>
                  <CopyButton value={`${s.code} ${s.name}`} label={`Copy ${s.code} ${s.name}`} compact />
                </div>
              ))}
            </div>
          </section>
        ))}
        {!list.length && <p style={{ color: 'var(--ink-mute)' }}>No status code matches “{q}”.</p>}
      </div>
    </ToolLayout>
  );
}
