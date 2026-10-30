import { useEffect, useRef, useState } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';

// Values live in memory only (some are sensitive, like URLs with tokens). The
// address bar is never written while the user works; Share builds its link from
// this registry.
const registry = new Map<object, { key: string; str: string }>();

// Hooks that mount together all strip their param in one navigation, because
// separate setSearchParams calls in the same tick would overwrite each other.
const toClean = new Set<string>();

function queueClean(key: string, setter: SetURLSearchParams) {
  if (toClean.size === 0) {
    queueMicrotask(() => {
      const keys = [...toClean];
      toClean.clear();
      setter(
        (prev) => {
          const next = new URLSearchParams(prev);
          keys.forEach((k) => next.delete(k));
          return next;
        },
        { replace: true },
      );
    });
  }
  toClean.add(key);
}

/** The page URL plus every non-default value held by a mounted useUrlState hook, for the Share button. */
export function currentUrl(): string {
  const url = new URL(window.location.href);
  registry.forEach(({ key, str }) => url.searchParams.set(key, str));
  return url.toString();
}

/**
 * Reads a piece of state from a URL search parameter once, then keeps it in memory.
 *
 * @param key          The query-string key to use (e.g. "len")
 * @param defaultVal   The default value if the key is not in the URL
 * @param parse        Converts the raw string from the URL → T
 * @param stringify    Converts T → string for share links
 *
 * Returns [value, setValue] just like useState. A param found in the URL is
 * adopted and then removed from the address bar; the URL is never written during
 * editing. Share links come from `currentUrl()`.
 */
export function useUrlState<T>(
  key: string,
  defaultVal: T,
  parse: (raw: string) => T,
  stringify: (val: T) => string,
): [T, (val: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(key);

  const [value, setValue] = useState<T>(() => (raw !== null ? parse(raw) : defaultVal));
  const [seenRaw, setSeenRaw] = useState(raw);

  // A new param arriving from outside (pasted link) replaces the value; the
  // param disappearing after cleanup must not reset it
  if (raw !== seenRaw) {
    setSeenRaw(raw);
    if (raw !== null) setValue(parse(raw));
  }

  useEffect(() => {
    if (raw !== null) queueClean(key, setSearchParams);
  }, [raw, key, setSearchParams]);

  const id = useRef({}).current;
  const str = stringify(value);
  const atDefault = str === stringify(defaultVal);
  useEffect(() => {
    if (!atDefault) registry.set(id, { key, str });
    return () => {
      registry.delete(id);
    };
  }, [id, key, str, atDefault]);

  return [value, setValue];
}

/** Parser for integer URL params: rounds, clamps to [min, max], falls back on junk. */
export const intParam = (min: number, max: number, fallback: number) => (raw: string) => {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
