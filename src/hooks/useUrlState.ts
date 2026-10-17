import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  // Last string this hook wrote, so our own URL write doesn't reset the value
  const writtenRef = useRef<string | null>(null);

  // Re-sync when the param changes from outside (back/forward, pasted link)
  if (raw !== seenRaw) {
    setSeenRaw(raw);
    if (raw !== writtenRef.current) setLocal(raw !== null ? parse(raw) : defaultVal);
  }

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback(
    (next: T) => {
      setLocal(next);
      // Debounce URL writes so fast typing doesn't flood history
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const str = stringify(next);
        writtenRef.current = str;
        setSearchParams(
          (prev) => {
            const updated = new URLSearchParams(prev);
            updated.set(key, str);
            return updated;
          },
          { replace: true },
        );
      }, 200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, stringify],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [value, setValue];
}

/** Parser for integer URL params: rounds, clamps to [min, max], falls back on junk. */
export const intParam = (min: number, max: number, fallback: number) => (raw: string) => {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
