import { useToolAction } from '../../hooks/useToolAction';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';
import { estimateStrength, generatePassword, type PwdOptions } from './password';

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button onClick={handleShare} variant="soft">
      {copied ? '✨ Copied!' : '🔗 Share'}
    </Button>
  );
}

export default function PasswordTool() {
  const recordAction = useToolAction();
  // URL-serialized options (allowlist — no sensitive input values)
  const [length, setLength] = useUrlState('len', 20, Number, String);
  const [uppercase, setUppercase] = useUrlState('u', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [lowercase, setLowercase] = useUrlState('l', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [numbers, setNumbers] = useUrlState('n', true, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [symbols, setSymbols] = useUrlState('s', true, (v) => v === '1', (v) => (v ? '1' : '0'));

  const opts: PwdOptions = { length, uppercase, lowercase, numbers, symbols };
  const [pwd, setPwd] = useState('');

  const regen = () => {
    setPwd(generatePassword(opts));
    recordAction();
  };

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, uppercase, lowercase, numbers, symbols]);

  const strength = useMemo(() => estimateStrength(pwd, opts), [pwd, opts]);

  const reset = () => {
    setLength(20);
    setUppercase(true);
    setLowercase(true);
    setNumbers(true);
    setSymbols(true);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Output value={pwd} />

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
              {strength.label} · {strength.bits} bits
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
            <motion.div
              animate={{ width: `${((strength.score + 1) / 5) * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${strength.color}, ${strength.color}cc)`,
              }}
            />
          </div>
        </div>

        <Field label="Length" hint={`${length} chars`}>
          <Slider value={length} min={4} max={64} onChange={setLength} />
        </Field>

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
          <Button onClick={reset} variant="soft">
            Reset
          </Button>
          <ShareButton />
        </div>
      </div>
    </ToolLayout>
  );
}
