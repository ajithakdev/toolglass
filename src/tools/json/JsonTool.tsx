import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { errorLocation, validateSchema } from './json';

export default function JsonTool() {
  const [input, setInput] = useState('{"hello":"world","arr":[1,2,3]}');
  const [schema, setSchema] = useState('');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const [schemaResult, setSchemaResult] = useState<{ ok: boolean; text: string } | null>(null);

  const parseInput = () => {
    setErr('');
    try {
      return { value: JSON.parse(input) as unknown };
    } catch (e) {
      const msg = (e as Error).message;
      const loc = errorLocation(input, msg);
      setOut('');
      setErr(loc ? `Line ${loc.line}, column ${loc.column}: ${msg}` : msg);
      return null;
    }
  };

  const run = (mode: 'pretty' | 'minify') => {
    const parsed = parseInput();
    if (parsed) setOut(JSON.stringify(parsed.value, null, mode === 'pretty' ? 2 : 0));
  };

  const validate = () => {
    setSchemaResult(null);
    const parsed = parseInput();
    if (!parsed) return;
    try {
      const errs = validateSchema(parsed.value, JSON.parse(schema));
      setSchemaResult(errs.length ? { ok: false, text: errs.join('\n') } : { ok: true, text: 'Valid against schema' });
    } catch (e) {
      setSchemaResult({ ok: false, text: `Invalid schema: ${(e as Error).message}` });
    }
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="JSON Input" hint={err ? <span style={{ color: 'var(--status-error)' }}>{err}</span> : undefined}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            style={err ? { borderColor: 'var(--status-error)' } : undefined}
          />
        </Field>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => run('pretty')}>
            Beautify
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
              setSchemaResult(null);
            }}
          >
            Clear
          </Button>
        </div>
        <Output value={out} multiline placeholder="Formatted JSON will appear here" />
        <Field label="JSON Schema (optional)" hint="Supports type, properties, required, items, enum, const, min/max, pattern, additionalProperties.">
          <TextArea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            rows={6}
            placeholder='{"type": "object", "required": ["hello"]}'
          />
        </Field>
        <div>
          <Button variant="soft" onClick={validate} disabled={!schema.trim()}>
            Validate against schema
          </Button>
        </div>
        {schemaResult && (
          <pre
            role="status"
            className="glass-strong"
            style={{
              margin: 0,
              padding: 16,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: schemaResult.ok ? 'var(--status-success)' : 'var(--status-error)',
            }}
          >
            {schemaResult.text}
          </pre>
        )}
      </div>
    </ToolLayout>
  );
}
