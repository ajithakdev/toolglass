import { describe, it, expect, vi, beforeEach } from 'vitest';

// jsdom has no matchMedia; fake one whose OS preference we control
let osDark = false;
const listeners: ((e: { matches: boolean }) => void)[] = [];
vi.stubGlobal('matchMedia', () => ({
  get matches() {
    return osDark;
  },
  addEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.push(l),
  removeEventListener: () => {},
}));

const { setThemeMode } = await import('./useTheme');
const html = document.documentElement;

describe('theme store', () => {
  beforeEach(() => {
    osDark = false;
    setThemeMode('auto');
  });

  it('stores explicit modes and applies them', () => {
    setThemeMode('dark');
    expect(localStorage.getItem('toolglass-theme')).toBe('dark');
    expect(html.getAttribute('data-theme')).toBe('dark');
    setThemeMode('light');
    expect(html.getAttribute('data-theme')).toBe('light');
  });

  it('auto clears storage and follows OS changes live', () => {
    setThemeMode('dark');
    setThemeMode('auto');
    expect(localStorage.getItem('toolglass-theme')).toBeNull();
    expect(html.getAttribute('data-theme')).toBe('light');
    osDark = true;
    listeners.forEach((l) => l({ matches: true }));
    expect(html.getAttribute('data-theme')).toBe('dark');
  });

  it('ignores OS changes when a mode is chosen', () => {
    setThemeMode('light');
    osDark = true;
    listeners.forEach((l) => l({ matches: true }));
    expect(html.getAttribute('data-theme')).toBe('light');
  });
});
