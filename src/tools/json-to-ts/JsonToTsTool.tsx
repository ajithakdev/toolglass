import { useState, useMemo, useEffect } from 'react';
import { Field, Toggle, TextInput, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Output } from '../../components/ui/Output';
import { useToolAction } from '../../hooks/useToolAction';

function toPascalCase(str: string): string {
  return str.replace(/(^\w|_\w|-\w|\s\w)/g, match => match.replace(/[_\-\s]/, '').toUpperCase());
}

function inferType(value: any, name: string, useInterface: boolean, options: { dedup: Set<string>, out: string[] }): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    const types = new Set<string>();
    for (const item of value) {
      types.add(inferType(item, name + 'Item', useInterface, options));
    }
    const typeArr = Array.from(types);
    if (typeArr.length === 1) {
      return typeArr[0].includes('|') || typeArr[0].includes(' ') ? `(${typeArr[0]})[]` : `${typeArr[0]}[]`;
    }
    return `(${typeArr.join(' | ')})[]`;
  }

  if (typeof value === 'object') {
    let tName = toPascalCase(name);
    let originalTName = tName;
    let counter = 2;
    while (options.dedup.has(tName)) {
      tName = `${originalTName}${counter++}`;
    }
    options.dedup.add(tName);

    const lines: string[] = [];
    if (useInterface) {
      lines.push(`export interface ${tName} {`);
    } else {
      lines.push(`export type ${tName} = {`);
    }

    for (const [k, v] of Object.entries(value)) {
      // Very basic optional detection: if we were inside an array inference, we'd check if key exists on all.
      // But for a single object, we just output properties.
      // To support optional-undefined detection from arrays, we would need to pass all array items here.
      // For simplicity in a pure function, we treat all present keys as required.
      const propType = inferType(v, k, useInterface, options);
      const isIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);
      const keyStr = isIdentifier ? k : `'${k}'`;
      lines.push(`  ${keyStr}: ${propType};`);
    }

    lines.push('}');
    options.out.push(lines.join('\n'));

    return tName;
  }

  return 'any';
}

function jsonToTs(jsonString: string, rootName: string, useInterface: boolean): string {
  try {
    const data = JSON.parse(jsonString);
    const options = { dedup: new Set<string>(), out: [] as string[] };
    
    // If it's an array at the root
    if (Array.isArray(data)) {
      // Find the merged object type if it's an array of objects
      const rootType = inferType(data, rootName, useInterface, options);
      options.out.push(`export type ${rootName} = ${rootType};`);
    } else {
      inferType(data, rootName, useInterface, options);
    }
    
    return options.out.reverse().join('\n\n');
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export default function JsonToTsTool() {
  const recordAction = useToolAction();
  const [input, setInput] = useState('{\n  "user": {\n    "id": 123,\n    "name": "Alice",\n    "active": true\n  },\n  "roles": ["admin", "editor"]\n}');
  const [useInterface, setUseInterface] = useState(true);
  const [rootName, setRootName] = useState('Root');
  
  const { ts, error } = useMemo(() => {
    if (!input.trim()) return { ts: '', error: null };
    try {
      const result = jsonToTs(input, rootName || 'Root', useInterface);
      return { ts: result, error: null };
    } catch (e: any) {
      return { ts: '', error: e.message };
    }
  }, [input, rootName, useInterface]);

  useEffect(() => {
    if (ts) recordAction();
  }, [ts, recordAction]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Field label="Root interface name">
              <TextInput
                value={rootName}
                onChange={e => setRootName(e.target.value)}
              />
            </Field>
          </div>
          <div style={{ marginTop: 24 }}>
            <Toggle checked={useInterface} onChange={setUseInterface} label="Use interface (instead of type)" />
          </div>
        </div>

        <Field label="JSON Input">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder='{"hello": "world"}'
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </Field>

        {error ? (
          <div style={{ color: 'var(--status-error)' }}>Invalid JSON: {error}</div>
        ) : (
          <Output value={ts} multiline />
        )}
      </div>
    </ToolLayout>
  );
}
