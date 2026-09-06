import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useTheme } from '../../src/hooks/useTheme';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness() {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggle} data-testid="toggle-btn">Toggle</button>
    </div>
  );
}

describe('useTheme', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    
    matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
    vi.restoreAllMocks();
  });

  function renderTool() {
    act(() => {
      root.render(<TestHarness />);
    });
  }

  it('defaults from localStorage toolglass-theme if set', () => {
    localStorage.setItem('toolglass-theme', 'dark');
    renderTool();
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark');
  });

  it('falls back to OS preference via matchMedia', () => {
    matchMediaMock.mockImplementation((_query: string) => ({
      matches: true, // OS preference dark
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    renderTool();
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark');
  });

  it('toggle() switches between light/dark', () => {
    renderTool();
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('light');
    
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="toggle-btn"]')?.click();
    });
    
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark');
  });

  it('sets data-theme attribute on document.documentElement', () => {
    renderTool();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="toggle-btn"]')?.click();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('stores theme in localStorage', () => {
    renderTool();
    expect(localStorage.getItem('toolglass-theme')).toBe('light');
    
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="toggle-btn"]')?.click();
    });
    
    expect(localStorage.getItem('toolglass-theme')).toBe('dark');
  });
});
