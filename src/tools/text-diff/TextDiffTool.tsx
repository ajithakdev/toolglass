import { useMemo, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { diffLines } from './diff';

const STYLE = {
  add: { background: 'color-mix(in srgb, var(--status-success) 16%, transparent)', mark: '+' },
  del: { background: 'color-mix(in srgb, var(--status-error) 16%, transparent)', mark: '-' },
  same: { background: 'transparent', mark: ' ' },
} as const;

export default function TextDiffTool() {
  const [a, setA] = useState('The quick brown fox\njumps over\nthe lazy dog');
  const [b, setB] = useState('The quick brown fox\nleaps over\nthe lazy dog\nand runs away');
  const diff = useMemo(() => diffLines(a, b), [a, b]);
  const added = diff?.filter((l) => l.type === 'add').length ?? 0;
  const removed = diff?.filter((l) => l.type === 'del').length ?? 0;

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <Field label="Original">
            <TextArea value={a} onChange={(e) => setA(e.target.value)} rows={10} spellCheck={false} />
          </Field>
          <Field label="Changed">
            <TextArea value={b} onChange={(e) => setB(e.target.value)} rows={10} spellCheck={false} />
          </Field>
        </div>
        <div role="status" style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>
          {!diff ? (
            <span style={{ color: 'var(--status-error)' }}>Too many changed lines to compare in the browser. Try smaller sections.</span>
          ) : added || removed ? (
            <>
              <span style={{ color: 'var(--status-success)' }}>+{added}</span> added, <span style={{ color: 'var(--status-error)' }}>-{removed}</span> removed
            </>
          ) : (
            'No differences'
          )}
        </div>
        {diff && (
          <pre className="glass-strong" style={{ margin: 0, padding: 12, overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}>
            {diff.map((l, i) => (
              <div key={i} style={{ background: STYLE[l.type].background, padding: '0 8px', borderRadius: 4 }}>
                <span aria-hidden style={{ color: 'var(--ink-mute)', userSelect: 'none' }}>{STYLE[l.type].mark} </span>
                <span className="sr-only">{l.type === 'add' ? 'Added: ' : l.type === 'del' ? 'Removed: ' : ''}</span>
                {l.text || ' '}
              </div>
            ))}
          </pre>
        )}
      </div>
    </ToolLayout>
  );
}
