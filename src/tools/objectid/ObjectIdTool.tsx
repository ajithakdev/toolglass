import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';

const MACHINE = (() => {
  const b = new Uint8Array(5);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
})();

let counter = (() => {
  const b = new Uint8Array(3);
  crypto.getRandomValues(b);
  return ((b[0]! << 16) | (b[1]! << 8) | b[2]!) & 0xffffff;
})();

function objectId(): string {
  const ts = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0');
  counter = (counter + 1) & 0xffffff;
  return ts + MACHINE + counter.toString(16).padStart(6, '0');
}

export default function ObjectIdTool() {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => setIds(Array.from({ length: count }, objectId));

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <ToolLayout
      title="Mongo ObjectId"
      description="24-character BSON ObjectIds: timestamp + machine + counter."
      icon="🍃"
    >
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
        <Output value={ids.join('\n')} multiline placeholder="ObjectIds will appear here" />
      </div>
    </ToolLayout>
  );
}
