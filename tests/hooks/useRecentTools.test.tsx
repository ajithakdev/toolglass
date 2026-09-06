import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecentTools } from '../../src/hooks/useRecentTools';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness() {
  const { recents, addRecent } = useRecentTools();
  return (
    <div>
      <div data-testid="recents">{recents.join(',')}</div>
      <button onClick={() => addRecent('tool1')} data-testid="add-tool1">Add Tool 1</button>
      <button onClick={() => addRecent('tool2')} data-testid="add-tool2">Add Tool 2</button>
      <button onClick={() => addRecent('tool3')} data-testid="add-tool3">Add Tool 3</button>
      <button onClick={() => addRecent('tool4')} data-testid="add-tool4">Add Tool 4</button>
    </div>
  );
}

describe('useRecentTools', () => {
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

  function renderTool() {
    act(() => {
      root.render(<TestHarness />);
    });
  }

  it('starts with empty recents', () => {
    renderTool();
    expect(container.querySelector('[data-testid="recents"]')?.textContent).toBe('');
  });

  it('adds slug and stores in localStorage under toolglass_recent_tools', () => {
    renderTool();
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool1"]')?.click();
    });
    expect(container.querySelector('[data-testid="recents"]')?.textContent).toBe('tool1');
    expect(localStorage.getItem('toolglass_recent_tools')).toBe(JSON.stringify(['tool1']));
  });

  it('caps at 3 most recent (MAX_RECENTS = 3)', () => {
    renderTool();
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool1"]')?.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool2"]')?.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool3"]')?.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool4"]')?.click();
    });
    // Order should be tool4, tool3, tool2
    expect(container.querySelector('[data-testid="recents"]')?.textContent).toBe('tool4,tool3,tool2');
  });

  it('deduplicates — adding same slug moves it to front', () => {
    renderTool();
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool1"]')?.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool2"]')?.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="add-tool1"]')?.click();
    });
    expect(container.querySelector('[data-testid="recents"]')?.textContent).toBe('tool1,tool2');
  });

  it('loads from existing localStorage on mount', () => {
    localStorage.setItem('toolglass_recent_tools', JSON.stringify(['tool2', 'tool1']));
    renderTool();
    expect(container.querySelector('[data-testid="recents"]')?.textContent).toBe('tool2,tool1');
  });
});
