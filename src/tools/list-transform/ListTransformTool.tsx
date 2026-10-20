import { useMemo, useState } from 'react';
import { Dropdown, Field, TextArea, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { transformList, type ListOptions } from './list';

const opt = <T extends string>(pairs: [T, string][]) => pairs.map(([value, label]) => ({ value, label }));

export default function ListTransformTool() {
  const [input, setInput] = useState('banana\napple\nCherry\napple\n\n  date  ');
  const [o, setO] = useState<ListOptions>({ split: 'auto', join: 'comma-space', trim: true, dropEmpty: true, dedupe: 'exact', sort: 'none' });
  const set = <K extends keyof ListOptions>(k: K) => (v: ListOptions[K]) => setO({ ...o, [k]: v });
  const { output, count } = useMemo(() => transformList(input, o), [input, o]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Field label="Split on">
            <Dropdown value={o.split} onChange={(v) => set('split')(v as ListOptions['split'])} options={opt([['auto', 'Auto-detect'], ['newline', 'New lines'], ['comma', 'Commas'], ['tab', 'Tabs'], ['semicolon', 'Semicolons'], ['space', 'Spaces']])} />
          </Field>
          <Field label="Output as">
            <Dropdown value={o.join} onChange={(v) => set('join')(v as ListOptions['join'])} options={opt([['newline', 'One per line'], ['comma-space', 'a, b, c'], ['comma', 'a,b,c'], ['quoted', '"a", "b"'], ['json', 'JSON array'], ['sql', "SQL IN ('a', 'b')"]])} />
          </Field>
          <Field label="Duplicates">
            <Dropdown value={o.dedupe} onChange={(v) => set('dedupe')(v as ListOptions['dedupe'])} options={opt([['none', 'Keep'], ['exact', 'Remove'], ['ignore-case', 'Remove, ignore case']])} />
          </Field>
          <Field label="Sort">
            <Dropdown value={o.sort} onChange={(v) => set('sort')(v as ListOptions['sort'])} options={opt([['none', 'Original order'], ['asc', 'A → Z'], ['desc', 'Z → A'], ['reverse', 'Reverse']])} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Toggle checked={o.trim} onChange={set('trim')} label="Trim spaces" />
          <Toggle checked={o.dropEmpty} onChange={set('dropEmpty')} label="Drop empty items" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label="List">
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={12} spellCheck={false} />
          </Field>
          <Field label="Result" hint={`${count} items`}>
            <Output value={output} multiline />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
