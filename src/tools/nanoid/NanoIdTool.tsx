import { useToolAction } from '../../hooks/useToolAction';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';

const DEFAULT_ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

function nanoid(size: number, alphabet: string): string {
  const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  let id = '';
  while (id.length < size) {
    const bytes = new Uint8Array(step);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < step && id.length < size; i++) {
      const ch = alphabet[bytes[i]! & mask];
      if (ch) id += ch;
    }
  }
  return id;
}

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button onClick={handleShare} variant="soft">
      {copied ? '✨ Copied!' : '🔗 Share'}
    </Button>
  );
}

export default function NanoIdTool() {
  const recordAction = useToolAction();
  const [size, setSize] = useUrlState('size', 21, Number, String);
  const [count, setCount] = useUrlState('count', 5, Number, String);
  // alphabet is NOT in URL (could be long; not sensitive, just verbose)
  const [alphabet, setAlphabet] = useState(DEFAULT_ALPHABET);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => {
    if (!alphabet) return setIds([]);
    setIds(Array.from({ length: count }, () => nanoid(size, alphabet)));
    recordAction();
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
        <Field label="Alphabet">
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
          <ShareButton />
        </div>
        <Output value={ids.join('\n')} multiline placeholder="NanoIDs will appear here" />
      </div>
    </ToolLayout>
  );
}
