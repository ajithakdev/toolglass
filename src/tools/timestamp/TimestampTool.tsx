import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Field, TextInput, TextArea, Dropdown } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { useToast } from '../../components/ui/Toast';
import { useUrlState } from '../../hooks/useUrlState';
import { useClipboard } from '../../hooks/useClipboard';
import { useToolStats } from '../../hooks/useToolStats';

// ── Timezone Lists ──
const DEFAULT_TZS = ['UTC', 'America/New_York', 'Asia/Kolkata', 'Europe/London'];
const POPULAR_TZS = [
  'UTC', 'Europe/London', 'America/New_York', 'Asia/Kolkata',
  'Europe/Paris', 'Asia/Tokyo', 'America/Los_Angeles', 'America/Chicago',
  'Australia/Sydney', 'Asia/Singapore', 'Asia/Dubai', 'America/Sao_Paulo',
  'Africa/Johannesburg'
];

interface HistoryItem {
  id: string;
  mode: 'convert' | 'batch' | 'diff' | 'cron';
  timestamp: number;
  label: string;
  details: string;
  data: Record<string, string>;
}

// ── Formatting/Calculation Helpers ──
function getRelativeTime(d: Date): string {
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const absSecs = Math.abs(diffSecs);
  const absMins = Math.abs(diffMins);
  const absHours = Math.abs(diffHours);
  const absDays = Math.abs(diffDays);

  if (absSecs < 5) return 'just now';
  if (absSecs < 60) return diffSecs > 0 ? `in ${absSecs}s` : `${absSecs}s ago`;
  if (absMins < 60) return diffMins > 0 ? `in ${absMins}m` : `${absMins}m ago`;
  if (absHours < 24) return diffHours > 0 ? `in ${absHours}h` : `${absHours}h ago`;
  if (absDays < 30) return diffDays > 0 ? `in ${absDays}d` : `${absDays}d ago`;

  const diffMonths = Math.round(absDays / 30.4);
  if (diffMonths < 12) return diffDays > 0 ? `in ${diffMonths}mo` : `${diffMonths}mo ago`;

  const diffYears = Math.round(diffMonths / 12);
  return diffDays > 0 ? `in ${diffYears}y` : `${diffYears}y ago`;
}

function parseSmartDate(input: string): Date | null {
  const clean = input.trim();
  if (!clean) return null;
  if (/^-?\d+$/.test(clean)) {
    const num = Number(clean);
    return Math.abs(num) < 1e11 ? new Date(num * 1000) : new Date(num);
  }
  const d = new Date(clean);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatLocal(date: Date, timeZone: string, type: 'all' | 'date' | 'time' | 'offset'): string {
  try {
    if (type === 'all') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    }
    if (type === 'date') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        dateStyle: 'medium',
      }).format(date);
    }
    if (type === 'time') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeStyle: 'medium',
      }).format(date);
    }
    if (type === 'offset') {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset',
      }).formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : '';
    }
  } catch {
    return 'Invalid TZ';
  }
  return '';
}

