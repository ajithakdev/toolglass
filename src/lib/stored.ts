// Everything Toolglass keeps in this browser; keep in sync with docs/CODEMAP.md "Browser storage keys"
export type StoredGroup = 'Preferences' | 'Tool data' | 'API Tester';
export const STORED: { key: string; what: string; group: StoredGroup; session?: true }[] = [
  { key: 'toolglass-theme', group: 'Preferences', what: 'Your theme choice (absent means Auto)' },
  { key: 'toolglass_favorites', group: 'Preferences', what: 'Tools you starred, in your order' },
  { key: 'toolglass_recent_tools', group: 'Preferences', what: 'The last few tools you opened' },
  { key: 'toolglass_rail_collapsed', group: 'Preferences', what: 'Whether the desktop tool sidebar is shrunk to icons' },
  { key: 'toolglass_stats', group: 'Preferences', what: 'How often you used each tool' },
  { key: 'toolglass_telemetry_enabled', group: 'Preferences', what: 'Whether usage counting is on' },
  { key: 'tg_ts_history', group: 'Tool data', what: 'Timestamp tool history' },
  { key: 'toolglass_saved_requests', group: 'API Tester', what: 'API Tester saved requests, without passwords or tokens' },
  { key: 'toolglass_request_history', group: 'API Tester', what: 'API Tester history, without passwords or tokens' },
  { key: 'toolglass_notepad', group: 'Tool data', what: 'Your Notepad text' },
  { key: 'toolglass_world_clock', group: 'Tool data', what: 'World Clock time zones' },
  { key: 'toolglass_session_credentials', group: 'API Tester', what: 'API Tester passwords and tokens for this tab only, gone when it closes', session: true },
];
