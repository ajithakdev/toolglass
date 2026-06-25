import { useToolAction } from '../../hooks/useToolAction';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';

function uuidv4(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default function UuidTool() {
  const recordAction = useToolAction();
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => {
    setIds(Array.from({ length: count }, uuidv4));
    recordAction();
  };

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Count" hint={`${count}`}>
          <Slider value={count} min={1} max={50} onChange={setCount} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={gen} variant="primary">
            ↻ Regenerate
          </Button>
          <Button onClick={() => setCount(5)} variant="soft">
            Reset
          </Button>
        </div>
        <Output value={ids.join('\n')} multiline placeholder="UUIDs will appear here" />
      </div>
    </ToolLayout>
  );
}
