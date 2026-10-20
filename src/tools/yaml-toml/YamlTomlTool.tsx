import { useMemo, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { convert, type Format } from './convert';

const OPTS: { value: Format; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
];
const SAMPLE = 'name: toolglass\nport: 8080\ntags:\n  - fast\n  - private\ndatabase:\n  host: localhost\n  pool: 5\n';

export default function YamlTomlTool() {
  const [from, setFrom] = useState<Format>('yaml');
  const [to, setTo] = useState<Format>('json');
  const [input, setInput] = useState(SAMPLE);

  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: '', err: '' };
    try {
      return { out: convert(input, from, to), err: '' };
    } catch (e) {
      return { out: '', err: (e as Error).message.split('\n')[0]! };
    }
  }, [input, from, to]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Segmented<Format> label="From" value={from} onChange={(f) => { if (f === to) setTo(from); setFrom(f); }} options={OPTS} />
          <span aria-hidden style={{ color: 'var(--ink-mute)' }}>→</span>
          <Segmented<Format> label="To" value={to} onChange={(t) => { if (t === from) setFrom(to); setTo(t); }} options={OPTS} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label={from.toUpperCase()} hint={err ? <span style={{ color: 'var(--status-error)' }}>{err}</span> : undefined}>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={16} spellCheck={false} />
          </Field>
          <Field label={to.toUpperCase()}>
            <Output value={out} multiline placeholder="Result appears here" />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
