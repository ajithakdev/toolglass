import { useCallback, useEffect, useRef } from 'react';
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
 * The URL is updated (debounced 200ms) on every value change.
 */
export function useUrlState<T>(
  key: string,
  defaultVal: T,
  parse: (raw: string) => T,
  stringify: (val: T) => string,
): [T, (val: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive current value from URL, falling back to default
  const raw = searchParams.get(key);
  const value = raw !== null ? parse(raw) : defaultVal;

  // Keep a stable ref so the debounced write has fresh value
  const valueRef = useRef(value);
  valueRef.current = value;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback(
    (next: T) => {
      // Debounce URL writes so fast typing doesn't flood history
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSearchParams(
          (prev) => {
            const updated = new URLSearchParams(prev);
            updated.set(key, stringify(next));
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
