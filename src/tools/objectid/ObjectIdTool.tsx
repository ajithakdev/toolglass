import { useToolAction } from '../../hooks/useToolAction';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { objectId } from './objectid';

export default function ObjectIdTool() {
  const recordAction = useToolAction();
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => {
    setIds(Array.from({ length: count }, objectId));
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
        <Output value={ids.join('\n')} multiline placeholder="ObjectIds will appear here" />
      </div>
    </ToolLayout>
  );
}
