import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { intParam, useUrlState } from '../../hooks/useUrlState';
import { DEFAULT_ALPHABET, nanoid, uniqueChars } from './nanoid';

export default function NanoIdTool() {
  const [size, setSize] = useUrlState('size', 21, intParam(4, 64, 21), String);
  const [count, setCount] = useUrlState('count', 5, intParam(1, 50, 5), String);
  // alphabet is NOT in URL (could be long; not sensitive, just verbose)
  const [alphabet, setAlphabet] = useState(DEFAULT_ALPHABET);
  const [ids, setIds] = useState<string[]>([]);
  const dupes = [...alphabet].length - uniqueChars(alphabet).length;

  const gen = () => {
    if (!alphabet) return setIds([]);
    setIds(Array.from({ length: count }, () => nanoid(size, alphabet)));
  };

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, count, alphabet]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Length" hint={`${size}`}>
          <Slider value={size} min={4} max={64} onChange={setSize} />
        </Field>
        <Field label="Count" hint={`${count}`}>
          <Slider value={count} min={1} max={50} onChange={setCount} />
        </Field>
        <Field label="Alphabet" hint={dupes > 0 ? `${dupes} duplicate character${dupes === 1 ? '' : 's'} ignored` : undefined}>
          <TextInput value={alphabet} onChange={(e) => setAlphabet(e.target.value)} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={gen} variant="primary">
            ↻ Regenerate
          </Button>
          <Button
            onClick={() => {
              setSize(21);
              setCount(5);
              setAlphabet(DEFAULT_ALPHABET);
            }}
            variant="soft"
          >
            Reset
          </Button>
        </div>
        <Output value={ids.join('\n')} multiline placeholder="NanoIDs will appear here" />
      </div>
    </ToolLayout>
  );
}
