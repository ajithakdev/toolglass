import { useState, useEffect } from 'react';
import { Field, TextArea, TextInput, Dropdown } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { Play, Clipboard, Plus, Trash2, KeyRound, Globe, FileJson, Check, Copy } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToolStats } from '../../hooks/useToolStats';

interface QueryParam {
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
}

interface HeaderParam {
  key: string;
  value: string;
}

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
  const { slug = 'api-tester' } = useParams();
  const { increment } = useToolStats(slug);

  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  
  // Tab control: 'params' | 'auth' | 'headers' | 'body'
  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');

  // Params
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '', type: 'text' }]);
  
  // Auth
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic'>('none');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');

  // Headers (Table driven)
  const [headers, setHeaders] = useState<HeaderParam[]>([
    { key: 'Accept', value: 'application/json' },
    { key: '', value: '' }
  ]);

  // Body
  const [bodyText, setBodyText] = useState('');

  // cURL Input state
  const [curlInput, setCurlInput] = useState('');
  const [isCurlFocused, setIsCurlFocused] = useState(false);
  const [isCopiedResponse, setIsCopiedResponse] = useState(false);
  
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    time: number;
    data: string;
    rawData: string;
    headers: Record<string, string>;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lineWrap, setLineWrap] = useState(false);

  // Keyboard shortcut Alt+Z to toggle word wrap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setLineWrap((w) => !w);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto sync query parameters from input URL
  useEffect(() => {
    try {
      const urlObj = new URL(url);
      const paramsList: QueryParam[] = [];
      urlObj.searchParams.forEach((value, key) => {
        paramsList.push({ key, value, type: 'text' });
      });
      if (paramsList.length > 0) {
        setQueryParams([...paramsList, { key: '', value: '', type: 'text' }]);
      }
    } catch {
      // Not a full URL yet
    }
  }, [url]);

  const handlePasteCurl = () => {
    navigator.clipboard.readText().then(text => {
      setCurlInput(text);
      const parsed = parseCurl(text);
      if (parsed) {
        setUrl(parsed.url);
        setMethod(parsed.fetchOptions.method || 'GET');
        
        // Populate headers
        const parsedHeaders: HeaderParam[] = [];
        Object.entries(parsed.fetchOptions.headers || {}).forEach(([k, v]) => {
          parsedHeaders.push({ key: k, value: v as string });
        });
        parsedHeaders.push({ key: '', value: '' });
        setHeaders(parsedHeaders);
        
        // Populate body
        setBodyText(parsed.fetchOptions.body || '');
        
        // Increment stats on user action
        increment();
      }
    }).catch(() => {});
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    // Build URL query string dynamically
    let targetUrl = url.trim();
    
    // Quick sanity validations to prevent page/browser crashes from massive pastes
    if (!targetUrl) {
      setError('URL cannot be empty');
      setLoading(false);
      return;
    }
    if (targetUrl.length > 2048) {
      setError('URL is too long (maximum 2048 characters)');
      setLoading(false);
      return;
    }
    if (!/^https?:\/\//i.test(targetUrl)) {
      setError('Invalid URL protocol. URL must start with http:// or https://');
      setLoading(false);
      return;
    }

    try {
      const urlObj = new URL(targetUrl);
      urlObj.search = ''; // reset existing params first
      queryParams.forEach((p) => {
        if (p.key.trim()) {
          urlObj.searchParams.append(p.key.trim(), p.value.trim());
        }
      });
      targetUrl = urlObj.toString();
    } catch {
      setError('Malformed URL format. Please verify and try again.');
      setLoading(false);
      return;
    }

    // Build Headers
    const requestHeaders: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim()) {
        requestHeaders[h.key.trim()] = h.value.trim();
      }
    });

    // Apply Auth
    if (authType === 'bearer' && bearerToken.trim()) {
      requestHeaders['Authorization'] = `Bearer ${bearerToken.trim().replace(/^bearer\s+/i, '')}`;
    } else if (authType === 'basic' && (basicUser.trim() || basicPass.trim())) {
      requestHeaders['Authorization'] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
    }

    // Build Body
    let requestBody: any = undefined;
    const isGetOrHead = ['GET', 'HEAD'].includes(method);
    
    if (!isGetOrHead) {
      const hasFile = queryParams.some(p => p.type === 'file' && p.file);
      if (hasFile) {
        const formData = new FormData();
        queryParams.forEach(p => {
          if (p.key.trim()) {
            if (p.type === 'file' && p.file) {
              formData.append(p.key.trim(), p.file);
            } else {
              formData.append(p.key.trim(), p.value);
            }
          }
        });
        requestBody = formData;
        // Fetch auto sets Content-Type for FormData
        delete requestHeaders['Content-Type'];
      } else {
        requestBody = bodyText || undefined;
      }
    }

    const start = performance.now();
    try {
      const res = await fetch(targetUrl, {
        method,
        headers: requestHeaders,
        body: requestBody
      });
      const end = performance.now();
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      const rawText = await res.text();
      const rawLength = rawText.length;
      let data = rawText;
      
      // If response payload is massive (>1MB), do not pretty-print it to avoid blocking the main UI thread.
      // Also truncate the render string in the DOM but keep a note for copying.
      if (rawLength > 1024 * 1024) {
        data = `[Response is very large (${(rawLength / 1024 / 1024).toFixed(2)} MB). Formatting and DOM rendering is skipped to maintain performance. Click "Copy Response" to copy the full raw payload.]\n\n` + rawText.substring(0, 50000) + '\n\n...[Truncated for performance]...';
      } else {
        try {
          data = JSON.stringify(JSON.parse(data), null, 2);
        } catch (e) {
          // Not JSON
        }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(end - start),
        data,
        rawData: rawText,
        headers: resHeaders
      });
      
      increment(); // Successful API tester usage counts as a real tool usage!
    } catch (e: any) {
      setError(e.message || 'Network request failed (CORS or network error)');
    }
    setLoading(false);
  };

  const addQueryParamRow = () => {
    setQueryParams([...queryParams, { key: '', value: '', type: 'text' }]);
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.rawData);
      setIsCopiedResponse(true);
      setTimeout(() => setIsCopiedResponse(false), 2000);
      increment();
    }
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Main URL Bar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ width: 120 }}>
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
          <div style={{ flex: 1, minWidth: 260 }}>
            <Field label="URL">
              <TextInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </Field>
          </div>
          <Button onClick={handleSend} variant="primary" style={{ height: 42, padding: '0 24px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {loading ? 'Sending...' : <><Play size={15} /> Send</>}
          </Button>
        </div>

        {/* cURL Import & Quick Paste bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="glass">
          <div style={{ 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface-input)', 
            borderRadius: 10, 
            border: isCurlFocused ? '1px solid var(--accent)' : '1px solid var(--glass-border)', 
            boxShadow: isCurlFocused ? '0 0 0 4px rgba(139, 92, 246, 0.1)' : 'none',
            transition: 'all 0.2s ease',
            paddingRight: 4 
          }}>
            <input
              type="text"
              value={curlInput}
              onFocus={() => setIsCurlFocused(true)}
              onBlur={() => setIsCurlFocused(false)}
              onChange={(e) => {
                setCurlInput(e.target.value);
                const parsed = parseCurl(e.target.value);
                if (parsed) {
                  setUrl(parsed.url);
                  setMethod(parsed.fetchOptions.method || 'GET');
                  const parsedHeaders: HeaderParam[] = [];
                  Object.entries(parsed.fetchOptions.headers || {}).forEach(([k, v]) => {
                    parsedHeaders.push({ key: k, value: v as string });
                  });
                  parsedHeaders.push({ key: '', value: '' });
                  setHeaders(parsedHeaders);
                  setBodyText(parsed.fetchOptions.body || '');
                }
              }}
              placeholder="Paste cURL command here..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                padding: '12px 16px',
                color: 'var(--ink)'
              }}
            />
            <Button
              onClick={handlePasteCurl}
              variant="soft"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12
              }}
            >
              <Clipboard size={13} />
              Paste from Clipboard
            </Button>
          </div>
        </div>

        {/* Request Details Tabs */}
        <div>
          <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--divider)', paddingBottom: 8 }}>
            <button
              onClick={() => setActiveTab('params')}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'params' ? 'var(--accent)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'params' ? '2px solid var(--accent)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Globe size={13} /> Parameters
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'auth' ? 'var(--accent)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'auth' ? '2px solid var(--accent)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <KeyRound size={13} /> Authorization
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'headers' ? 'var(--accent)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'headers' ? '2px solid var(--accent)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Headers
            </button>
            {!['GET', 'HEAD'].includes(method) && (
              <button
                onClick={() => setActiveTab('body')}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeTab === 'body' ? 'var(--accent)' : 'var(--ink-soft)',
                  borderBottom: activeTab === 'body' ? '2px solid var(--accent)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileJson size={13} /> Body
              </button>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            {/* Tab content: Params */}
            {activeTab === 'params' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {queryParams.map((param, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <TextInput
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...queryParams];
                        newParams[index].key = e.target.value;
                        setQueryParams(newParams);
                      }}
                      placeholder="Name (e.g. query)"
                      style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <Dropdown
                        value={param.type}
                        onChange={(val) => {
                          const newParams = [...queryParams];
                          newParams[index].type = val as 'text' | 'file';
                          setQueryParams(newParams);
                        }}
                        options={[
                          { value: 'text', label: 'Text' },
                          { value: 'file', label: 'File Upload' }
                        ]}
                      />
                    </div>
                    {param.type === 'file' ? (
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flex: 1, userSelect: 'none' }}>
                        <input
                          type="file"
                          id={`file-upload-${index}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newParams = [...queryParams];
                              newParams[index].file = file;
                              newParams[index].value = file.name; // Use file name as display value
                              setQueryParams(newParams);
                            }
                          }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                        />
                        <div
                          className="glass"
                          style={{
                            padding: '10px 14px',
                            borderRadius: 12,
                            border: '1px solid var(--line)',
                            background: 'var(--surface-input)',
                            fontSize: 13,
                            color: 'var(--ink)',
                            width: '100%',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pointerEvents: 'none'
                          }}
                        >
                          <span style={{ color: param.file ? 'var(--ink)' : 'var(--ink-soft)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {param.file ? param.file.name : 'Choose File...'}
                          </span>
                          <span style={{ fontSize: 11, background: 'var(--surface-button-off)', padding: '2px 8px', borderRadius: 6, color: 'var(--ink-soft)', marginLeft: 8 }}>
                            Browse
                          </span>
                        </div>
                      </div>
                    ) : (
                      <TextInput
                        value={param.value}
                        onChange={(e) => {
                          const newParams = [...queryParams];
                          newParams[index].value = e.target.value;
                          setQueryParams(newParams);
                        }}
                        placeholder="Value"
                        style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}
                      />
                    )}
                    <button
                      onClick={() => {
                        const newParams = queryParams.filter((_, idx) => idx !== index);
                        setQueryParams(newParams.length ? newParams : [{ key: '', value: '', type: 'text' }]);
                      }}
                      style={{ cursor: 'pointer', color: 'var(--ink-mute)', display: 'grid', placeItems: 'center', padding: 8 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex' }}>
                  <Button onClick={addQueryParamRow} variant="soft" size="sm" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Plus size={13} /> Add row
                  </Button>
                </div>
              </div>
            )}

            {/* Tab content: Auth */}
            {activeTab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Auth Type</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['none', 'bearer', 'basic'].map((type) => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="radio"
                          name="auth_type"
                          checked={authType === type}
                          onChange={() => setAuthType(type as any)}
                        />
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                {authType === 'bearer' && (
                  <Field label="Token">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        position: 'absolute', 
                        left: 14, 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: 13, 
                        color: 'var(--ink-mute)', 
                        userSelect: 'none' 
                      }}>
                        Bearer 
                      </span>
                      <TextInput
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        placeholder="token-value"
                        style={{ fontFamily: 'var(--font-mono)', paddingLeft: 64, fontSize: 13 }}
                      />
                    </div>
                  </Field>
                )}

                {authType === 'basic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Username">
                      <TextInput
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        placeholder="Username"
                      />
                    </Field>
                    <Field label="Password">
                      <TextInput
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        type="password"
                        placeholder="Password"
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Tab content: Headers */}
            {activeTab === 'headers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {headers.map((header, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <TextInput
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...headers];
                        newHeaders[index].key = e.target.value;
                        setHeaders(newHeaders);
                      }}
                      placeholder="Header Name"
                      style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <TextInput
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...headers];
                        newHeaders[index].value = e.target.value;
                        setHeaders(newHeaders);
                      }}
                      placeholder="Header Value"
                      style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <button
                      onClick={() => {
                        const newHeaders = headers.filter((_, idx) => idx !== index);
                        setHeaders(newHeaders.length ? newHeaders : [{ key: '', value: '' }]);
                      }}
                      style={{ cursor: 'pointer', color: 'var(--ink-mute)', display: 'grid', placeItems: 'center', padding: 8 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex' }}>
                  <Button onClick={addHeaderRow} variant="soft" size="sm" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Plus size={13} /> Add row
                  </Button>
                </div>
              </div>
            )}

            {/* Tab content: Body */}
            {activeTab === 'body' && (
              <Field label="Body raw payload">
                <TextArea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={6}
                  placeholder='{\n  "key": "value"\n}'
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </Field>
            )}
          </div>
        </div>

        {/* Response output container */}
        <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

        {error && (
          <div style={{ color: 'var(--status-error)', padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
            {error}
          </div>
        )}

        {response ? (
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: response.status >= 200 && response.status < 300 ? '#10b981' : '#ef4444' }}>
                  STATUS: {response.status} {response.statusText}
                </span>
                <span style={{ color: 'var(--ink-soft)' }}>
                  TIME: {response.time} ms
                </span>
              </div>
              <Button onClick={handleCopyResponse} variant="soft" size="sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {isCopiedResponse ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy Response</>}
              </Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}>Response Body</div>
                 <button
                  type="button"
                  onClick={() => setLineWrap((w) => !w)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--ink)',
                    background: 'var(--surface-nav-item)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8,
                    padding: '4px 8px 4px 10px',
                    boxShadow: lineWrap ? '0 0 12px rgba(139, 92, 246, 0.25)' : 'none'
                  }}
                  title="Toggle Word Wrap (Alt+Z)"
                >
                  <span style={{ color: 'var(--ink-soft)' }}>Word Wrap</span>
                  <kbd style={{
                    fontSize: 9,
                    background: 'var(--kbd-bg)',
                    color: 'var(--ink-soft)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1
                  }}>
                    Alt+Z
                  </kbd>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 5,
                    background: lineWrap ? 'var(--accent)' : 'var(--surface-button-off)',
                    color: lineWrap ? '#fff' : 'var(--ink-soft)',
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.2s'
                  }}>
                    {lineWrap ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                overflowX: lineWrap ? 'hidden' : 'auto',
                background: 'var(--surface-input)', 
                borderRadius: 10, 
                border: '1px solid var(--glass-border)',
                padding: 16,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
                wordBreak: lineWrap ? 'break-all' : 'normal',
                color: 'var(--ink)'
              }}>
                {response.data || '[Empty response body]'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--ink-mute)', fontSize: 13, padding: '24px 0' }}>
            Send a request to see the response here
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
