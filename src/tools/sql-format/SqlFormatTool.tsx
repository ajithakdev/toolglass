import { useMemo, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { formatSql } from './sqlFormat';

const SAMPLE = "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at > '2025-01-01' group by u.id, u.name having count(o.id) > 5 order by orders desc limit 10;";

export default function SqlFormatTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [kwCase, setKwCase] = useState<'upper' | 'lower' | 'keep'>('upper');
  const out = useMemo(() => (input.trim() ? formatSql(input, indent === 'tab' ? '\t' : ' '.repeat(Number(indent)), kwCase) : ''), [input, indent, kwCase]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Segmented<'upper' | 'lower' | 'keep'>
          label="Keyword case"
          value={kwCase}
          onChange={setKwCase}
          options={[
            { value: 'upper', label: 'UPPER' },
            { value: 'lower', label: 'lower' },
            { value: 'keep', label: 'As typed' },
          ]}
        />
        <Segmented<'2' | '4' | 'tab'>
          label="Indent"
          value={indent}
          onChange={setIndent}
          options={[
            { value: '2', label: '2 spaces' },
            { value: '4', label: '4 spaces' },
            { value: 'tab', label: 'Tab' },
          ]}
        />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label="SQL">
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={16} spellCheck={false} />
          </Field>
          <Field label="Formatted">
            <Output value={out} multiline placeholder="Formatted SQL appears here" />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
