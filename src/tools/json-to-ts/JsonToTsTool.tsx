/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Field, Toggle, TextInput, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Output } from '../../components/ui/Output';
import { jsonToTs } from './jsonToTs';

export default function JsonToTsTool() {
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
