import { Download, Lock, Pencil, Play, Plus, ShieldAlert, Sparkles, Trash2, Upload, Zap } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { MethodBadge, panelStyle } from './parts';
import type { ApiTester } from './useApiTester';

export function WorkflowsPanel({ api }: { api: ApiTester }) {
  const { savedRequests, handleImportWorkflows, handleExportWorkflows, handleForgetAllSavedCredentials, handleInlineSaveClick, handleQuickRun, loadRequestConfig, handleEditWorkflow, handleDeleteRequest } = api;
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div style={panelStyle}>
      <div className="wrap-row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--t-lg)', fontWeight: 620 }}>Saved workflows</h2>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>Requests you run often, with optional auto-copy of a response field. Up to 50.</p>
        </div>
        {/* Wraps on phones instead of overflowing (#23) */}
        <div className="wrap-row">
          <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} onChange={handleImportWorkflows} />
          <Button onClick={() => fileRef.current?.click()} variant="soft" size="sm">
            <Upload size={14} /> Import
          </Button>
          <Button onClick={handleExportWorkflows} variant="soft" size="sm" disabled={savedRequests.length === 0}>
            <Download size={14} /> Export
          </Button>
          <Button onClick={handleForgetAllSavedCredentials} variant="ghost" size="sm" style={{ color: 'var(--status-error)' }} title="Clear credentials from this tab and scrub local storage">
            <ShieldAlert size={14} /> Forget credentials
          </Button>
          <Button onClick={handleInlineSaveClick} size="sm">
            <Plus size={14} /> Save current request
          </Button>
        </div>
      </div>

      {savedRequests.length === 0 ? (
        <p style={{ margin: 0, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 'var(--t-sm)', padding: 'var(--s-7) 0' }}>
          No saved workflows yet. Build a request and press Save.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
          {savedRequests.map((req) => {
            const ok = req.lastStatus !== undefined && req.lastStatus >= 200 && req.lastStatus < 300;
            return (
              <article key={req.id} className="glass" style={{ padding: 16, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 620, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.name}</h3>
                    <p className="mono" style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.url}</p>
                  </div>
                  <MethodBadge method={req.method} />
                </div>
                {req.description && <p style={{ margin: 0, fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>{req.description}</p>}
                {req.autoCopyPath && (
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
                    <Sparkles size={13} color="var(--accent)" /> Copies <code className="mono" style={{ background: 'var(--surface-input)', padding: '1px 6px', borderRadius: 4 }}>{req.autoCopyPath}</code>
                  </p>
                )}
                <div className="wrap-row num" style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', gap: 10 }}>
                  {req.authType !== 'none' && (
                    <span title="Credentials are not stored" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 600 }}>
                      <Lock size={11} /> {req.authType} auth
                    </span>
                  )}
                  {!!req.runCount && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={11} /> {req.runCount} {req.runCount === 1 ? 'run' : 'runs'}, avg {req.avgTime} ms
                    </span>
                  )}
                  {req.lastStatus !== undefined && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: ok ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
                      {req.lastStatus === 0 ? 'Error' : req.lastStatus}
                    </span>
                  )}
                  {req.lastRunTimestamp && <span>{new Date(req.lastRunTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                <div className="wrap-row" style={{ marginTop: 2 }}>
                  <Button onClick={() => handleQuickRun(req)} size="sm" style={{ flex: 1 }}>
                    <Play size={13} /> Run
                  </Button>
                  <Button onClick={() => loadRequestConfig(req)} variant="soft" size="sm">
                    Open
                  </Button>
                  <button type="button" className="icon-btn" onClick={() => handleEditWorkflow(req)} aria-label={`Edit ${req.name}`} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => handleDeleteRequest(req.id, req.name)} aria-label={`Delete ${req.name}`} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
