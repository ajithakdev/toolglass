// Everything Toolglass keeps in this browser; keep in sync with docs/CODEMAP.md "Browser storage keys"
export const STORED: { key: string; what: string; session?: true }[] = [
  { key: 'toolglass-theme', what: 'Your theme choice (absent means Auto)' },
  { key: 'toolglass_favorites', what: 'Tools you starred, in your order' },
  { key: 'toolglass_recent_tools', what: 'The last few tools you opened' },
  { key: 'toolglass_stats', what: 'How often you used each tool' },
  { key: 'toolglass_telemetry_enabled', what: 'Whether usage counting is on' },
  { key: 'tg_ts_history', what: 'Timestamp tool history' },
  { key: 'toolglass_saved_requests', what: 'API Tester saved requests, without passwords or tokens' },
  { key: 'toolglass_request_history', what: 'API Tester history, without passwords or tokens' },
  { key: 'toolglass_notepad', what: 'Your Notepad text' },
  { key: 'toolglass_world_clock', what: 'World Clock time zones' },
  { key: 'toolglass_session_credentials', what: 'API Tester passwords and tokens for this tab only, gone when it closes', session: true },
];
