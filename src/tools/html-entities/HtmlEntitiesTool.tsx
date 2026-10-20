import { useMemo, useState } from 'react';
import { Field, TextArea, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { decodeEntities, encodeEntities, type EntityStyle } from './entities';

export default function HtmlEntitiesTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [style, setStyle] = useState<EntityStyle>('named');
  const [nonAscii, setNonAscii] = useState(true);
  const [input, setInput] = useState('<p class="note">Café © 2025 — “quotes” & more…</p>');
  const out = useMemo(() => (mode === 'encode' ? encodeEntities(input, style, nonAscii) : decodeEntities(input)), [input, mode, style, nonAscii]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Segmented label="Direction" value={mode} onChange={(m) => { if (out) setInput(out); setMode(m); }} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
          {mode === 'encode' && (
            <>
              <Segmented<EntityStyle> label="Style" size="sm" value={style} onChange={setStyle} options={[{ value: 'named', label: '&copy;' }, { value: 'decimal', label: '&#169;' }, { value: 'hex', label: '&#xA9;' }]} />
              <Toggle checked={nonAscii} onChange={setNonAscii} label="Encode non-ASCII" />
            </>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <Field label={mode === 'encode' ? 'Text' : 'HTML with entities'}>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={10} spellCheck={false} />
          </Field>
          <Field label="Result">
            <Output value={out} multiline />
          </Field>
        </div>
      </div>
    </ToolLayout>
  );
}
