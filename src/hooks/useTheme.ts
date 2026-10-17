import { useSyncExternalStore } from 'react';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

// Keep in sync with the inline script in index.html that sets the theme before first paint
const KEY = 'toolglass-theme';
const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)');

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

const resolve = (m: ThemeMode): Theme => (m === 'auto' ? (darkQuery()?.matches ? 'dark' : 'light') : m);

// One store shared by every component, so the toggle and the app never disagree
let state: { mode: ThemeMode; theme: Theme } = { mode: readMode(), theme: resolve(readMode()) };
const listeners = new Set<() => void>();

function apply() {
  const root = document.documentElement;
  root.setAttribute('data-theme', state.theme);
  root.style.colorScheme = state.theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', state.theme === 'dark' ? '#0f0a20' : '#f3e7ff');
  listeners.forEach((l) => l());
}

function update(mode: ThemeMode) {
  state = { mode, theme: resolve(mode) };
  apply();
}

export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    // storage blocked: the choice lasts for this page view
  }
  update(mode);
}

// Auto mode follows the OS live
darkQuery()?.addEventListener('change', () => {
  if (state.mode === 'auto') update('auto');
});
// Another tab changed the setting
window.addEventListener('storage', (e) => {
  if (e.key === KEY) update(readMode());
});

if (typeof document !== 'undefined') apply();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useTheme() {
  const { mode, theme } = useSyncExternalStore(subscribe, () => state);
  return { mode, theme, setMode: setThemeMode };
}
