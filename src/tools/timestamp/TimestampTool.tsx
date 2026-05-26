import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';

function toHuman(ts: number): string {
  if (!Number.isFinite(ts)) return '';
  const ms = ts > 1e12 ? ts : ts * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toISOString()}  ·  ${d.toLocaleString()}`;
}

export default function TimestampTool() {
  const [ts, setTs] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState('');
  const [out, setOut] = useState('');

  useEffect(() => {
    const n = Number(ts);
    setOut(toHuman(n));
  }, [ts]);

  const fromIso = () => {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) setTs(String(Math.floor(d.getTime() / 1000)));
  };

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Unix ⇄ ISO ⇄ local time."
      icon="⏱️"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Unix timestamp (sec or ms)">
          <TextInput value={ts} onChange={(e) => setTs(e.target.value)} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="primary"
            onClick={() => setTs(String(Math.floor(Date.now() / 1000)))}
          >
            ⌖ Now
          </Button>
        </div>
        <Output value={out} placeholder="Human-readable date" />

        <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />

        <Field label="ISO / date string → timestamp">
          <TextInput
            placeholder="2024-01-01T12:00:00Z"
            value={iso}
            onChange={(e) => setIso(e.target.value)}
          />
        </Field>
        <div>
          <Button variant="soft" onClick={fromIso}>
            ↓ Convert to Unix
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
