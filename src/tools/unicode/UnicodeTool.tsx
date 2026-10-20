import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { clean, inspect } from './unicode';

const MAX_ROWS = 2000;

export default function UnicodeTool() {
  const [input, setInput] = useState('Hello​ world — café 👋🏽‮');
  const [onlySuspect, setOnlySuspect] = useState(false);
  const chars = useMemo(() => inspect(input), [input]);
  const suspects = chars.filter((c) => c.warning).length;
  const rows = (onlySuspect ? chars.filter((c) => c.warning) : chars).slice(0, MAX_ROWS);
  const cleaned = useMemo(() => clean(input), [input]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Text" hint={`${chars.length} code points`}>
          <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={6} spellCheck={false} />
        </Field>
        <div role="status" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <strong style={{ color: suspects ? 'var(--status-warn)' : 'var(--status-success)' }}>
            {suspects ? `${suspects} hidden or look-alike character${suspects === 1 ? '' : 's'} found` : 'No hidden characters'}
          </strong>
          {suspects > 0 && (
            <Button size="sm" variant="soft" onClick={() => setInput(cleaned)}>
              Remove them
            </Button>
          )}
          <Toggle checked={onlySuspect} onChange={setOnlySuspect} label="Show only suspicious" />
        </div>
        {suspects > 0 && (
          <Field label="Cleaned text">
            <Output value={cleaned} multiline />
          </Field>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="num" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--t-sm)' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--ink-mute)' }}>
                <th style={{ padding: 6 }}>Char</th>
                <th style={{ padding: 6 }}>Code point</th>
                <th style={{ padding: 6 }}>Category</th>
                <th style={{ padding: 6 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--divider)', background: c.warning ? 'color-mix(in srgb, var(--status-warn) 12%, transparent)' : undefined }}>
                  <td style={{ padding: 6, fontSize: 18 }}>{c.warning || c.category === 'Control' ? <span style={{ color: 'var(--ink-mute)', fontSize: 12 }}>(hidden)</span> : c.char === ' ' ? '␠' : c.char}</td>
                  <td style={{ padding: 6 }}>{c.hex}</td>
                  <td style={{ padding: 6 }}>{c.category}</td>
                  <td style={{ padding: 6, color: 'var(--status-warn)' }}>{c.warning ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {chars.length > MAX_ROWS && !onlySuspect && <p style={{ color: 'var(--ink-mute)' }}>Showing the first {MAX_ROWS} characters.</p>}
        </div>
      </div>
    </ToolLayout>
  );
}
