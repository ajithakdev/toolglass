import { useMemo, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { textStats } from './wordCount';

const minutes = (m: number) => (m === 0 ? '0 min' : m < 1 ? `${Math.max(1, Math.round(m * 60))} sec` : `${Math.round(m)} min`);

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const s = useMemo(() => textStats(text), [text]);
  const stats: [string, string | number][] = [
    ['Words', s.words],
    ['Characters', s.characters],
    ['Without spaces', s.charactersNoSpaces],
    ['Sentences', s.sentences],
    ['Paragraphs', s.paragraphs],
    ['Reading time', minutes(s.readingMinutes)],
    ['Speaking time', minutes(s.speakingMinutes)],
  ];

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div role="status" aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {stats.map(([label, value]) => (
            <div key={label} className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)' }}>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
              <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{label}</div>
            </div>
          ))}
        </div>
        <Field label="Your text">
          <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Type or paste text here" />
        </Field>
      </div>
    </ToolLayout>
  );
}
