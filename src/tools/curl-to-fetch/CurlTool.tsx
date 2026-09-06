/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Field, TextArea, TextInput, Dropdown } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import {
  Play, Clipboard, Plus, Trash2, KeyRound, Globe,
  FileJson, Check, Copy, Sparkles, Save, Download, Upload,
  History as HistoryIcon, Edit2, ShieldAlert, ShieldCheck, Lock
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToolStats } from '../../hooks/useToolStats';
import { useToast } from '../../components/ui/Toast';
import {
  HeaderParam,
  SavedRequest,
  HistoryItem,
  isSensitiveHeader,
  sanitizeHeaders,
  hasAuthCredentials,
  sanitizeSavedRequest,
  sanitizeHistoryItem,
  saveSessionAuth,
  getSessionAuth,
  clearSessionAuth,
  scrubStorageAuth
} from './curlSecurity';

interface QueryParam {
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
}


function parseCurl(curlString: string) {
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

function getNestedValue(obj: any, path: string): string | null {
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

function getJsonLeafPaths(obj: any, parentKey = ''): string[] {
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

const getMethodColor = (m: string) => {
  switch (m.toUpperCase()) {
    case 'GET': return '#10b981';
    case 'POST': return '#8b5cf6';
    case 'PUT':
    case 'PATCH': return '#f59e0b';
    case 'DELETE': return '#ef4444';
    default: return 'var(--ink-mute)';
  }
};

export default function CurlTool() {
  const { slug = 'api-tester' } = useParams();
  const { increment } = useToolStats(slug);
  const toast = useToast();

  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');

  // Top level Tab state: 'testing' | 'workflows' | 'history'
  const [mainTab, setMainTab] = useState<'testing' | 'workflows' | 'history'>('testing');

  // Tab control inside editor: 'params' | 'auth' | 'headers' | 'body'
  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');

  // Params
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '', type: 'text' }]);

  // Auth
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic'>('none');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');

  // Headers
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

  // Saved Workflows & History State (100% Privacy sanitized from localStorage)
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>(() => {
    try {
      const stored = localStorage.getItem('toolglass_saved_requests');
      if (!stored) return [];
      const parsed: SavedRequest[] = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(sanitizeSavedRequest) : [];
    } catch {
      return [];
    }
  });

  const [requestHistory, setRequestHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('toolglass_request_history');
      if (!stored) return [];
      const parsed: HistoryItem[] = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(sanitizeHistoryItem) : [];
    } catch {
      return [];
    }
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [autoCopyPath, setAutoCopyPath] = useState('');
  const [saveToSession, setSaveToSession] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  // Privacy migration: Scrub any legacy unencrypted tokens from localStorage on mount
  useEffect(() => {
    const { scrubbedSaved, scrubbedHistory } = scrubStorageAuth();
    if (scrubbedSaved > 0 || scrubbedHistory > 0) {
      toast.push(
        `Privacy Protection: Cleared legacy unencrypted credentials from ${scrubbedSaved + scrubbedHistory} stored items.`,
        'info'
      );
      setSavedRequests((prev) => prev.map(sanitizeSavedRequest));
      setRequestHistory((prev) => prev.map(sanitizeHistoryItem));
    }
  }, [toast]);

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

        const parsedHeaders: HeaderParam[] = [];
        Object.entries(parsed.fetchOptions.headers || {}).forEach(([k, v]) => {
          parsedHeaders.push({ key: k, value: v as string });
        });
        parsedHeaders.push({ key: '', value: '' });
        setHeaders(parsedHeaders);

        setBodyText(parsed.fetchOptions.body || '');
        increment();
      }
    }).catch(() => {});
  };

  const getCurrentRequestConfig = () => {
    const serializedParams = queryParams
      .filter(p => p.key.trim())
      .map(p => ({
        key: p.key.trim(),
        value: p.type === 'file' ? '' : p.value.trim(),
        type: 'text' as const
      }));

    return {
      url: url.trim(),
      method,
      queryParams: serializedParams,
      authType,
      bearerToken: bearerToken.trim(),
      basicUser: basicUser.trim(),
      basicPass: basicPass.trim(),
      headers: headers.filter(h => h.key.trim()),
      bodyText,
    };
  };

  const loadRequestConfig = (config: any) => {
    setUrl(config.url || '');
    setMethod(config.method || 'GET');
    setQueryParams(config.queryParams && config.queryParams.length ? config.queryParams : [{ key: '', value: '', type: 'text' }]);
    setAuthType(config.authType || 'none');

    // Restore credentials from tab's sessionStorage if available for this workflow ID
    const sessionAuth = config.id ? getSessionAuth(config.id) : null;
    const token = sessionAuth?.bearerToken || config.bearerToken || '';
    const user = sessionAuth?.basicUser || config.basicUser || '';
    const pass = sessionAuth?.basicPass || config.basicPass || '';

    setBearerToken(token);
    setBasicUser(user);
    setBasicPass(pass);
    setHeaders(config.headers && config.headers.length ? config.headers : [{ key: '', value: '' }]);
    setBodyText(config.bodyText || '');
    setMainTab('testing'); // Switch back to editor

    if (config.authType && config.authType !== 'none' && !token && !pass) {
      toast.push(`Request loaded. Please enter credentials for ${config.authType.toUpperCase()} authentication.`, 'info');
    } else {
      toast.push('Request loaded into builder', 'info');
    }
  };

  const addHistoryItem = (config: any) => {
    const rawItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      url: config.url,
      method: config.method,
      queryParams: config.queryParams || [],
      authType: config.authType || 'none',
      bearerToken: '',
      basicUser: '',
      basicPass: '',
      headers: sanitizeHeaders(config.headers || []),
      bodyText: config.bodyText || '',
    };

    const newItem = sanitizeHistoryItem(rawItem);

    setRequestHistory((prev) => {
      const filtered = prev.filter(item => item.url !== config.url || item.method !== config.method);
      const updated = [newItem, ...filtered].slice(0, 15); // Limit to last 15 requests
      localStorage.setItem('toolglass_request_history', JSON.stringify(updated.map(sanitizeHistoryItem)));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setRequestHistory([]);
    localStorage.removeItem('toolglass_request_history');
    toast.push('Request history cleared', 'info');
  };

  const handleForgetActiveCredentials = () => {
    setBearerToken('');
    setBasicUser('');
    setBasicPass('');
    setHeaders(prev => {
      const filtered = prev.filter(h => !isSensitiveHeader(h.key));
      return filtered.length > 0 ? filtered : [{ key: '', value: '' }];
    });
    clearSessionAuth();
    toast.push('Active credentials forgotten and purged from memory.', 'success');
  };

  const handleForgetAllSavedCredentials = () => {
    clearSessionAuth();
    const { scrubbedSaved, scrubbedHistory } = scrubStorageAuth();
    setSavedRequests(prev => prev.map(sanitizeSavedRequest));
    setRequestHistory(prev => prev.map(sanitizeHistoryItem));
    toast.push(
      scrubbedSaved > 0 || scrubbedHistory > 0
        ? `Purged all credentials! Scrubbed ${scrubbedSaved} workflows and ${scrubbedHistory} history items.`
        : 'All session credentials and stored auth data purged.',
      'success'
    );
  };

  const getDetectedKeys = () => {
    if (!response || !response.rawData) return { status: 'no_response' };
    if (response.rawData.length > 1024 * 1024) return { status: 'too_large' };
    try {
      const parsed = JSON.parse(response.rawData);
      const keys = getJsonLeafPaths(parsed);
      return { status: 'ok', keys: keys.slice(0, 15) };
    } catch {
      return { status: 'not_json' };
    }
  };

  const handleSaveRequest = () => {
    if (!saveName.trim()) {
      toast.push('Please enter a name for the workflow', 'error');
      return;
    }

    const currentConfig = getCurrentRequestConfig();
    const hasCreds = hasAuthCredentials(currentConfig);

    if (editingWorkflowId) {
      setSavedRequests((prev) => {
        const updated = prev.map((r) => {
          if (r.id === editingWorkflowId) {
            return {
              ...r,
              name: saveName.trim(),
              description: saveDescription.trim() || undefined,
              autoCopyPath: autoCopyPath.trim() || undefined
            };
          }
          return r;
        });
        localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
        return updated;
      });
      if (saveToSession && hasCreds) {
        saveSessionAuth(editingWorkflowId, {
          bearerToken: currentConfig.bearerToken,
          basicUser: currentConfig.basicUser,
          basicPass: currentConfig.basicPass
        });
      }
      toast.push(`Workflow "${saveName}" updated!`, 'success');
    } else {
      if (savedRequests.length >= 50) {
        toast.push('Maximum limit of 50 workflows reached. Please delete some before saving new ones.', 'error');
        return;
      }
      const newId = Date.now().toString();
      const sanitizedConfig = sanitizeSavedRequest({
        id: newId,
        name: saveName.trim(),
        description: saveDescription.trim() || undefined,
        autoCopyPath: autoCopyPath.trim() || undefined,
        runCount: 0,
        avgTime: 0,
        ...currentConfig
      });

      if (saveToSession && hasCreds) {
        saveSessionAuth(newId, {
          bearerToken: currentConfig.bearerToken,
          basicUser: currentConfig.basicUser,
          basicPass: currentConfig.basicPass
        });
      }

      setSavedRequests((prev) => {
        const updated = [sanitizedConfig, ...prev];
        localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
        return updated;
      });
      toast.push(`Workflow "${saveName}" saved!`, 'success');
    }

    setShowSaveModal(false);
    setSaveName('');
    setSaveDescription('');
    setAutoCopyPath('');
    setSaveToSession(false);
    setEditingWorkflowId(null);
  };

  const handleEditWorkflow = (req: SavedRequest) => {
    setEditingWorkflowId(req.id);
    setSaveName(req.name);
    setSaveDescription(req.description || '');
    setAutoCopyPath(req.autoCopyPath || '');
    setShowSaveModal(true);
  };

  const handleDeleteRequest = (id: string, name: string) => {
    clearSessionAuth(id);
    setSavedRequests((prev) => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
      return updated;
    });
    toast.push(`Workflow "${name}" deleted`, 'info');
  };

  const handleSaveFromHistory = (item: HistoryItem) => {
    loadRequestConfig(item);
    setSaveName('');
    setSaveDescription('');
    setAutoCopyPath('');
    setEditingWorkflowId(null);
    setShowSaveModal(true);
  };

  const handleQuickRun = async (req: SavedRequest) => {
    const toastId = toast.push(`Running "${req.name}"...`, 'info');

    let targetUrl = req.url.trim();
    if (!targetUrl) {
      toast.push('URL is empty', 'error', toastId);
      return;
    }

    try {
      const urlObj = new URL(targetUrl);
      urlObj.search = '';
      req.queryParams.forEach((p) => {
        if (p.key.trim()) {
          urlObj.searchParams.append(p.key.trim(), p.value.trim());
        }
      });
      targetUrl = urlObj.toString();
    } catch {
      toast.push('Invalid URL format', 'error', toastId);
      return;
    }

    // Resolve authentication: check in-memory or sessionStorage
    const sessionAuth = getSessionAuth(req.id);
    const token = req.bearerToken?.trim() || sessionAuth?.bearerToken?.trim() || '';
    const user = req.basicUser?.trim() || sessionAuth?.basicUser?.trim() || '';
    const pass = req.basicPass?.trim() || sessionAuth?.basicPass?.trim() || '';

    if (req.authType === 'bearer' && !token) {
      loadRequestConfig(req);
      setActiveTab('auth');
      toast.push(`Bearer token required: Please enter token to run "${req.name}"`, 'error', toastId);
      return;
    }

    if (req.authType === 'basic' && !user && !pass) {
      loadRequestConfig(req);
      setActiveTab('auth');
      toast.push(`Basic auth credentials required: Please enter credentials to run "${req.name}"`, 'error', toastId);
      return;
    }

    const requestHeaders: Record<string, string> = {};
    req.headers.forEach((h) => {
      if (h.key.trim() && !isSensitiveHeader(h.key)) {
        requestHeaders[h.key.trim()] = h.value.trim();
      }
    });

    if (req.authType === 'bearer' && token) {
      requestHeaders['Authorization'] = `Bearer ${token.replace(/^bearer\s+/i, '')}`;
    } else if (req.authType === 'basic' && (user || pass)) {
      requestHeaders['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
    }

    let requestBody: any = undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      requestBody = req.bodyText || undefined;
    }

    const start = performance.now();
    try {
      const res = await fetch(targetUrl, {
        method: req.method,
        headers: requestHeaders,
        body: requestBody
      });

      const rawText = await res.text();
      const end = performance.now();
      const duration = Math.round(end - start);

      toast.push(`Received response (${res.status})`, 'info', toastId);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (req.autoCopyPath && req.autoCopyPath.trim()) {
        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(rawText);
        } catch {
          // not JSON
        }

        if (parsedJson) {
          const val = getNestedValue(parsedJson, req.autoCopyPath.trim());
          if (val !== null && val !== undefined) {
            await navigator.clipboard.writeText(val);
            toast.push(`"${req.autoCopyPath}" copied to clipboard!`, 'success', toastId);
          } else {
            toast.push(`Field "${req.autoCopyPath}" not found`, 'error', toastId);
          }
        } else {
          toast.push('Response is not JSON', 'error', toastId);
        }
      } else {
        toast.push('Request completed!', 'success', toastId);
      }

      // Update workflows execution stats
      setSavedRequests((prev) => {
        const updated = prev.map(r => {
          if (r.id === req.id) {
            const oldRuns = r.runCount || 0;
            const oldAvg = r.avgTime || 0;
            const newRuns = oldRuns + 1;
            const newAvg = Math.round((oldAvg * oldRuns + duration) / newRuns);
            return {
              ...r,
              runCount: newRuns,
              avgTime: newAvg,
              lastStatus: res.status,
              lastStatusText: res.statusText,
              lastRunTimestamp: Date.now()
            };
          }
          return r;
        });
        localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
        return updated;
      });

      addHistoryItem(req);
    } catch {
      toast.push('Connection failed', 'error', toastId);
      setSavedRequests((prev) => {
        const updated = prev.map(r => {
          if (r.id === req.id) {
            return {
              ...r,
              lastStatus: 0,
              lastStatusText: 'Error',
              lastRunTimestamp: Date.now()
            };
          }
          return r;
        });
        localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
        return updated;
      });
    }
  };

  const handleExportWorkflows = () => {
    const sanitized = savedRequests.map(sanitizeSavedRequest);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sanitized, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "toolglass_workflows.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.push('Workflows exported successfully (credentials excluded for privacy)', 'success');
  };

  const handleImportWorkflows = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map(sanitizeSavedRequest);
          setSavedRequests((prev) => {
            const updated = [...sanitized, ...prev];
            localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
            return updated;
          });
          toast.push('Workflows imported securely (credentials stripped)', 'success');
        } else {
          toast.push('Invalid JSON file format', 'error');
        }
      } catch {
        toast.push('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    let targetUrl = url.trim();

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
      urlObj.search = '';
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

    const requestHeaders: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim()) {
        requestHeaders[h.key.trim()] = h.value.trim();
      }
    });

    if (authType === 'bearer' && bearerToken.trim()) {
      requestHeaders['Authorization'] = `Bearer ${bearerToken.trim().replace(/^bearer\s+/i, '')}`;
    } else if (authType === 'basic' && (basicUser.trim() || basicPass.trim())) {
      requestHeaders['Authorization'] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
    }

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
        delete requestHeaders['Content-Type'];
      } else {
        requestBody = bodyText || undefined;
      }
    }

    const currentConfig = getCurrentRequestConfig();
    addHistoryItem(currentConfig);

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

      if (rawLength > 1024 * 1024) {
        data = `[Response is very large (${(rawLength / 1024 / 1024).toFixed(2)} MB). Formatting and DOM rendering is skipped to maintain performance. Click "Copy Response" to copy the full raw payload.]\n\n` + rawText.substring(0, 50000) + '\n\n...[Truncated for performance]...';
      } else {
        try {
          data = JSON.stringify(JSON.parse(data), null, 2);
        } catch {
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

      increment();
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

  const handleInlineSaveClick = () => {
    setSaveName('');
    setSaveDescription('');
    setAutoCopyPath('');
    setEditingWorkflowId(null);
    setShowSaveModal(true);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main Tab Bar Switcher (3 Tabs) */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--divider)', paddingBottom: 12 }}>
          <button
            onClick={() => setMainTab('testing')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: mainTab === 'testing' ? 'var(--accent)' : 'transparent',
              color: mainTab === 'testing' ? '#fff' : 'var(--ink-soft)',
              border: '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Globe size={14} /> API Testing
          </button>
          <button
            onClick={() => setMainTab('workflows')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: mainTab === 'workflows' ? 'var(--accent)' : 'transparent',
              color: mainTab === 'workflows' ? '#fff' : 'var(--ink-soft)',
              border: '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={14} /> Saved Workflows
          </button>
          <button
            onClick={() => setMainTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: mainTab === 'history' ? 'var(--accent)' : 'transparent',
              color: mainTab === 'history' ? '#fff' : 'var(--ink-soft)',
              border: '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <HistoryIcon size={14} /> Request History
          </button>
        </div>

        {/* Tab 1: API Testing Main Editor */}
        {mainTab === 'testing' && (
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
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={handleInlineSaveClick} variant="soft" style={{ height: 42, padding: '0 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Save size={14} /> Add to Workflows
                </Button>
                <Button onClick={handleSend} variant="primary" style={{ height: 42, padding: '0 24px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  {loading ? 'Sending...' : <><Play size={15} /> Send</>}
                </Button>
              </div>
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
                                  newParams[index].value = file.name;
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

                {/* Auth tab */}
                {activeTab === 'auth' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(139, 92, 246, 0.06)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      fontSize: 12,
                      color: 'var(--ink-soft)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
                        100% Client Privacy: Credentials are kept in memory only and never saved to localStorage.
                      </span>
                      {(bearerToken.trim() || basicUser.trim() || basicPass.trim()) && (
                        <button
                          type="button"
                          onClick={handleForgetActiveCredentials}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'none',
                            border: 'none',
                            color: 'var(--status-error)',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: 4
                          }}
                          title="Purge credentials from active memory"
                        >
                          <KeyRound size={12} /> Forget Credentials
                        </button>
                      )}
                    </div>

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

                {/* Headers tab */}
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
                        {isSensitiveHeader(header.key) && (
                          <span
                            title="Sensitive header: Excluded from persistent storage & history logs"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#f59e0b',
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            <ShieldAlert size={11} /> Sensitive
                          </span>
                        )}
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

                {/* Body tab */}
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

            {/* Response Area */}
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
        )}

        {/* Tab 2: Saved Workflows Dashboard (Grows naturally in Y axis, export/import available) */}
        {mainTab === 'workflows' && (
          <div className="glass" style={{ borderRadius: 16, border: '1px solid var(--glass-border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Saved API Workflows</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>
                  Save your configurations for quick testing and automated response payload copying. (Max 50 workflows)
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="file"
                  id="import-workflows-file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportWorkflows}
                />
                <Button
                  onClick={() => document.getElementById('import-workflows-file')?.click()}
                  variant="soft"
                  size="sm"
                  style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                >
                  <Upload size={13} /> Import JSON
                </Button>
                <Button
                  onClick={handleExportWorkflows}
                  variant="soft"
                  size="sm"
                  style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                >
                  <Download size={13} /> Export JSON
                </Button>
                <Button
                  onClick={handleForgetAllSavedCredentials}
                  variant="soft"
                  size="sm"
                  style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--status-error)' }}
                  title="Purge all credentials from local session and scrub localStorage"
                >
                  <ShieldAlert size={13} /> Forget Stored Credentials
                </Button>
                <Button
                  onClick={() => {
                    setSaveName('');
                    setSaveDescription('');
                    setAutoCopyPath('');
                    setEditingWorkflowId(null);
                    setShowSaveModal(true);
                  }}
                  variant="primary"
                  size="sm"
                  style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                >
                  <Plus size={13} /> Save Current Setup
                </Button>
              </div>
            </div>

            {/* Saved Workflow Cards List (Full width, grows naturally on Y axis) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {savedRequests.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--ink-mute)', fontSize: 14, padding: '48px 0' }}>
                  No saved workflows yet. Create a request, click "Add to Workflows", and save it!
                </div>
              ) : (
                savedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="glass"
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      background: 'var(--glass-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.name}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {req.url}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: getMethodColor(req.method),
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        {req.method}
                      </span>
                    </div>

                    {req.description && (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.4 }}>
                        {req.description}
                      </p>
                    )}

                    {req.autoCopyPath && (
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={12} /> Auto-copy path: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-input)', padding: '2px 6px', borderRadius: 4 }}>{req.autoCopyPath}</code>
                      </div>
                    )}

                    {/* Usage Stats and status info badge */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--ink-mute)' }}>
                      {req.authType !== 'none' && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(139, 92, 246, 0.12)',
                            color: 'var(--accent)',
                            fontWeight: 700,
                            fontSize: 10
                          }}
                          title="Credentials are omitted from persistent localStorage for privacy"
                        >
                          <Lock size={10} /> {req.authType.toUpperCase()} Auth Required
                        </span>
                      )}
                      {(req.runCount !== undefined && req.runCount > 0) && (
                        <span>
                          ⚡ <strong>{req.runCount}</strong> run{req.runCount === 1 ? '' : 's'} · avg: <strong>{req.avgTime} ms</strong>
                        </span>
                      )}
                      {req.lastStatus !== undefined && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: req.lastStatus >= 200 && req.lastStatus < 300 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: req.lastStatus >= 200 && req.lastStatus < 300 ? '#10b981' : '#ef4444',
                          fontWeight: 700
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: req.lastStatus >= 200 && req.lastStatus < 300 ? '#10b981' : '#ef4444' }} />
                          {req.lastStatus === 0 ? 'ERR' : req.lastStatus}
                        </span>
                      )}
                      {req.lastRunTimestamp && (
                        <span style={{ fontSize: 10 }}>
                          · last run: {new Date(req.lastRunTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => handleQuickRun(req)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <Play size={11} fill="#fff" /> Quick Run
                      </button>
                      <button
                        onClick={() => loadRequestConfig(req)}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--surface-button-off)',
                          color: 'var(--ink)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleEditWorkflow(req)}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--surface-button-off)',
                          color: 'var(--ink)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Metadata"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(req.id, req.name)}
                        style={{
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--status-error)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Workflow"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Request History Log (Grows naturally in Y axis, descending order) */}
        {mainTab === 'history' && (
          <div className="glass" style={{ borderRadius: 16, border: '1px solid var(--glass-border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Request History</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>
                  A log of your recent request configurations (latest first, max 15) · Auth credentials excluded for privacy
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Last 15 executions</span>
                {requestHistory.length > 0 && (
                  <Button
                    onClick={handleClearHistory}
                    variant="soft"
                    size="sm"
                    style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                  >
                    <Trash2 size={12} /> Clear History
                  </Button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {requestHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--ink-mute)', fontSize: 14, padding: '48px 0' }}>
                  No recent request history logs found. Run some API calls to log them!
                </div>
              ) : (
                requestHistory.map((item) => (
                  <div
                    key={item.id}
                    className="glass"
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      background: 'var(--glass-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: getMethodColor(item.method),
                        color: '#fff'
                      }}>
                        {item.method}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                        {new Date(item.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      background: 'var(--surface-input)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--divider)'
                    }}>
                      {item.url}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => loadRequestConfig(item)}
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          background: 'var(--surface-button-off)',
                          color: 'var(--ink)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Load parameters into Editor
                      </button>
                      <button
                        onClick={() => handleSaveFromHistory(item)}
                        style={{
                          padding: '8px 14px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Save size={13} /> Save as Workflow
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Glassmorphic Save/Edit Workflow Modal Popup Overlay */}
      {showSaveModal && (
        <div
          onClick={() => {
            setShowSaveModal(false);
            setEditingWorkflowId(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 10, 32, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: 'var(--surface-palette)',
              boxShadow: '0 20px 50px -12px rgba(15, 10, 32, 0.4), var(--glass-shadow)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                {editingWorkflowId ? 'Edit Workflow Settings' : 'Save Request as Workflow'}
              </div>
              {!editingWorkflowId && (
                <span style={{ fontSize: 11, color: 'var(--ink-mute)', background: 'var(--surface-input)', padding: '2px 8px', borderRadius: 6 }}>
                  {savedRequests.length}/50 saved
                </span>
              )}
            </div>

            {(() => {
              const currentConfig = getCurrentRequestConfig();
              const hasCreds = hasAuthCredentials(currentConfig);
              if (!hasCreds) return null;
              return (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start'
                }}>
                  <ShieldAlert size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                      Client Privacy & Security Protection Active
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                      Credentials (Bearer tokens, Basic Auth passwords, and Authorization headers) are <strong>never stored in persistent localStorage</strong> to protect your security.
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, cursor: 'pointer', fontSize: 11, color: 'var(--ink)' }}>
                      <input
                        type="checkbox"
                        checked={saveToSession}
                        onChange={(e) => setSaveToSession(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Remember credentials in this browser tab only (sessionStorage — cleared when tab closes)</span>
                    </label>
                  </div>
                </div>
              );
            })()}

            <Field label="Workflow Name *">
              <TextInput
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Fetch user details, Admin Auth login"
                style={{ fontSize: 13 }}
              />
            </Field>

            <Field label="Description / Notes (Optional)">
              <TextArea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Write a brief explanation of what this API workflow does..."
                rows={3}
                style={{ fontSize: 13 }}
              />
            </Field>

            <Field label="Auto-Copy JSON Key Path (Optional)">
              <TextInput
                value={autoCopyPath}
                onChange={(e) => setAutoCopyPath(e.target.value)}
                placeholder="e.g. data.token, auth.accessToken"
                style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}
              />
            </Field>

            {(() => {
              const detected = getDetectedKeys();
              if (detected.status === 'ok' && detected.keys && detected.keys.length > 0) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)' }}>
                      Detected response fields (click to auto-fill):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: '80px', overflowY: 'auto', paddingRight: 4 }}>
                      {detected.keys.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setAutoCopyPath(k)}
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            background: autoCopyPath === k ? 'var(--accent)' : 'var(--surface-button-off)',
                            color: autoCopyPath === k ? '#fff' : 'var(--ink)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 6,
                            padding: '3px 8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              } else if (detected.status === 'too_large') {
                return (
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                    ⚠️ Response is too large to auto-detect keys.
                  </span>
                );
              } else if (detected.status === 'not_json') {
                return (
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                    ⚠️ Last response was not JSON. (Run a JSON request to see field detection)
                  </span>
                );
              } else {
                return (
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                    💡 Tip: Run the API request first to enable automatic field path selection.
                  </span>
                );
              }
            })()}

            {editingWorkflowId && (
              <div style={{
                marginTop: 4,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                fontSize: 12,
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <span>Update API details with current settings in builder?</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentConfig = getCurrentRequestConfig();
                    const hasCreds = hasAuthCredentials(currentConfig);
                    if (saveToSession && hasCreds) {
                      saveSessionAuth(editingWorkflowId, {
                        bearerToken: currentConfig.bearerToken,
                        basicUser: currentConfig.basicUser,
                        basicPass: currentConfig.basicPass
                      });
                    }
                    setSavedRequests((prev) => {
                      const updated = prev.map((r) => {
                        if (r.id === editingWorkflowId) {
                          return sanitizeSavedRequest({
                            ...r,
                            ...currentConfig
                          });
                        }
                        return r;
                      });
                      localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
                      return updated;
                    });
                    toast.push('Request parameters updated securely from builder!', 'success');
                  }}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  setEditingWorkflowId(null);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  background: 'var(--surface-button-off)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRequest}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--accent)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {editingWorkflowId ? 'Save Changes' : 'Save Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

