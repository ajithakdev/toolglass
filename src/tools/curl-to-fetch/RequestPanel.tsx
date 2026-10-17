import { Check, Clipboard, Copy, FileJson, Globe, KeyRound, ListTree, Play, Plus, Save, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { Kbd } from '../../components/Shell';
import { Button } from '../../components/ui/Button';
import { Dropdown, Field, TextArea, TextInput } from '../../components/ui/Field';
import { Segmented } from '../../components/ui/Segmented';
import { isSensitiveHeader } from './curlSecurity';
import { Notice, panelStyle } from './parts';
import type { ApiTester } from './useApiTester';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].map((m) => ({ value: m, label: m }));
const mono = { fontFamily: 'var(--font-mono)', fontSize: 13 } as const;

function ParamsEditor({ api }: { api: ApiTester }) {
  const { queryParams, setQueryParams, addQueryParamRow } = api;
  const update = (index: number, patch: Partial<(typeof queryParams)[number]>) =>
    setQueryParams(queryParams.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {queryParams.map((param, index) => (
        <div key={index} className="kv-row">
          <TextInput style={{ ...mono, gridArea: 'name' }} value={param.key} onChange={(e) => update(index, { key: e.target.value })} placeholder="Name" aria-label={`Parameter ${index + 1} name`} />
          <div style={{ gridArea: 'type' }}>
            <Dropdown
              value={param.type}
              onChange={(v) => update(index, { type: v as 'text' | 'file' })}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'file', label: 'File' },
              ]}
            />
          </div>
          {param.type === 'file' ? (
            <label className="glass" style={{ gridArea: 'value', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minWidth: 0 }}>
              <span style={{ fontSize: 13, color: param.file ? 'var(--ink)' : 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{param.file ? param.file.name : 'Choose a file'}</span>
              <span style={{ fontSize: 'var(--t-xs)', color: 'var(--accent)', fontWeight: 600 }}>Browse</span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) update(index, { file, value: file.name });
                }}
              />
            </label>
          ) : (
            <TextInput style={{ ...mono, gridArea: 'value' }} value={param.value} onChange={(e) => update(index, { value: e.target.value })} placeholder="Value" aria-label={`Parameter ${index + 1} value`} />
          )}
          <button
            type="button"
            className="icon-btn danger"
            style={{ gridArea: 'del' }}
            aria-label={`Remove parameter ${index + 1}`}
            onClick={() => {
              const next = queryParams.filter((_, i) => i !== index);
              setQueryParams(next.length ? next : [{ key: '', value: '', type: 'text' }]);
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div>
        <Button onClick={addQueryParamRow} variant="soft" size="sm">
          <Plus size={14} /> Add parameter
        </Button>
      </div>
    </div>
  );
}

function HeadersEditor({ api }: { api: ApiTester }) {
  const { headers, setHeaders, addHeaderRow } = api;
  const update = (index: number, patch: Partial<(typeof headers)[number]>) => setHeaders(headers.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {headers.map((header, index) => (
        <div key={index} className="kv-row no-type">
          <TextInput style={{ ...mono, gridArea: 'name' }} value={header.key} onChange={(e) => update(index, { key: e.target.value })} placeholder="Header name" aria-label={`Header ${index + 1} name`} />
          <TextInput style={{ ...mono, gridArea: 'value' }} value={header.value} onChange={(e) => update(index, { value: e.target.value })} placeholder="Value" aria-label={`Header ${index + 1} value`} />
          <span style={{ gridArea: 'tag' }}>
            {isSensitiveHeader(header.key) && (
              <span
                title="Sensitive header: never saved to storage or history"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--status-warn)', whiteSpace: 'nowrap' }}
              >
                <ShieldAlert size={12} /> Sensitive
              </span>
            )}
          </span>
          <button
            type="button"
            className="icon-btn danger"
            style={{ gridArea: 'del' }}
            aria-label={`Remove header ${index + 1}`}
            onClick={() => {
              const next = headers.filter((_, i) => i !== index);
              setHeaders(next.length ? next : [{ key: '', value: '' }]);
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div>
        <Button onClick={addHeaderRow} variant="soft" size="sm">
          <Plus size={14} /> Add header
        </Button>
      </div>
    </div>
  );
}

function AuthEditor({ api }: { api: ApiTester }) {
  const { authType, setAuthType, bearerToken, setBearerToken, basicUser, setBasicUser, basicPass, setBasicPass, handleForgetActiveCredentials } = api;
  const hasCreds = !!(bearerToken.trim() || basicUser.trim() || basicPass.trim());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Notice
        icon={<ShieldCheck size={15} />}
        action={
          hasCreds && (
            <Button variant="ghost" size="sm" onClick={handleForgetActiveCredentials} style={{ color: 'var(--status-error)' }}>
              <KeyRound size={13} /> Forget credentials
            </Button>
          )
        }
      >
        Credentials stay in memory only and are never saved to local storage.
      </Notice>
      <div className="rail">
        <Segmented
          label="Auth type"
          value={authType}
          onChange={(v) => setAuthType(v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'bearer', label: 'Bearer token' },
            { value: 'basic', label: 'Basic auth' },
          ]}
        />
      </div>
      {authType === 'bearer' && (
        <Field label="Token">
          <div style={{ position: 'relative' }}>
            <span className="mono" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink-mute)', pointerEvents: 'none' }}>
              Bearer
            </span>
            <TextInput value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} placeholder="token" autoComplete="off" style={{ ...mono, paddingLeft: 68 }} />
          </div>
        </Field>
      )}
      {authType === 'basic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Username">
            <TextInput value={basicUser} onChange={(e) => setBasicUser(e.target.value)} placeholder="Username" autoComplete="off" />
          </Field>
          <Field label="Password">
            <TextInput value={basicPass} onChange={(e) => setBasicPass(e.target.value)} type="password" placeholder="Password" autoComplete="off" />
          </Field>
        </div>
      )}
    </div>
  );
}

