import { useToolAction } from '../../hooks/useToolAction';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useToast } from '../../components/ui/Toast';
import { encode, decode } from './base64';

export default function Base64Tool() {
  const recordAction = useToolAction();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, world!');
  const [out, setOut] = useState('');
  const toast = useToast();

  const run = () => {
    recordAction();
    try {
      setOut(mode === 'encode' ? encode(input) : decode(input));
    } catch (e) {
      toast.push(`Failed: ${(e as Error).message}`, 'error');
    }
  };

  return (
    <ToolLayout
      title="Base64 Encode / Decode"
      description="Unicode-safe Base64 conversion."
      icon="🧬"
    >
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
          <Button variant="primary" onClick={run}>
            ✦ Run
          </Button>
          <Button
            variant="soft"
            onClick={() => {
              setInput('');
              setOut('');
            }}
          >
            Reset
          </Button>
        </div>
        <Output value={out} multiline placeholder="Result will appear here" />
      </div>
    </ToolLayout>
  );
}
