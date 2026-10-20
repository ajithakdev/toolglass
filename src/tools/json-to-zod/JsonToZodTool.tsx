import { useMemo, useState } from 'react';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { jsonToZod, type Target } from './zod';

const SAMPLE = '[\n  { "id": 1, "name": "Ada", "email": "ada@example.com", "tags": ["admin"] },\n  { "id": 2, "name": "Grace", "email": null, "tags": [], "team": { "name": "Navy" } }\n]';

export default function JsonToZodTool() {
  const [input, setInput] = useState(SAMPLE);
  const [name, setName] = useState('User');
  const [target, setTarget] = useState<Target>('zod');
  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: '', err: '' };
    try {
      return { out: jsonToZod(JSON.parse(input), name, target), err: '' };
    } catch (e) {
      return { out: '', err: (e as Error).message };
    }
  }, [input, name, target]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          <Field label="Schema name" style={{ width: 280 }}>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Segmented<Target> label="Library" value={target} onChange={setTarget} options={[{ value: 'zod', label: 'Zod' }, { value: 'valibot', label: 'Valibot' }]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label="JSON" hint={err ? <span style={{ color: 'var(--status-error)' }}>{err}</span> : 'Arrays of objects mark missing keys optional'}>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={16} spellCheck={false} />
          </Field>
          <Field label={target === 'zod' ? 'Zod schema' : 'Valibot schema'}>
            <Output value={out} multiline placeholder="Zod schema appears here" />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
