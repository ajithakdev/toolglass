import { Field, TextInput, Dropdown } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';
import { convert, formatNumber, UNITS } from './units';

const str = (v: string) => v;

export default function UnitConverterTool() {
  const [cat, setCat] = useUrlState('cat', 'Length', (v) => (v in UNITS ? v : 'Length'), str);
  const units = UNITS[cat]!;
  const keys = Object.keys(units);
  const [rawFrom, setFrom] = useUrlState('from', 'km', str, str);
  const [rawTo, setTo] = useUrlState('to', 'mi', str, str);
  const [value, setValue] = useUrlState('v', '1', str, str);
  // Fall back when a shared URL or category switch leaves a unit from another category
  const from = rawFrom in units ? rawFrom : keys[0]!;
  const to = rawTo in units ? rawTo : keys[1]!;

  const n = Number(value);
  const result = value.trim() && Number.isFinite(n) ? formatNumber(convert(cat, from, to, n)) : '';
  const options = keys.map((k) => ({ value: k, label: `${units[k]!.label} (${k})` }));

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Measure">
          <Dropdown value={cat} options={Object.keys(UNITS).map((c) => ({ value: c, label: c }))} onChange={(c) => { setCat(c); const k = Object.keys(UNITS[c]!); setFrom(k[0]!); setTo(k[1]!); }} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'end' }}>
          <Field label="Value">
            <TextInput inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <Field label="From">
            <Dropdown value={from} options={options} onChange={setFrom} />
          </Field>
          <Field label="To">
            <Dropdown value={to} options={options} onChange={setTo} />
          </Field>
        </div>
        <div>
          <Button size="sm" variant="soft" onClick={() => { setFrom(to); setTo(from); }}>
            Swap units
          </Button>
        </div>
        <Output value={result ? `${result} ${to}` : ''} label="Converted value" placeholder="Enter a number" />
      </div>
    </ToolLayout>
  );
}
