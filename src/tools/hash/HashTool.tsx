import { useEffect, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
const ALGOS: Algo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function hash(text: string, algo: Algo): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const out = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(out), (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashTool() {
  const [input, setInput] = useState('hello world');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [out, setOut] = useState('');

  useEffect(() => {
    let alive = true;
    hash(input, algo).then((h) => {
      if (alive) {
        setOut(h);
      }
    });
    return () => {
      alive = false;
    };
  }, [input, algo]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Input">
          <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
        </Field>
        <Field label="Algorithm">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALGOS.map((a) => (
              <Button
                key={a}
                variant={algo === a ? 'primary' : 'soft'}
                size="sm"
                onClick={() => setAlgo(a)}
              >
                {a}
              </Button>
            ))}
          </div>
        </Field>
        <Output value={out} multiline placeholder="Hash will appear here" />
      </div>
    </ToolLayout>
  );
}
