import { useMemo, useState } from 'react';
import { Field, TextArea, TextInput, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { csvToObjects, objectsToCsv, toSqlInsert } from './csv';

type Mode = 'csv-json' | 'json-csv' | 'csv-sql' | 'json-sql';
const SAMPLE_CSV = 'id,name,email\n1,Ada Lovelace,ada@example.com\n2,"Hopper, Grace",grace@example.com';

function asObjects(json: string): Record<string, unknown>[] {
  const v: unknown = JSON.parse(json);
  const arr = Array.isArray(v) ? v : [v];
  if (!arr.every((x) => x && typeof x === 'object' && !Array.isArray(x))) throw new Error('JSON must be an object or an array of objects.');
  return arr as Record<string, unknown>[];
}

export default function CsvJsonTool() {
  const [mode, setMode] = useState<Mode>('csv-json');
  const [input, setInput] = useState(SAMPLE_CSV);
  const [table, setTable] = useState('my_table');
  const [types, setTypes] = useState(true);
  const fromCsv = mode.startsWith('csv');

  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: '', err: '' };
    try {
      const rows = fromCsv ? csvToObjects(input, undefined, types) : asObjects(input);
      const out = mode === 'csv-json' ? JSON.stringify(rows, null, 2) : mode === 'json-csv' ? objectsToCsv(rows) : toSqlInsert(table, rows);
      return { out, err: '' };
    } catch (e) {
      return { out: '', err: (e as Error).message };
    }
  }, [input, mode, table, fromCsv, types]);

  const switchMode = (m: Mode) => {
    // Carry the current result over when flipping direction, so a round trip is one click
    if (out && (m === 'json-csv' || m === 'json-sql') && mode === 'csv-json') setInput(out);
    else if (out && m.startsWith('csv') && mode === 'json-csv') setInput(out);
    setMode(m);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented<Mode>
          label="Conversion"
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'csv-json', label: 'CSV → JSON' },
            { value: 'json-csv', label: 'JSON → CSV' },
            { value: 'csv-sql', label: 'CSV → SQL' },
            { value: 'json-sql', label: 'JSON → SQL' },
          ]}
        />
        {mode === 'csv-json' && <Toggle checked={types} onChange={setTypes} label="Detect numbers, booleans, and empty as null" />}
        {mode.endsWith('sql') && (
          <Field label="Table name" style={{ maxWidth: 280 }}>
            <TextInput value={table} onChange={(e) => setTable(e.target.value)} />
          </Field>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label={fromCsv ? 'CSV (comma, semicolon, tab, or pipe)' : 'JSON'} hint={err ? <span style={{ color: 'var(--status-error)' }}>{err}</span> : undefined}>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={14} spellCheck={false} />
          </Field>
          <Field label="Result">
            <Output value={out} multiline placeholder="Result appears here" />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
