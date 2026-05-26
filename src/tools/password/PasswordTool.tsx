import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { estimateStrength, generatePassword, type PwdOptions } from './password';

export default function PasswordTool() {
  const [opts, setOpts] = useState<PwdOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [pwd, setPwd] = useState('');

  const regen = () => setPwd(generatePassword(opts));

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts]);

  const strength = useMemo(() => estimateStrength(pwd, opts), [pwd, opts]);

  const reset = () =>
    setOpts({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true });

  const set = <K extends keyof PwdOptions>(k: K, v: PwdOptions[K]) =>
    setOpts((p) => ({ ...p, [k]: v }));

  return (
    <ToolLayout
      title="Password Generator"
      description="Cryptographically strong, customizable passwords — generated entirely in your browser."
      icon="🔐"
    >
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
              background: 'rgba(0,0,0,0.06)',
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

        <Field label="Length" hint={`${opts.length} chars`}>
          <Slider value={opts.length} min={4} max={64} onChange={(v) => set('length', v)} />
        </Field>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10,
          }}
        >
          <Toggle
            checked={opts.uppercase}
            onChange={(v) => set('uppercase', v)}
            label="Uppercase"
          />
          <Toggle
            checked={opts.lowercase}
            onChange={(v) => set('lowercase', v)}
            label="Lowercase"
          />
          <Toggle checked={opts.numbers} onChange={(v) => set('numbers', v)} label="Numbers" />
          <Toggle checked={opts.symbols} onChange={(v) => set('symbols', v)} label="Symbols" />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={regen} variant="primary">
            ↻ Regenerate
          </Button>
          <Button onClick={reset} variant="soft">
            Reset
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
