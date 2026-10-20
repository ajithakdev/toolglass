import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';

// All hooks on a page share one pending-write queue and one debounce timer, so
// settings changed together (e.g. a Reset) land in a single URL update instead
// of later writes overwriting earlier ones.
// str null = remove the param (value is back at its default)
const pending = new Map<string, { str: string | null; onWritten: () => void }>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let latestSetter: SetURLSearchParams | null = null;

function queueWrite(key: string, str: string | null, onWritten: () => void, setter: SetURLSearchParams) {
  pending.set(key, { str, onWritten });
  latestSetter = setter;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const writes = [...pending];
    pending.clear();
    writes.forEach(([, w]) => w.onWritten());
    latestSetter?.(
      (prev) => {
        const updated = new URLSearchParams(prev);
        writes.forEach(([k, w]) => (w.str === null ? updated.delete(k) : updated.set(k, w.str)));
        return updated;
      },
      { replace: true },
    );
  }, 200);
}

/** The current page URL with any not-yet-flushed writes applied, so Share never copies stale settings. */
export function currentUrl(): string {
  const url = new URL(window.location.href);
  pending.forEach((w, k) => (w.str === null ? url.searchParams.delete(k) : url.searchParams.set(k, w.str)));
  return url.toString();
}

/**
 * Syncs a piece of state to/from a URL search parameter.
 *
 * @param key          The query-string key to use (e.g. "len")
 * @param defaultVal   The default value if the key is not in the URL
 * @param parse        Converts the raw string from the URL → T
 * @param stringify    Converts T → string for the URL
 *
 * Returns [value, setValue] just like useState.
 * The value updates immediately; the URL write is debounced 200ms.
 */
export function useUrlState<T>(
  key: string,
  defaultVal: T,
  parse: (raw: string) => T,
  stringify: (val: T) => string,
): [T, (val: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(key);

  const [value, setLocal] = useState<T>(() => (raw !== null ? parse(raw) : defaultVal));
  const [seenRaw, setSeenRaw] = useState(raw);
  // String this hook just wrote; cleared once that write shows up in the URL,
  // so a later navigation back to the same string still re-syncs
  const writtenRef = useRef<string | null>(null);

  // Re-sync when the param changes from outside (back/forward, pasted link)
  if (raw !== seenRaw) {
    setSeenRaw(raw);
    const ownWrite = raw !== null && raw === writtenRef.current;
    writtenRef.current = null;
    if (!ownWrite) setLocal(raw !== null ? parse(raw) : defaultVal);
  }

  const setValue = useCallback(
    (next: T) => {
      setLocal(next);
      const str = stringify(next);
      // Defaults stay out of the URL so shared links are short
      const atDefault = str === stringify(defaultVal);
      queueWrite(key, atDefault ? null : str, () => (writtenRef.current = atDefault ? null : str), setSearchParams);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, stringify, setSearchParams],
  );

  // Drop this hook's unsent write on unmount
  useEffect(() => {
    return () => {
      pending.delete(key);
    };
  }, [key]);

  return [value, setValue];
}

/** Parser for integer URL params: rounds, clamps to [min, max], falls back on junk. */
export const intParam = (min: number, max: number, fallback: number) => (raw: string) => {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
