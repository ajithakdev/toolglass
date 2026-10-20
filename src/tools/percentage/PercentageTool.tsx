import { useState } from 'react';
import { Field, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { formatNumber } from '../unit-converter/units';
import { addPercent, percentChange, percentOf, whatPercent } from './percentage';

type Calc = { title: string; a: string; b: string; run: (a: number, b: number) => number; suffix: string };

const CALCS: Calc[] = [
  { title: 'What is X% of Y?', a: 'Percent', b: 'Of', run: percentOf, suffix: '' },
  { title: 'X is what percent of Y?', a: 'Part', b: 'Whole', run: whatPercent, suffix: '%' },
  { title: 'Percent change from X to Y', a: 'From', b: 'To', run: percentChange, suffix: '%' },
  { title: 'Add or remove a percentage (use - to remove)', a: 'Value', b: 'Percent', run: addPercent, suffix: '' },
];

function Row({ calc }: { calc: Calc }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const out = a.trim() && b.trim() ? calc.run(Number(a), Number(b)) : NaN;
  const text = Number.isFinite(out) ? `${calc.run === percentChange && out > 0 ? '+' : ''}${formatNumber(out)}${calc.suffix}` : '';
  return (
    <section className="glass" style={{ padding: 16, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 'var(--t-sm)', fontWeight: 650 }}>{calc.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <Field label={calc.a}>
          <TextInput inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label={calc.b}>
          <TextInput inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>
      <Output value={text} label={calc.title} placeholder="Result" />
    </section>
  );
}

export default function PercentageTool() {
  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CALCS.map((c) => (
          <Row key={c.title} calc={c} />
        ))}
      </div>
    </ToolLayout>
  );
}
