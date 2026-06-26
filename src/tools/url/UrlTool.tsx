import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';

export default function UrlTool() {
  const [mode, setMode] = useUrlState<'encode' | 'decode'>('mode', 'encode', v => v as 'encode' | 'decode', v => v);
  const [input, setInput] = useUrlState('input', 'Hello, world!', v => v, v => v);
  const [out, setOut] = useState('');

  useEffect(() => {
    try {
      if (input) {
        setOut(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
      } else {
        setOut('');
      }
    } catch (e) {
      setOut(`Error: ${(e as Error).message}`);
    }
  }, [input, mode]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
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
        </div>
        <Field label="Input">
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