// ── Cron Next Runs ──
function getNextCronRuns(cron: string, count = 5): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return [];
  const [minPat, hourPat, domPat, monthPat, dowPat] = parts;

  function parseField(pattern: string, minVal: number, maxVal: number): number[] {
    const list: number[] = [];
    const subpatterns = pattern.split(',');
    for (const sub of subpatterns) {
      if (sub === '*') {
        for (let i = minVal; i <= maxVal; i++) list.push(i);
      } else if (sub.includes('/')) {
        const [range, stepStr] = sub.split('/');
        const step = Number(stepStr) || 1;
        let start = minVal;
        let end = maxVal;
        if (range !== '*') {
          if (range.includes('-')) {
            const [s, e] = range.split('-');
            start = Number(s);
            end = Number(e);
          } else {
            start = Number(range);
          }
        }
        for (let i = start; i <= end; i += step) {
          list.push(i);
        }
      } else if (sub.includes('-')) {
        const [s, e] = sub.split('-');
        const start = Number(s);
        const end = Number(e);
        for (let i = start; i <= end; i++) list.push(i);
      } else {
        list.push(Number(sub));
      }
    }
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }

  try {
    const minutes = parseField(minPat!, 0, 59);
    const hours = parseField(hourPat!, 0, 23);
    const doms = parseField(domPat!, 1, 31);
    const months = parseField(monthPat!, 1, 12);
    const dows = parseField(dowPat!, 0, 6);

    const runs: Date[] = [];
    const current = new Date();
    current.setSeconds(0);
    current.setMilliseconds(0);
    current.setMinutes(current.getMinutes() + 1);

    let iterations = 0;
    while (runs.length < count && iterations < 30000) {
      iterations++;
      const min = current.getMinutes();
      const hour = current.getHours();
      const dom = current.getDate();
      const month = current.getMonth() + 1;
      const dow = current.getDay();

      if (
        minutes.includes(min) &&
        hours.includes(hour) &&
        doms.includes(dom) &&
        months.includes(month) &&
        dows.includes(dow)
      ) {
        runs.push(new Date(current));
      }
      current.setMinutes(current.getMinutes() + 1);
    }
    return runs;
  } catch {
    return [];
  }
}

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return 'Invalid cron expression';
  const [minPat, hourPat, domPat, monthPat, dowPat] = parts;
  const describeField = (pat: string | undefined, name: string) => {
    if (!pat || pat === '*') return `every ${name}`;
    if (pat.startsWith('*/')) return `every ${pat.slice(2)} ${name}s`;
    return `at ${name} ${pat}`;
  };
  return `Runs ${describeField(minPat, 'minute')}, ${describeField(hourPat, 'hour')}, on day ${describeField(domPat, 'of month')}, in ${describeField(monthPat, 'month')}, on ${describeField(dowPat, 'day of week')}.`;
}

