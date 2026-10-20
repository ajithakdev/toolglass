import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, Toggle } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';

export default function UrlTool() {
  const [mode, setMode] = useUrlState<'encode' | 'decode'>('mode', 'encode', v => v as 'encode' | 'decode', v => v);
  const [input, setInput] = useUrlState('input', 'Hello, world!', v => v, v => v);
  const [batch, setBatch] = useUrlState('batch', false, (v) => v === '1', (v) => (v ? '1' : '0'));
  const [out, setOut] = useState('');

  useEffect(() => {
    const convert = (s: string) => {
      try {
        return mode === 'encode' ? encodeURIComponent(s) : decodeURIComponent(s);
      } catch (e) {
        return `Error: ${(e as Error).message}`;
      }
    };
    if (!input) setOut('');
    else if (batch) setOut(input.split(/\r?\n/).map((line) => (line ? convert(line) : '')).join('\n'));
    else setOut(convert(input));
  }, [input, mode, batch]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant={mode === 'encode' ? 'primary' : 'soft'}
            onClick={() => setMode('encode')}
          >
            Encode
          </Button>
          <Button
            size="sm"
            variant={mode === 'decode' ? 'primary' : 'soft'}
            onClick={() => setMode('decode')}
          >
            Decode
          </Button>
          <Toggle checked={batch} onChange={setBatch} label="Batch (one per line)" />
        </div>
        <Field label={batch ? 'Input (one per line)' : 'Input'}>
          <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="soft"
            onClick={() => {
              setInput('');
            }}
          >
            Clear
          </Button>
        </div>
        <Output value={out} multiline placeholder="Result will appear here" />
      </div>
    </ToolLayout>
  );
}
