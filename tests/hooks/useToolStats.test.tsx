import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useToolStats } from '../../src/hooks/useToolStats';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness({ slug }: { slug?: string }) {
  const { count, allStats, increment, enabled, toggleTelemetry } = useToolStats(slug);
  return (
    <div>
      <div data-testid="count">{count}</div>
      <div data-testid="all-stats">{JSON.stringify(allStats)}</div>
      <div data-testid="enabled">{enabled ? 'yes' : 'no'}</div>
      <button onClick={increment} data-testid="inc-btn">Inc</button>
      <button onClick={toggleTelemetry} data-testid="toggle-btn">Toggle</button>
    </div>
  );
}

describe('useToolStats', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  function renderTool(slug?: string) {
    act(() => {
      root.render(<TestHarness slug={slug} />);
    });
  }

  it('starts with count 0', () => {
    renderTool('my-tool');
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0');
  });

  it('increment() increases count and persists to localStorage toolglass_stats', () => {
    renderTool('my-tool');
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="inc-btn"]')?.click();
    });
    
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1');
    expect(localStorage.getItem('toolglass_stats')).toBe(JSON.stringify({ 'my-tool': 1 }));
  });

  it('toggleTelemetry() toggles toolglass_telemetry_enabled in localStorage', () => {
    renderTool('my-tool');
    expect(container.querySelector('[data-testid="enabled"]')?.textContent).toBe('yes');
    
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="toggle-btn"]')?.click();
    });
    
    expect(container.querySelector('[data-testid="enabled"]')?.textContent).toBe('no');
    expect(localStorage.getItem('toolglass_telemetry_enabled')).toBe('false');
  });

  it('loads existing stats from localStorage', () => {
    localStorage.setItem('toolglass_stats', JSON.stringify({ 'my-tool': 5 }));
    renderTool('my-tool');
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('5');
    expect(container.querySelector('[data-testid="all-stats"]')?.textContent).toBe(JSON.stringify({ 'my-tool': 5 }));
  });
});
