/* eslint-disable @typescript-eslint/no-explicit-any */
// State and actions for the API Tester. Moved out of CurlTool.tsx unchanged
// (#64); every write of saved requests or history still goes through
// sanitizeSavedRequest / sanitizeHistoryItem.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { useClipboard } from '../../hooks/useClipboard';
import { useToolStats } from '../../hooks/useToolStats';
import { getJsonLeafPaths, getNestedValue, parseCurl, type QueryParam } from './curl';
import {
  clearSessionAuth,
  getSessionAuth,
  hasAuthCredentials,
  isSensitiveHeader,
  sanitizeHeaders,
  sanitizeHistoryItem,
  sanitizeSavedRequest,
  saveSessionAuth,
  scrubStorageAuth,
  type HeaderParam,
  type HistoryItem,
  type SavedRequest,
} from './curlSecurity';

export function useApiTester() {
  const { slug = 'api-tester' } = useParams();
  const { increment } = useToolStats(slug);
  const toast = useToast();
  const { copy } = useClipboard();

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

  /** Fill the builder from a cURL command; returns false when it isn't one. */
  const applyCurlText = (text: string) => {
    setCurlInput(text);
    const parsed = parseCurl(text);
    if (!parsed) return false;
    setUrl(parsed.url);
    setMethod(parsed.fetchOptions.method || 'GET');
    const parsedHeaders: HeaderParam[] = Object.entries(parsed.fetchOptions.headers || {}).map(([k, v]) => ({ key: k, value: v as string }));
    parsedHeaders.push({ key: '', value: '' });
    setHeaders(parsedHeaders);
    setBodyText(parsed.fetchOptions.body || '');
    return true;
  };

  const handlePasteCurl = () => {
    navigator.clipboard.readText().then((text) => {
      if (applyCurlText(text)) increment();
    }).catch(() => toast.push('Clipboard access was blocked', 'error'));
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
            if (await copy(String(val))) {
              toast.push(`"${req.autoCopyPath}" copied to clipboard!`, 'success', toastId);
            } else {
              toast.push('Clipboard access was blocked', 'error', toastId);
            }
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
      copy(response.rawData).then((ok) => {
        if (!ok) return toast.push('Clipboard access was blocked', 'error');
        setIsCopiedResponse(true);
        setTimeout(() => setIsCopiedResponse(false), 2000);
        increment();
      });
    }
  };

  const handleInlineSaveClick = () => {
    setSaveName('');
    setSaveDescription('');
    setAutoCopyPath('');
    setEditingWorkflowId(null);
    setShowSaveModal(true);
  };

  // Overwrite the edited workflow's request with what is in the builder now
  const applyBuilderToWorkflow = () => {
    if (!editingWorkflowId) return;
    const currentConfig = getCurrentRequestConfig();
    if (saveToSession && hasAuthCredentials(currentConfig)) {
      saveSessionAuth(editingWorkflowId, {
        bearerToken: currentConfig.bearerToken,
        basicUser: currentConfig.basicUser,
        basicPass: currentConfig.basicPass
      });
    }
    setSavedRequests((prev) => {
      const updated = prev.map((r) => (r.id === editingWorkflowId ? sanitizeSavedRequest({ ...r, ...currentConfig }) : r));
      localStorage.setItem('toolglass_saved_requests', JSON.stringify(updated.map(sanitizeSavedRequest)));
      return updated;
    });
    toast.push('Request parameters updated securely from builder!', 'success');
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
    setEditingWorkflowId(null);
  };

  return {
    applyCurlText,
    applyBuilderToWorkflow,
    closeSaveModal,
    method,
    setMethod,
    url,
    setUrl,
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,
    queryParams,
    setQueryParams,
    authType,
    setAuthType,
    bearerToken,
    setBearerToken,
    basicUser,
    setBasicUser,
    basicPass,
    setBasicPass,
    headers,
    setHeaders,
    bodyText,
    setBodyText,
    curlInput,
    setCurlInput,
    isCurlFocused,
    setIsCurlFocused,
    isCopiedResponse,
    setIsCopiedResponse,
    response,
    setResponse,
    loading,
    setLoading,
    error,
    setError,
    lineWrap,
    setLineWrap,
    savedRequests,
    setSavedRequests,
    requestHistory,
    setRequestHistory,
    showSaveModal,
    setShowSaveModal,
    saveName,
    setSaveName,
    saveDescription,
    setSaveDescription,
    autoCopyPath,
    setAutoCopyPath,
    saveToSession,
    setSaveToSession,
    editingWorkflowId,
    setEditingWorkflowId,
    handlePasteCurl,
    getCurrentRequestConfig,
    loadRequestConfig,
    addHistoryItem,
    handleClearHistory,
    handleForgetActiveCredentials,
    handleForgetAllSavedCredentials,
    getDetectedKeys,
    handleSaveRequest,
    handleEditWorkflow,
    handleDeleteRequest,
    handleSaveFromHistory,
    handleQuickRun,
    handleExportWorkflows,
    handleImportWorkflows,
    handleSend,
    addQueryParamRow,
    addHeaderRow,
    handleCopyResponse,
    handleInlineSaveClick,
  };
}

export type ApiTester = ReturnType<typeof useApiTester>;
