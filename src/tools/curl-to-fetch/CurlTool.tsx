import { useState } from 'react';
import { Field, TextArea, TextInput, Dropdown } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { useToolAction } from '../../hooks/useToolAction';
import { Play } from 'lucide-react';

function parseCurl(curlString: string) {
  let str = curlString.replace(/\\\n/g, ' ').trim();
  if (!str.startsWith('curl ')) return null;

  const args: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (let i = 5; i < str.length; i++) {
    const c = str[i];
    if (escape) { current += c; escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (c === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (/\s/.test(c) && !inSingle && !inDouble) {
      if (current.length > 0) { args.push(current); current = ''; }
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
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headersText, setHeadersText] = useState('{\n  "Accept": "application/json"\n}');
  const [bodyText, setBodyText] = useState('');
  
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    time: number;
    data: string;
    headers: Record<string, string>;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasteCurl = () => {
    navigator.clipboard.readText().then(text => {
      const parsed = parseCurl(text);
      if (parsed) {
        setUrl(parsed.url);
        setMethod(parsed.fetchOptions.method || 'GET');
        setHeadersText(JSON.stringify(parsed.fetchOptions.headers || {}, null, 2));
        setBodyText(parsed.fetchOptions.body || '');
      } else {
        alert("Clipboard doesn't contain a valid cURL command");
      }
    }).catch(() => alert("Failed to read clipboard"));
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse(null);
    recordAction();

    let parsedHeaders = {};
    try {
      parsedHeaders = headersText.trim() ? JSON.parse(headersText) : {};
    } catch (e) {
      setError('Invalid JSON in Headers');
      setLoading(false);
      return;
    }

    const start = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: ['GET', 'HEAD'].includes(method) ? undefined : bodyText || undefined
      });
      const end = performance.now();
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      let data = await res.text();
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch (e) {
        // Not JSON, leave as text
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(end - start),
        data,
        headers: resHeaders
      });
    } catch (e: any) {
      setError(e.message || 'Network request failed (CORS or network error)');
    }
    setLoading(false);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ width: 140 }}>
            <Field label="Method">
              <Dropdown
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'PATCH', label: 'PATCH' },
                  { value: 'DELETE', label: 'DELETE' },
                  { value: 'OPTIONS', label: 'OPTIONS' }
                ]}
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="URL">
              <TextInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </Field>
          </div>
          <Button onClick={handleSend} variant="primary" style={{ height: 44, padding: '0 24px', display: 'flex', gap: 8 }}>
            {loading ? 'Sending...' : <><Play size={16} /> Send</>}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <Field label="Headers (JSON)">
            <TextArea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              rows={4}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </Field>
          <Field label="Body">
            <TextArea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={4}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button onClick={handlePasteCurl} variant="soft" size="sm">
            Import from cURL
          </Button>
        </div>

        <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
          Response
        </div>

        {error && (
          <div style={{ color: 'var(--status-error)', padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
            {error}
          </div>
        )}

        {response && (
          <div className="glass" style={{ padding: 16, borderRadius: 16 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: response.status >= 200 && response.status < 300 ? '#10b981' : '#ef4444' }}>
                {response.status} {response.statusText}
              </span>
              <span style={{ color: 'var(--ink-mute)' }}>{response.time} ms</span>
            </div>
            <TextArea
              value={response.data}
              readOnly
              rows={12}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--surface-icon-bg)' }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
