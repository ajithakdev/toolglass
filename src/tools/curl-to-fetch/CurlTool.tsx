import { useState, useMemo, useEffect } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Output } from '../../components/ui/Output';
import { useToolAction } from '../../hooks/useToolAction';

function parseCurl(curlString: string) {
  // basic regex based parser, handling quotes and backslashes
  // Not a full shell parser, but works for typical API docs
  let str = curlString.replace(/\\\n/g, ' ').trim();
  if (!str.startsWith('curl ')) return null;

  const args: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (let i = 5; i < str.length; i++) {
    const c = str[i];
    if (escape) {
      current += c;
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (c === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (/\s/.test(c) && !inSingle && !inDouble) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
      continue;
    }
    current += c;
  }
  if (current.length > 0) args.push(current);

  const fetchOptions: any = { method: 'GET', headers: {} };
  let url = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-X' || arg === '--request') {
      fetchOptions.method = args[++i].toUpperCase();
    } else if (arg === '-H' || arg === '--header') {
      const header = args[++i];
      const splitIdx = header.indexOf(':');
      if (splitIdx > 0) {
        fetchOptions.headers[header.substring(0, splitIdx).trim()] = header.substring(splitIdx + 1).trim();
      }
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      fetchOptions.body = args[++i];
      if (fetchOptions.method === 'GET') fetchOptions.method = 'POST';
    } else if (arg === '-u' || arg === '--user') {
      const auth = args[++i];
      fetchOptions.headers['Authorization'] = 'Basic ' + btoa(auth);
    } else if (arg.startsWith('http')) {
      url = arg;
    }
  }

  return { url, fetchOptions };
}

export default function CurlTool() {
  const recordAction = useToolAction();
  const [input, setInput] = useState("curl -X POST https://api.example.com/v1/users \\\n  -H 'Authorization: Bearer token123' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"Alice\"}'");

  const { jsCode, nodeCode, error } = useMemo(() => {
    if (!input.trim()) return { jsCode: '', nodeCode: '', error: null };
    try {
      const parsed = parseCurl(input);
      if (!parsed) throw new Error('Input does not appear to be a valid cURL command');

      const { url, fetchOptions } = parsed;
      const optString = Object.keys(fetchOptions.headers).length === 0 && fetchOptions.method === 'GET' && !fetchOptions.body 
        ? '' 
        : `, ${JSON.stringify(fetchOptions, null, 2)}`;

      const js = `fetch('${url}'${optString})\n  .then(res => res.json())\n  .then(console.log);`;
      const node = `const fetch = require('node-fetch');\n\nfetch('${url}'${optString})\n  .then(res => res.json())\n  .then(console.log);`;
      
      return { jsCode: js, nodeCode: node, error: null };
    } catch (e: any) {
      return { jsCode: '', nodeCode: '', error: e.message };
    }
  }, [input]);

  useEffect(() => {
    if (jsCode) recordAction();
  }, [jsCode, recordAction]);

  return (
    <ToolLayout
      title="cURL to fetch"
      description="Convert cURL commands into JavaScript fetch() code."
      icon="📡"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field label="cURL Command">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder="curl https://api.example.com/..."
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </Field>

        {error ? (
          <div style={{ color: 'var(--status-error)' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Field label="Browser (fetch)">
              <Output value={jsCode} multiline />
            </Field>
            <Field label="Node.js (node-fetch)">
              <Output value={nodeCode} multiline />
            </Field>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
