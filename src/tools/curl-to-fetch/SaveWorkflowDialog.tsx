import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { hasAuthCredentials } from './curlSecurity';
import { Notice } from './parts';
import type { ApiTester } from './useApiTester';

export function SaveWorkflowDialog({ api }: { api: ApiTester }) {
  const { showSaveModal, closeSaveModal, editingWorkflowId, savedRequests, getCurrentRequestConfig, saveToSession, setSaveToSession, saveName, setSaveName, saveDescription, setSaveDescription, autoCopyPath, setAutoCopyPath, getDetectedKeys, applyBuilderToWorkflow, handleSaveRequest } = api;

  useEffect(() => {
    if (!showSaveModal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSaveModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSaveModal, closeSaveModal]);

  if (!showSaveModal) return null;
  const hasCreds = hasAuthCredentials(getCurrentRequestConfig());
  const detected = getDetectedKeys();

  return (
    <div onClick={closeSaveModal} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', padding: 16, background: 'color-mix(in srgb, var(--canvas) 50%, rgba(0,0,0,0.4))', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-wf-h"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 560, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', padding: 24, borderRadius: 'var(--radius-xl)', background: 'var(--surface-3)', border: '1px solid var(--glass-border)', boxShadow: 'var(--edge), var(--e3)', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div className="wrap-row" style={{ justifyContent: 'space-between' }}>
          <h2 id="save-wf-h" style={{ margin: 0, fontSize: 'var(--t-lg)', fontWeight: 620 }}>{editingWorkflowId ? 'Edit workflow' : 'Save request as workflow'}</h2>
          {!editingWorkflowId && <span className="num" style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{savedRequests.length}/50 saved</span>}
        </div>

        {hasCreds && (
          <Notice tone="warn" icon={<ShieldAlert size={15} />}>
            Tokens, passwords, and Authorization headers are never written to local storage.
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" checked={saveToSession} onChange={(e) => setSaveToSession(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
              Remember them in this tab only (cleared when the tab closes)
            </label>
          </Notice>
        )}

        <Field label="Name">
          <TextInput value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Fetch user details" autoFocus />
        </Field>
        <Field label="Notes (optional)">
          <TextArea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} rows={3} placeholder="What this request is for" style={{ fontFamily: 'var(--font-sans)', minHeight: 80 }} />
        </Field>
        <Field label="Copy this response field after each run (optional)">
          <TextInput value={autoCopyPath} onChange={(e) => setAutoCopyPath(e.target.value)} placeholder="e.g. data.token" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} />
        </Field>

        {detected.status === 'ok' && detected.keys && detected.keys.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-soft)' }}>Fields in the last response:</span>
            <div className="wrap-row" style={{ gap: 6, maxHeight: 88, overflowY: 'auto' }}>
              {detected.keys.map((k) => (
                <button key={k} type="button" className={autoCopyPath === k ? 'chip chip-on mono' : 'chip mono'} style={{ height: 26, fontSize: 11 }} onClick={() => setAutoCopyPath(k)}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
            {detected.status === 'too_large' ? 'The last response is too large to list its fields.' : detected.status === 'not_json' ? 'The last response was not JSON, so no fields to suggest.' : 'Send the request first to pick a field from its response.'}
          </p>
        )}

        {editingWorkflowId && (
          <Notice action={<Button size="sm" variant="soft" onClick={applyBuilderToWorkflow}>Apply</Button>}>Replace this workflow's request with what's in the builder now?</Notice>
        )}

        <div className="wrap-row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="soft" onClick={closeSaveModal}>Cancel</Button>
          <Button onClick={handleSaveRequest}>{editingWorkflowId ? 'Save changes' : 'Save workflow'}</Button>
        </div>
      </div>
    </div>
  );
}
