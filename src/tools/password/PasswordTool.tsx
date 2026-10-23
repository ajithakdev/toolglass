import { m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Field, Slider, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { intParam, useUrlState } from '../../hooks/useUrlState';
import { useToolStats } from '../../hooks/useToolStats';
import { estimateStrength, generatePasswords, type PwdOptions } from './password';

export default function PasswordTool() {
  // URL-serialized options (allowlist — no sensitive input values)
  const [length, setLength] = useUrlState('len', 20, intParam(4, 64, 20), String);
  const [uppercase, setUppercase] = useUrlState('u', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [lowercase, setLowercase] = useUrlState('l', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [numbers, setNumbers] = useUrlState('n', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [symbols, setSymbols] = useUrlState('s', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [count, setCount] = useUrlState('c', 1, intParam(1, 100, 1), String);

  const opts = useMemo<PwdOptions>(() => ({
    length, uppercase, lowercase, numbers, symbols
  }), [length, uppercase, lowercase, numbers, symbols]);
  const [pwds, setPwds] = useState<string[]>([]);

  const regen = () => {
    setPwds(generatePasswords(opts, count));
  };

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, uppercase, lowercase, numbers, symbols, count]);

  // Every password shares length and classes, so one estimate covers the batch
  const strength = useMemo(() => estimateStrength(pwds[0] ?? '', opts), [pwds, opts]);

  const { slug = 'password' } = useParams();
  const { increment } = useToolStats(slug);
  const download = () => {
    const url = URL.createObjectURL(new Blob([pwds.join('\n') + '\n'], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(url);
    increment();
  };

  const reset = () => {
    setLength(20);
    setUppercase(true);
    setLowercase(true);
    setNumbers(true);
    setSymbols(true);
    setCount(1);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Output value={pwds.join('\n')} multiline={count > 1} label={count > 1 ? 'Generated passwords' : 'Generated password'} />

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>Strength</span>
            <span style={{ fontSize: 12, color: strength.color, fontWeight: 600 }}>
              {strength.label} · {strength.bits} bits{count > 1 ? ' each' : ''}
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: 'var(--track-bg)',
              overflow: 'hidden',
            }}
          >
            <m.div
              animate={{ width: `${((strength.score + 1) / 5) * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              style={{
                height: '100%',
                background: strength.color,
              }}
            />
          </div>
        </div>

        <Field label="Length" hint={`${length} chars`}>
          <Slider value={length} min={4} max={64} onChange={setLength} />
        </Field>

        <Field label="How many" hint={count === 1 ? '1 password' : `${count} passwords`}>
          <Slider value={count} min={1} max={100} onChange={setCount} />
        </Field>
        {pwds.length > 0 && pwds.length < count && (
          <p role="status" style={{ margin: 0, fontSize: 'var(--t-sm)', color: 'var(--status-warn)' }}>
            Only {pwds.length} unique passwords fit these settings. Make them longer or add character classes.
          </p>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            Character classes
          </legend>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 10,
            }}
          >
            <Toggle checked={uppercase} onChange={setUppercase} label="Uppercase" />
            <Toggle checked={lowercase} onChange={setLowercase} label="Lowercase" />
            <Toggle checked={numbers} onChange={setNumbers} label="Numbers" />
            <Toggle checked={symbols} onChange={setSymbols} label="Symbols" />
          </div>
        </fieldset>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={regen} variant="primary">
            ↻ Regenerate
          </Button>
          {count > 1 && pwds.length > 0 && (
            <Button onClick={download} variant="soft">
              Download .txt
            </Button>
          )}
          <Button onClick={reset} variant="soft">
            Reset
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
