export interface HeaderParam {
  key: string;
  value: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: HeaderParam[];
  queryParams: { key: string; value: string; type: 'text' }[];
  authType: 'none' | 'bearer' | 'basic';
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  bodyText: string;
  autoCopyPath?: string;
  runCount?: number;
  avgTime?: number;
  description?: string;
  lastStatus?: number;
  lastStatusText?: string;
  lastRunTimestamp?: number;
  requiresAuth?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  headers: HeaderParam[];
  queryParams: { key: string; value: string; type: 'text' }[];
  authType: 'none' | 'bearer' | 'basic';
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  bodyText: string;
}

export interface SessionAuthData {
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
}

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'cookie',
  'set-cookie',
]);

const STORAGE_KEY_SAVED = 'toolglass_saved_requests';
const STORAGE_KEY_HISTORY = 'toolglass_request_history';
const SESSION_KEY_AUTH = 'toolglass_session_credentials';

/**
 * Checks whether a header key contains sensitive credential data that must
 * never be persisted to unencrypted localStorage or exported in workflows.
 */
export function isSensitiveHeader(key: string): boolean {
  if (!key) return false;
  return SENSITIVE_HEADER_NAMES.has(key.trim().toLowerCase());
}

/**
 * Strips all sensitive headers from a header list.
 */
export function sanitizeHeaders(headers: HeaderParam[]): HeaderParam[] {
  if (!Array.isArray(headers)) return [];
  return headers.filter(h => !isSensitiveHeader(h.key));
}

/**
 * Checks whether a request or configuration contains sensitive auth credentials.
 */
export function hasAuthCredentials(config: {
  authType?: string;
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
  headers?: HeaderParam[];
}): boolean {
  if (!config) return false;
  if (config.authType === 'bearer' && (config.bearerToken || '').trim().length > 0) {
    return true;
  }
  if (
    config.authType === 'basic' &&
    ((config.basicUser || '').trim().length > 0 || (config.basicPass || '').trim().length > 0)
  ) {
    return true;
  }
  if (Array.isArray(config.headers)) {
    return config.headers.some(h => isSensitiveHeader(h.key) && h.value.trim().length > 0);
  }
  return false;
}

/**
 * Returns a sanitized copy of a saved request with sensitive credentials stripped.
 * Note: requiresAuth flag is set to true if authType is 'bearer' or 'basic'.
 */
export function sanitizeSavedRequest(req: SavedRequest): SavedRequest {
  const needsAuth = req.authType === 'bearer' || req.authType === 'basic';
  return {
    ...req,
    bearerToken: '',
    basicUser: '',
    basicPass: '',
    headers: sanitizeHeaders(req.headers),
    requiresAuth: needsAuth ? true : req.requiresAuth,
  };
}

/**
 * Returns a sanitized copy of a history item with sensitive credentials stripped.
 */
export function sanitizeHistoryItem(item: HistoryItem): HistoryItem {
  return {
    ...item,
    bearerToken: '',
    basicUser: '',
    basicPass: '',
    headers: sanitizeHeaders(item.headers),
  };
}

/**
 * Stores active session credentials in sessionStorage for a given workflow ID.
 * SessionStorage is cleared automatically when the browser tab is closed.
 */
export function saveSessionAuth(workflowId: string, auth: SessionAuthData): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_AUTH);
    const store: Record<string, SessionAuthData> = raw ? JSON.parse(raw) : {};
    store[workflowId] = auth;
    sessionStorage.setItem(SESSION_KEY_AUTH, JSON.stringify(store));
  } catch {
    // Ignore sessionStorage quota or security restrictions
  }
}

/**
 * Retrieves active session credentials from sessionStorage for a given workflow ID.
 */
export function getSessionAuth(workflowId: string): SessionAuthData | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_AUTH);
    if (!raw) return null;
    const store: Record<string, SessionAuthData> = JSON.parse(raw);
    return store[workflowId] || null;
  } catch {
    return null;
  }
}

/**
 * Clears all or a specific session auth entry from sessionStorage.
 */
export function clearSessionAuth(workflowId?: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    if (workflowId) {
      const raw = sessionStorage.getItem(SESSION_KEY_AUTH);
      if (raw) {
        const store: Record<string, SessionAuthData> = JSON.parse(raw);
        delete store[workflowId];
        sessionStorage.setItem(SESSION_KEY_AUTH, JSON.stringify(store));
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY_AUTH);
    }
  } catch {
    // Ignore
  }
}

/**
 * Scans localStorage for any unencrypted legacy credentials or sensitive headers
 * in saved requests and history. Sanitizes them in place and updates localStorage.
 * Returns the count of scrubbed items.
 */
export function scrubStorageAuth(): { scrubbedSaved: number; scrubbedHistory: number } {
  let scrubbedSaved = 0;
  let scrubbedHistory = 0;

  if (typeof window === 'undefined' || !window.localStorage) {
    return { scrubbedSaved, scrubbedHistory };
  }

  // 1. Scrub saved requests
  try {
    const savedRaw = localStorage.getItem(STORAGE_KEY_SAVED);
    if (savedRaw) {
      const parsed: SavedRequest[] = JSON.parse(savedRaw);
      if (Array.isArray(parsed)) {
        let modified = false;
        const sanitized = parsed.map((item) => {
          const hasTokens = Boolean(item.bearerToken || item.basicUser || item.basicPass);
          const hasAuthHeaders = (item.headers || []).some(h => isSensitiveHeader(h.key));
          if (hasTokens || hasAuthHeaders) {
            modified = true;
            scrubbedSaved++;
            return sanitizeSavedRequest(item);
          }
          return item;
        });

        if (modified) {
          localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(sanitized));
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  // 2. Scrub request history
  try {
    const historyRaw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (historyRaw) {
      const parsed: HistoryItem[] = JSON.parse(historyRaw);
      if (Array.isArray(parsed)) {
        let modified = false;
        const sanitized = parsed.map((item) => {
          const hasTokens = Boolean(item.bearerToken || item.basicUser || item.basicPass);
          const hasAuthHeaders = (item.headers || []).some(h => isSensitiveHeader(h.key));
          if (hasTokens || hasAuthHeaders) {
            modified = true;
            scrubbedHistory++;
            return sanitizeHistoryItem(item);
          }
          return item;
        });

        if (modified) {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(sanitized));
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return { scrubbedSaved, scrubbedHistory };
}