function ResponseView({ api }: { api: ApiTester }) {
  const { response, error, lineWrap, setLineWrap, isCopiedResponse, handleCopyResponse } = api;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!response) {
    return <p style={{ margin: 0, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 'var(--t-sm)', padding: 'var(--s-5) 0' }}>Send a request to see the response here.</p>;
  }
  const ok = response.status >= 200 && response.status < 300;
  return (
    <section aria-label="Response" className="glass" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 'var(--radius)' }}>
      <div className="wrap-row" style={{ justifyContent: 'space-between' }}>
        <div className="wrap-row num" style={{ gap: 16, fontSize: 'var(--t-sm)', fontWeight: 600 }}>
          <span style={{ color: ok ? 'var(--status-success)' : 'var(--status-error)' }}>
            {response.status} {response.statusText}
          </span>
          <span style={{ color: 'var(--ink-soft)' }}>{response.time} ms</span>
        </div>
        <div className="wrap-row">
          <Button variant="ghost" size="sm" onClick={() => setLineWrap((w) => !w)} aria-pressed={lineWrap} title="Toggle word wrap (Alt+Z)">
            Wrap {lineWrap ? 'on' : 'off'} <Kbd>Alt Z</Kbd>
          </Button>
          <Button onClick={handleCopyResponse} variant="soft" size="sm">
            {isCopiedResponse ? <Check size={14} /> : <Copy size={14} />} {isCopiedResponse ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
      <pre
        className="mono"
        style={{
          margin: 0,
          maxHeight: 420,
          overflow: 'auto',
          background: 'var(--surface-input)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          padding: 14,
          fontSize: 13,
          lineHeight: 1.55,
          whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
          wordBreak: lineWrap ? 'break-all' : 'normal',
          color: 'var(--ink)',
        }}
      >
        {response.data || '[Empty response body]'}
      </pre>
    </section>
  );
}

export function RequestPanel({ api }: { api: ApiTester }) {
  const { method, setMethod, url, setUrl, loading, handleSend, handleInlineSaveClick, curlInput, applyCurlText, handlePasteCurl, activeTab, setActiveTab } = api;
  const hasBody = !['GET', 'HEAD'].includes(method);
  const tabs = [
    { value: 'params' as const, label: 'Params', icon: <ListTree size={14} /> },
    { value: 'auth' as const, label: 'Auth', icon: <KeyRound size={14} /> },
    { value: 'headers' as const, label: 'Headers', icon: <Globe size={14} /> },
    ...(hasBody ? [{ value: 'body' as const, label: 'Body', icon: <FileJson size={14} /> }] : []),
  ];
  // GET and HEAD have no body; fall back to Params if Body was open
  const tab = hasBody || activeTab !== 'body' ? activeTab : 'params';

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ width: 120 }}>
          <Field label="Method">
            <Dropdown value={method} onChange={setMethod} options={METHODS} />
          </Field>
        </div>
        <div style={{ flex: 1, minWidth: 'min(100%, 260px)' }}>
          <Field label="URL">
            <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/v1/resource" style={mono} inputMode="url" />
          </Field>
        </div>
        <div className="wrap-row">
          <Button onClick={handleInlineSaveClick} variant="soft" style={{ height: 44 }}>
            <Save size={15} /> Save
          </Button>
          <Button onClick={handleSend} disabled={loading} style={{ height: 44, minWidth: 104 }}>
            <Play size={15} /> {loading ? 'Sending' : 'Send'}
          </Button>
        </div>
      </div>

      <div className="glass focus-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 14px', borderRadius: 'var(--radius-sm)' }}>
        <input
          className="bare-input mono"
          value={curlInput}
          onChange={(e) => applyCurlText(e.target.value)}
          placeholder="Paste a cURL command to fill the request"
          aria-label="cURL command"
          style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontSize: 13, height: 36, color: 'var(--ink)' }}
        />
        <Button onClick={handlePasteCurl} variant="soft" size="sm">
          <Clipboard size={14} /> <span className="hide-sm">Paste</span>
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="rail">
          <Segmented label="Request details" value={tab} onChange={setActiveTab} options={tabs} size="sm" />
        </div>
        {tab === 'params' && <ParamsEditor api={api} />}
        {tab === 'auth' && <AuthEditor api={api} />}
        {tab === 'headers' && <HeadersEditor api={api} />}
        {tab === 'body' && (
          <Field label="Body">
            <TextArea value={api.bodyText} onChange={(e) => api.setBodyText(e.target.value)} rows={7} placeholder={'{\n  "key": "value"\n}'} />
          </Field>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />
      <ResponseView api={api} />
    </div>
  );
}
