import { useState } from 'react';
import { Field, TextInput, Toggle } from '../../components/ui/Field';
import { Segmented } from '../../components/ui/Segmented';
import { CopyButton } from '../../components/ui/CopyButton';
import { ToolLayout } from '../../components/ToolLayout';
import { fromBits, group, parseBig, toBase, toBits } from './numberBase';

const BASES = [
  { base: 10, label: 'Decimal', group: 3 },
  { base: 16, label: 'Hex', group: 4 },
  { base: 8, label: 'Octal', group: 3 },
  { base: 2, label: 'Binary', group: 4 },
];
type Width = '8' | '16' | '32' | '64';

export default function NumberBaseTool() {
  const [value, setValue] = useState<bigint | null>(255n);
  const [editing, setEditing] = useState<{ base: number; text: string } | null>(null);
  const [width, setWidth] = useState<Width>('32');
  const [signed, setSigned] = useState(false);
  const bits = value === null ? null : toBits(value, Number(width));

  const flip = (i: number) => {
    if (!bits) return;
    const next = [...bits];
    next[i] = next[i] ? 0 : 1;
    setValue(fromBits(next, signed));
    setEditing(null);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {BASES.map((b) => {
            const shown = editing?.base === b.base ? editing.text : value === null ? '' : toBase(value, b.base);
            const invalid = editing?.base === b.base && editing.text.trim() !== '' && value === null;
            return (
              <Field key={b.base} label={`${b.label} (base ${b.base})`} hint={invalid ? <span style={{ color: 'var(--status-error)' }}>Not a valid number</span> : value !== null && <CopyButton size="sm" value={toBase(value, b.base)} />}>
                <TextInput
                  value={shown}
                  spellCheck={false}
                  className="num"
                  onChange={(e) => {
                    setEditing({ base: b.base, text: e.target.value });
                    setValue(parseBig(e.target.value, b.base));
                  }}
                  onBlur={() => setEditing(null)}
                />
              </Field>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Segmented<Width> label="Bit width" value={width} onChange={setWidth} options={(['8', '16', '32', '64'] as const).map((w) => ({ value: w, label: `${w}-bit` }))} />
          <Toggle checked={signed} onChange={setSigned} label="Signed (two's complement)" />
        </div>
        {value !== null && !bits && <p role="alert" style={{ margin: 0, color: 'var(--status-warn)' }}>This number does not fit in {width} bits.</p>}
        {bits && (
          <div role="group" aria-label="Bits, click to toggle" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Array.from({ length: bits.length / 8 }, (_, byte) => (
              <div key={byte} style={{ display: 'flex', gap: 2 }}>
                {bits.slice(byte * 8, byte * 8 + 8).map((bit, j) => {
                  const i = byte * 8 + j;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => flip(i)}
                      aria-label={`Bit ${bits.length - 1 - i}: ${bit}`}
                      aria-pressed={!!bit}
                      title={`Bit ${bits.length - 1 - i}`}
                      className="num"
                      style={{ width: 26, height: 32, borderRadius: 6, border: '1px solid var(--border)', background: bit ? 'var(--grad)' : 'var(--surface-2)', color: bit ? 'var(--grad-ink)' : 'var(--ink-mute)', fontWeight: 650 }}
                    >
                      {bit}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {bits && (
          <p className="num" style={{ margin: 0, fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>
            {group(bits.join(''), 4)} · {signed ? 'signed' : 'unsigned'} value {String(fromBits(bits, signed))}
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
