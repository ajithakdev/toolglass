import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';

export default function JsonTool() {
  const [input, setInput] = useState('{"hello":"world","arr":[1,2,3]}');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');

  const run = (mode: 'pretty' | 'minify') => {
    setErr('');
    try {
      const parsed = JSON.parse(input);
      setOut(JSON.stringify(parsed, null, mode === 'pretty' ? 2 : 0));
    } catch (e) {
      setOut('');
      setErr((e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Validate, beautify, or minify JSON."
      icon="{ }"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="JSON Input" hint={err ? `⚠ ${err}` : undefined}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            style={err ? { borderColor: '#ef4444' } : undefined}
          />
        </Field>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => run('pretty')}>
            ✦ Beautify
          </Button>
          <Button variant="soft" onClick={() => run('minify')}>
            Minify
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setInput('');
              setOut('');
              setErr('');
            }}
          >
            Clear
          </Button>
        </div>
        <Output value={out} multiline placeholder="Formatted JSON will appear here" />
      </div>
    </ToolLayout>
  );
}
