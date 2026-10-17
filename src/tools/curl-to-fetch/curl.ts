/* eslint-disable @typescript-eslint/no-explicit-any */
// Pure helpers for the API Tester: cURL parsing and JSON path lookups.

export interface QueryParam {
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
}


export function parseCurl(curlString: string) {
  const str = curlString.replace(/\\\n/g, ' ').trim();
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
      fetchOptions.method = (args[++i] ?? 'GET').toUpperCase();
    } else if (arg === '-H' || arg === '--header') {
      const header = args[++i] ?? '';
      const splitIdx = header.indexOf(':');
      if (splitIdx > 0) {
        fetchOptions.headers[header.substring(0, splitIdx).trim()] = header.substring(splitIdx + 1).trim();
      }
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      fetchOptions.body = args[++i] ?? '';
      if (fetchOptions.method === 'GET') fetchOptions.method = 'POST';
    } else if (arg === '-u' || arg === '--user') {
      const auth = args[++i] ?? '';
      fetchOptions.headers['Authorization'] = 'Basic ' + btoa(auth);
    } else if (arg.startsWith('http')) {
      url = arg;
    }
  }
  return { url, fetchOptions };
}

export function getNestedValue(obj: any, path: string): string | null {
  if (!obj || !path) return null;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  if (current === null || current === undefined) return null;
  return typeof current === 'string' ? current : JSON.stringify(current);
}

export function getJsonLeafPaths(obj: any, parentKey = ''): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') {
    return parentKey ? [parentKey] : [];
  }

  let paths: string[] = [];
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      paths = paths.concat(getJsonLeafPaths(obj[0], parentKey ? `${parentKey}.0` : '0'));
    }
  } else {
    for (const key of Object.keys(obj)) {
      const fullPath = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        paths = paths.concat(getJsonLeafPaths(obj[key], fullPath));
      } else {
        paths.push(fullPath);
      }
    }
  }
  return paths;
}

/** Method badge color from theme tokens (works in light and dark). */
export const getMethodColor = (m: string) => {
  switch (m.toUpperCase()) {
    case 'GET': return 'var(--status-success)';
    case 'POST': return 'var(--accent)';
    case 'PUT':
    case 'PATCH': return 'var(--status-warn)';
    case 'DELETE': return 'var(--status-error)';
    default: return 'var(--ink-mute)';
  }
};