// ── Diff Duration helper ──
function getDurationDescription(ms: number): string {
  const isPast = ms < 0;
  const absMs = Math.abs(ms);
  const secs = Math.floor(absMs / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  const remHours = hours % 24;
  const remMins = mins % 60;
  const remSecs = secs % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (remHours > 0) parts.push(`${remHours}h`);
  if (remMins > 0) parts.push(`${remMins}m`);
  if (remSecs > 0) parts.push(`${remSecs}s`);

  if (parts.length === 0) return '0s';
  return parts.join(' ') + (isPast ? ' ago' : '');
}

// ── Offset Parser ──
const OFFSET_REGEX = /^([+-])?\s*(?:(\d+)\s*y)?\s*(?:(\d+)\s*mo)?\s*(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/i;

function applyOffset(base: Date, offsetStr: string): Date {
  const clean = offsetStr.trim();
  const match = clean.match(OFFSET_REGEX);
  if (!match) return base;

  const sign = match[1] === '-' ? -1 : 1;
  const y = (Number(match[2]) || 0) * sign;
  const mo = (Number(match[3]) || 0) * sign;
  const d = (Number(match[4]) || 0) * sign;
  const h = (Number(match[5]) || 0) * sign;
  const m = (Number(match[6]) || 0) * sign;
  const s = (Number(match[7]) || 0) * sign;

  const res = new Date(base);
  if (y) res.setFullYear(res.getFullYear() + y);
  if (mo) res.setMonth(res.getMonth() + mo);
  if (d) res.setDate(res.getDate() + d);
  if (h) res.setHours(res.getHours() + h);
  if (m) res.setMinutes(res.getMinutes() + m);
  if (s) res.setSeconds(res.getSeconds() + s);
  return res;
}

export default function TimestampTool() {
  const toast = useToast();
  const { copy } = useClipboard();
  const { slug } = useParams<{ slug: string }>();
  const { increment } = useToolStats(slug);

  // ── URL & Local states ──
  const [activeMode, setActiveMode] = useUrlState('mode', 'convert', (r) => r, (v) => v);
  // Use lazy initializer so Date.now() is called once (not during every render)
  const [convertInput, setConvertInput] = useUrlState(
    'q',
    (() => String(Math.floor(Date.now() / 1000)))(),
    (r) => r,
    (v) => v,
  );
  const [batchInput, setBatchInput] = useUrlState('batch', '', (r) => r, (v) => v);
  const [cronInput, setCronInput] = useUrlState('cron', '*/5 * * * *', (r) => r, (v) => v);

  // Diff states
  const [diffMode, setDiffMode] = useUrlState('diffMode', 'range', (r) => r, (v) => v);
  const [diffDate1, setDiffDate1] = useUrlState('d1', 'now', (r) => r, (v) => v);
  const [diffDate2, setDiffDate2] = useUrlState('d2', '2027-01-01', (r) => r, (v) => v);
  const [diffBase, setDiffBase] = useUrlState('db', 'now', (r) => r, (v) => v);
  const [diffOffset, setDiffOffset] = useUrlState('do', '+1y 2mo 15d', (r) => r, (v) => v);

  // Timezones State
  const [selectedTz, setSelectedTz] = useState('UTC');
  const [customTzs, setCustomTzs] = useState<string[]>(DEFAULT_TZS);

  // History Drawer State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tg_ts_history') || '[]');
    } catch {
      return [];
    }
  });

  // Code Flyout States
  const [flyoutValue, setFlyoutValue] = useState<string | null>(null);
  const [flyoutDate, setFlyoutDate] = useState<Date | null>(null);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Live clock: tracks current unix second so Date.now() is not called during render
  const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close flyout on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setFlyoutValue(null);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Add history helper
  const addHistory = (label: string, mode: 'convert' | 'batch' | 'diff' | 'cron', details: string, data: Record<string, string>) => {
    const nextItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      mode,
      timestamp: Date.now(),
      label,
      details,
      data,
    };
    setHistoryList((prev) => {
      const filtered = prev.filter((item) => item.label !== label || item.mode !== mode);
      const updated = [nextItem, ...filtered].slice(0, 10);
      localStorage.setItem('tg_ts_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopy = async (val: string) => {
    if (!val) return;
    const ok = await copy(val);
    if (ok) {
      increment();
      toast.push(`Copied: ${val.substring(0, 25)}${val.length > 25 ? '...' : ''}`, 'success');
    }
  };

  const handleCopySnippet = async (code: string, index: number) => {
    const ok = await copy(code);
    if (ok) {
      increment();
      setCopiedSnippetIndex(index);
      setTimeout(() => setCopiedSnippetIndex(null), 1500);
      toast.push('Copied snippet to clipboard', 'success');
    }
  };

  const openCodeFlyout = (e: React.MouseEvent, val: string, dateObj: Date) => {
    e.stopPropagation();
    setFlyoutValue(val);
    setFlyoutDate(dateObj);
  };

  // ── Mode Outputs ──

  // 1. Convert — always needed for the convert tab
  const parsedDate = activeMode === 'convert' ? parseSmartDate(convertInput) : null;
  const parseStatus = parsedDate ? 'Valid Date' : 'Waiting for valid input...';

  // 2. Batch Mode — only parse when on batch tab
  const batchMatches: Array<{ original: string; date: Date; iso: string; relative: string }> = [];
  if (activeMode === 'batch' && batchInput.trim()) {
    const regex = /(?:-?\d{9,13})|(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2}))/g;
    const tokens = batchInput.match(regex);
    if (tokens) {
      for (const token of tokens) {
        const date = parseSmartDate(token);
        if (date) {
          batchMatches.push({
            original: token,
            date,
            iso: date.toISOString(),
            relative: getRelativeTime(date),
          });
        }
      }
    }
  }

  // 3. Diff & Duration — only parse when on diff tab
  const d1 = activeMode === 'diff' ? parseSmartDate(diffDate1 === 'now' ? String(nowTs) : diffDate1) : null;
  const d2 = activeMode === 'diff' ? parseSmartDate(diffDate2 === 'now' ? String(nowTs) : diffDate2) : null;
  const baseD = activeMode === 'diff' ? parseSmartDate(diffBase === 'now' ? String(nowTs) : diffBase) : null;

  // Offset validation
  const isValidOffset = diffOffset.trim() === '' || OFFSET_REGEX.test(diffOffset.trim());
  const offsetResult = baseD && isValidOffset ? applyOffset(baseD, diffOffset) : null;

  // 4. Cron — only parse when on cron tab
  const cronRuns = activeMode === 'cron' ? getNextCronRuns(cronInput, 5) : [];
  const cronDesc = activeMode === 'cron' ? describeCron(cronInput) : '';

  // Trigger history save on successful parses.
  // IMPORTANT: only use primitive string deps here — Date objects are new references
  // every render tick and would cause the effect (and history) to fire every second.
  const lastLoggedRef = useRef<string>('');
  useEffect(() => {
    if (activeMode === 'convert') {
      const val = convertInput.trim();
      const parsed = parseSmartDate(val);
      if (val && parsed && val !== lastLoggedRef.current) {
        lastLoggedRef.current = val;
        addHistory(val, 'convert', parsed.toISOString(), { q: val });
      }
    } else if (activeMode === 'diff' && diffMode === 'range') {
      const parsed1 = parseSmartDate(diffDate1 === 'now' ? String(nowTs) : diffDate1);
      const parsed2 = parseSmartDate(diffDate2 === 'now' ? String(nowTs) : diffDate2);
      const label = `${diffDate1} ↔ ${diffDate2}`;
      if (parsed1 && parsed2 && label !== lastLoggedRef.current) {
        lastLoggedRef.current = label;
        addHistory(label, 'diff', 'Duration Diff', { d1: diffDate1, d2: diffDate2, diffMode: 'range' });
      }
    } else if (activeMode === 'cron') {
      const label = cronInput.trim();
      const runs = getNextCronRuns(label, 1);
      if (label && runs.length > 0 && label !== lastLoggedRef.current) {
        lastLoggedRef.current = label;
        addHistory(label, 'cron', describeCron(label), { cron: label });
      }
    }
  }, [convertInput, activeMode, diffDate1, diffDate2, diffMode, cronInput, nowTs]);

  return (
    <ToolLayout>
      <div style={{ position: 'relative' }}>
        {/* Genuine Glass Backdrop Blurring Blobs */}
        <div
          style={{
            position: 'absolute',
            inset: -20,
            background: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: 'var(--radius)',
          }}
        />

        {/* Top Navigation: Mode Selector + Toggle Sidebar Trigger */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Segmented Modes Tabs with heightened contrast on inactive ones */}
          <div
            className="glass"
            style={{
              padding: 4,
              display: 'inline-flex',
              gap: 4,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {['convert', 'batch', 'diff', 'cron'].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '10px',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  background: activeMode === m ? 'var(--grad)' : 'transparent',
                  color: activeMode === m ? '#fff' : 'var(--ink)',
                  boxShadow: activeMode === m ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none',
                  opacity: activeMode === m ? 1 : 0.82,
                }}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Connected Trigger Button that controls sidebar */}
          <Button
            variant={historyOpen ? 'primary' : 'soft'}
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            📜 {historyOpen ? 'Hide History Drawer' : `Show History (${historyList.length})`}
          </Button>
        </div>

        {/* Main layout containing the workspace and collapsible history sidebar */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
          }}
        >
          {/* Scroll Constrained Workspace Panel */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* CONVERT MODE */}
            {activeMode === 'convert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Input Timestamp or Date" hint="Smart parser accepts seconds, milliseconds, ISO, standard date strings">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <TextInput
                      placeholder="e.g. 1719403200 or 2024-06-26T12:00:00Z"
                      value={convertInput}
                      onChange={(e) => setConvertInput(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      onClick={() => setConvertInput(String(Math.floor(Date.now() / 1000)))}
                    >
                      ✦ Now
                    </Button>
                  </div>
                </Field>

                {parsedDate ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Raw Group */}
                    <div className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8, letterSpacing: '0.05em' }}>Raw Unix Timestamps</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ValueRow label="Seconds" value={String(Math.floor(parsedDate.getTime() / 1000))} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="Milliseconds" value={String(parsedDate.getTime())} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                      </div>
                    </div>

                    {/* Standard Group */}
                    <div className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8, letterSpacing: '0.05em' }}>Standard UTC Formats</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ValueRow label="ISO 8601" value={parsedDate.toISOString()} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="UTC String" value={parsedDate.toUTCString()} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                      </div>
                    </div>

                    {/* Localized Group */}
                    <div className="glass-strong" style={{ padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-mute)', letterSpacing: '0.05em' }}>Localized Dates</div>
                        {/* Custom-styled Dropzone Selection for timezone */}
                        <div style={{ width: 180 }}>
                          <Dropdown
                            value={selectedTz}
                            options={POPULAR_TZS.map((tz) => ({ label: tz, value: tz }))}
                            onChange={(tz) => {
                              setSelectedTz(tz);
                              if (!customTzs.includes(tz)) {
                                setCustomTzs([...customTzs, tz]);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* TZ Pinned Pills */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {customTzs.map((tz) => (
                          <button
                            key={tz}
                            onClick={() => setSelectedTz(tz)}
                            style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: selectedTz === tz ? 'var(--grad)' : 'var(--surface-pill)',
                              color: selectedTz === tz ? '#fff' : 'var(--ink-soft)',
                              fontWeight: 600,
                              border: '1px solid var(--divider)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {tz}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ValueRow label="Date & Time" value={formatLocal(parsedDate, selectedTz, 'all')} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="Date Only" value={formatLocal(parsedDate, selectedTz, 'date')} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="Time Only" value={formatLocal(parsedDate, selectedTz, 'time')} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="Offset & Zone" value={formatLocal(parsedDate, selectedTz, 'offset')} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                        <ValueRow label="Relative Time" value={getRelativeTime(parsedDate)} date={parsedDate} onCopy={handleCopy} onCode={openCodeFlyout} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-mute)' }}>
                    ⚠️ {parseStatus}
                  </div>
                )}
              </div>
            )}

            {/* BATCH MODE */}
            {activeMode === 'batch' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Pasted Log or Text Content" hint="Paste logs or text; timestamps will be processed in-place">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <TextArea
                      placeholder="Paste logs, database queries, or text with raw epoch times (e.g. 1719403200) or ISO datetimes..."
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      rows={6}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => setBatchInput(batchInput ? `${batchInput}\n${Math.floor(Date.now() / 1000)}` : `${Math.floor(Date.now() / 1000)}`)}
                      >
                        ✦ Insert Current Timestamp
                      </Button>
                      <Button variant="soft" size="sm" onClick={() => setBatchInput('')}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </Field>

                {batchMatches.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
                      Found {batchMatches.length} parsed timestamp{batchMatches.length === 1 ? '' : 's'}:
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 13,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <thead>
                          <tr style={{ background: 'var(--surface-input)', borderBottom: '1px solid var(--divider)' }}>
                            <th style={{ padding: 10, textAlign: 'left', color: 'var(--ink-soft)' }}>Original</th>
                            <th style={{ padding: 10, textAlign: 'left', color: 'var(--ink-soft)' }}>ISO 8601</th>
                            <th style={{ padding: 10, textAlign: 'left', color: 'var(--ink-soft)' }}>Local Time</th>
                            <th style={{ padding: 10, textAlign: 'left', color: 'var(--ink-soft)' }}>Relative</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchMatches.map((m, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: idx === batchMatches.length - 1 ? 'none' : '1px solid var(--divider)',
                                background: 'transparent',
                              }}
                            >
                              <td
                                className="mono"
                                onClick={() => handleCopy(m.original)}
                                style={{ padding: 10, color: 'var(--ink)', cursor: 'pointer' }}
                              >
                                {m.original}
                              </td>
                              <td
                                className="mono"
                                onClick={() => handleCopy(m.iso)}
                                style={{ padding: 10, color: 'var(--ink)', cursor: 'pointer' }}
                              >
                                {m.iso}
                              </td>
                              <td
                                onClick={() => handleCopy(m.date.toLocaleString())}
                                style={{ padding: 10, color: 'var(--ink-soft)', cursor: 'pointer' }}
                              >
                                {m.date.toLocaleString()}
                              </td>
                              <td
                                onClick={() => handleCopy(getRelativeTime(m.date))}
                                style={{ padding: 10, color: 'var(--ink-mute)', cursor: 'pointer' }}
                              >
                                {m.relative}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-mute)' }}>
                    No valid timestamps detected yet. Paste logs with epoch seconds/ms.
                  </div>
                )}
              </div>
            )}

            {/* DIFF & DURATION MODE */}
            {activeMode === 'diff' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Diff Sub-Selector */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    size="sm"
                    variant={diffMode === 'range' ? 'primary' : 'soft'}
                    onClick={() => setDiffMode('range')}
                  >
                    Duration Between Two Dates
                  </Button>
                  <Button
                    size="sm"
                    variant={diffMode === 'offset' ? 'primary' : 'soft'}
                    onClick={() => setDiffMode('offset')}
                  >
                    Add/Subtract Offset
                  </Button>
                </div>

                {diffMode === 'range' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <Field label="Date 1 (Start)" hint="Enter date, timestamp or 'now'">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <TextInput value={diffDate1} onChange={(e) => setDiffDate1(e.target.value)} />
                              <Button size="sm" variant="soft" onClick={() => setDiffDate1(String(Math.floor(Date.now() / 1000)))}>✦ Now</Button>
                            </div>
                            {d1 && (
                              <div style={{ fontSize: 11, color: 'var(--ink-soft)', paddingLeft: 4 }}>
                                Resolved: {d1.toISOString()} (Local: {d1.toLocaleString()})
                              </div>
                            )}
                          </div>
                        </Field>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <Field label="Date 2 (End)" hint="Enter date, timestamp or 'now'">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <TextInput value={diffDate2} onChange={(e) => setDiffDate2(e.target.value)} />
                              <Button size="sm" variant="soft" onClick={() => setDiffDate2(String(Math.floor(Date.now() / 1000)))}>✦ Now</Button>
                            </div>
                            {d2 && (
                              <div style={{ fontSize: 11, color: 'var(--ink-soft)', paddingLeft: 4 }}>
                                Resolved: {d2.toISOString()} (Local: {d2.toLocaleString()})
                              </div>
                            )}
                          </div>
                        </Field>
                      </div>
                    </div>

                    {d1 && d2 ? (
                      <div className="glass-strong" style={{ padding: 20, borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 12 }}>
                          Calculated Difference
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <ValueRow label="Total Duration" value={getDurationDescription(d2.getTime() - d1.getTime())} date={d2} onCopy={handleCopy} />
                          <ValueRow label="Difference (ms)" value={String(d2.getTime() - d1.getTime())} date={d2} onCopy={handleCopy} />
                          <ValueRow label="Difference (seconds)" value={String(Math.floor((d2.getTime() - d1.getTime()) / 1000))} date={d2} onCopy={handleCopy} />
                          <ValueRow label="Difference (minutes)" value={String(Math.floor((d2.getTime() - d1.getTime()) / 60000))} date={d2} onCopy={handleCopy} />
                          <ValueRow label="Difference (days)" value={String(Math.floor((d2.getTime() - d1.getTime()) / 86400000))} date={d2} onCopy={handleCopy} />
                        </div>
                      </div>
                    ) : (
                      <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-mute)' }}>
                        Please enter two valid datetime inputs.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <Field label="Base Date" hint="Start date (seconds, ms, ISO or 'now')">
                          <div style={{ display: 'flex', gap: 6 }}>
                            <TextInput value={diffBase} onChange={(e) => setDiffBase(e.target.value)} />
                            <Button size="sm" variant="soft" onClick={() => setDiffBase(String(Math.floor(Date.now() / 1000)))}>✦ Now</Button>
                          </div>
                        </Field>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <Field label="Offset Duration" hint="e.g. +2h, -30m, +1y 2mo 15d">
                          <TextInput
                            value={diffOffset}
                            onChange={(e) => setDiffOffset(e.target.value)}
                            style={{
                              borderColor: isValidOffset ? 'var(--line)' : 'rgba(239, 68, 68, 0.6)',
                              boxShadow: isValidOffset ? 'none' : '0 0 0 2px rgba(239, 68, 68, 0.2)',
                            }}
                          />
                          {!isValidOffset && (
                            <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 500 }}>
                              Invalid offset format. Use e.g. +2h, -30m, +1y 2mo 15d
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>

                    {offsetResult ? (
                      <div className="glass-strong" style={{ padding: 20, borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 12 }}>
                          Calculated Result Date
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <ValueRow label="Unix Seconds" value={String(Math.floor(offsetResult.getTime() / 1000))} date={offsetResult} onCopy={handleCopy} onCode={openCodeFlyout} />
                          <ValueRow label="ISO 8601 (UTC)" value={offsetResult.toISOString()} date={offsetResult} onCopy={handleCopy} onCode={openCodeFlyout} />
                          <ValueRow label="Local Datetime" value={offsetResult.toLocaleString()} date={offsetResult} onCopy={handleCopy} onCode={openCodeFlyout} />
                          <ValueRow label="Relative Time" value={getRelativeTime(offsetResult)} date={offsetResult} onCopy={handleCopy} onCode={openCodeFlyout} />
                        </div>
                      </div>
                    ) : (
                      <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-mute)' }}>
                        Please input a valid Base Date and Offset string.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CRON EXPLANATOR & NEXT RUNS */}
            {activeMode === 'cron' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Cron Expression" hint="Accepts standard 5-field cron (min, hour, dom, month, dow)">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TextInput value={cronInput} onChange={(e) => setCronInput(e.target.value)} placeholder="*/5 * * * *" />
                      <div style={{ width: 180 }}>
                        <Dropdown
                          value={selectedTz}
                          options={POPULAR_TZS.map((tz) => ({ label: tz, value: tz }))}
                          onChange={(tz) => setSelectedTz(tz)}
                        />
                      </div>
                    </div>
                    {/* Preset buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setCronInput('*/5 * * * *')}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-pill)', color: 'var(--ink-soft)', border: '1px solid var(--divider)' }}
                      >
                        Every 5 min
                      </button>
                      <button
                        onClick={() => setCronInput('0 * * * *')}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-pill)', color: 'var(--ink-soft)', border: '1px solid var(--divider)' }}
                      >
                        Hourly
                      </button>
                      <button
                        onClick={() => setCronInput('0 0 * * *')}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-pill)', color: 'var(--ink-soft)', border: '1px solid var(--divider)' }}
                      >
                        Daily Midnight
                      </button>
                      <button
                        onClick={() => setCronInput('0 12 * * 1-5')}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-pill)', color: 'var(--ink-soft)', border: '1px solid var(--divider)' }}
                      >
                        Noon Weekdays
                      </button>
                    </div>
                  </div>
                </Field>

                <div className="glass-strong" style={{ padding: 16, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Schedule Description
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
                    ✦ {cronDesc}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Next 5 Scheduled Runs ({selectedTz})
                  </div>
                  {cronRuns.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {cronRuns.map((run, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopy(formatLocal(run, selectedTz, 'all'))}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: 'var(--surface-input)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>Run #{i + 1}</span>
                          <span className="mono" style={{ color: 'var(--ink)' }}>{formatLocal(run, selectedTz, 'all')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Could not compute next runs. Check expression.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE SESSION HISTORY SIDEBAR */}
          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="glass-strong"
                style={{
                  flexShrink: 0,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>Recent Session History</span>
                  <button onClick={() => setHistoryOpen(false)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)' }}>Close</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {historyList.length > 0 ? (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.mode === 'convert' && item.data.q) {
                            setConvertInput(item.data.q);
                            setActiveMode('convert');
                          } else if (item.mode === 'diff' && item.data.d1 && item.data.d2) {
                            setDiffDate1(item.data.d1);
                            setDiffDate2(item.data.d2);
                            setActiveMode('diff');
                          } else if (item.mode === 'cron' && item.data.cron) {
                            setCronInput(item.data.cron);
                            setActiveMode('cron');
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--surface-input)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 12,
                          transition: 'all 0.15s ease',
                          border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: 'var(--grad)',
                              color: '#fff',
                            }}
                          >
                            {item.mode}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--ink-mute)' }}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 2, wordBreak: 'break-all' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.details}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--ink-mute)', fontSize: 12, padding: 20 }}>No recent conversions.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CODE GENERATION FLYOUT POPOVER ── */}
        <AnimatePresence>
          {flyoutValue && flyoutDate && (
            <div
              ref={flyoutRef}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                width: 420,
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-strong"
                style={{
                  padding: 18,
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  background: 'var(--surface-palette)',
                  backdropFilter: 'blur(30px)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Copy as Code Snippet</span>
                  <button onClick={() => setFlyoutValue(null)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>Close</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'JavaScript (Date)', code: `new Date(${flyoutDate.getTime()})` },
                    { label: 'JavaScript (ISO)', code: `new Date("${flyoutDate.toISOString()}")` },
                    { label: 'Python (datetime)', code: `from datetime import datetime\ndatetime.fromtimestamp(${Math.floor(flyoutDate.getTime() / 1000)})` },
                    { label: 'PostgreSQL', code: `SELECT to_timestamp(${Math.floor(flyoutDate.getTime() / 1000)});` },
                    { label: 'MongoDB', code: `ISODate("${flyoutDate.toISOString()}")` },
                    { label: 'Go (time.Unix)', code: `time.Unix(${Math.floor(flyoutDate.getTime() / 1000)}, 0)` },
                  ].map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopySnippet(option.code, idx)}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--divider)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--divider)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{option.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: copiedSnippetIndex === idx ? 'var(--accent)' : 'var(--ink-soft)' }}>
                          {copiedSnippetIndex === idx ? '✓ Copied!' : 'Click to copy'}
                        </span>
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {option.code}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}

// ── Shared Subcomponents ──

function ValueRow({
  label,
  value,
  date,
  onCopy,
  onCode,
}: {
  label: string;
  value: string;
  date: Date;
  onCopy: (val: string) => void;
  onCode?: (e: React.MouseEvent, val: string, d: Date) => void;
}) {
  return (
    <div
      onClick={() => onCopy(value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', minWidth: 120 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 13,
            color: 'var(--ink)',
            wordBreak: 'break-all',
            textAlign: 'right',
          }}
        >
          {value}
        </span>
        {onCode && (
          <button
            onClick={(e) => onCode(e, value, date)}
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--surface-pill)',
              border: '1px solid var(--divider)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--ink-mute)',
            }}
          >
            &lt;/&gt; Code
          </button>
        )}
      </div>
    </div>
  );
}
