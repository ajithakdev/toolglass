import { Save, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MethodBadge, panelStyle } from './parts';
import type { ApiTester } from './useApiTester';

export function HistoryPanel({ api }: { api: ApiTester }) {
  const { requestHistory, handleClearHistory, loadRequestConfig, handleSaveFromHistory } = api;
  return (
    <div style={panelStyle}>
      <div className="wrap-row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--t-lg)', fontWeight: 620 }}>History</h2>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--t-sm)', color: 'var(--ink-soft)' }}>Your last 15 requests, newest first. Credentials are never kept.</p>
        </div>
        {requestHistory.length > 0 && (
          <Button onClick={handleClearHistory} variant="soft" size="sm">
            <Trash2 size={14} /> Clear history
          </Button>
        )}
      </div>

      {requestHistory.length === 0 ? (
        <p style={{ margin: 0, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 'var(--t-sm)', padding: 'var(--s-7) 0' }}>No requests yet. Send one and it appears here.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requestHistory.map((item) => (
            <li key={item.id} className="glass" style={{ padding: 14, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <MethodBadge method={item.method} />
                <span className="mono" style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</span>
                <time className="num hide-sm" dateTime={new Date(item.timestamp).toISOString()} style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', flexShrink: 0 }}>
                  {new Date(item.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </time>
              </div>
              {/* Wraps on phones instead of clipping (#24) */}
              <div className="wrap-row">
                <Button onClick={() => loadRequestConfig(item)} variant="soft" size="sm">
                  Open in builder
                </Button>
                <Button onClick={() => handleSaveFromHistory(item)} variant="ghost" size="sm">
                  <Save size={14} /> Save as workflow
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
