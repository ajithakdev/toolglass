import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useUrlState } from '../../src/hooks/useUrlState';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness() {
  const [value, setValue] = useUrlState<number>(
    'len',
    10,
    (raw) => parseInt(raw, 10),
    (val) => val.toString()
  );

  return (
    <div>
      <div data-testid="val">{value}</div>
      <button onClick={() => setValue(20)} data-testid="set-btn">Set</button>
    </div>
  );
}

describe('useUrlState', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  function renderTool(initialUrl = '/') {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[initialUrl]}>
          <Routes>
            <Route path="*" element={<TestHarness />} />
          </Routes>
        </MemoryRouter>
      );
    });
  }

  it('returns defaultVal when key not in URL', () => {
    renderTool('/');
    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe('10');
  });

  it('parses value from URL search params', () => {
    renderTool('/?len=42');
    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe('42');
  });

  it('updates value when setValue is called (and sets in URL params)', async () => {
    renderTool('/');
    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe('10');
    
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="set-btn"]')?.click();
    });

    // Debounce wait (200ms) for hook to update URL? 
    // Actually the value updates the url after 200ms, let's wait a bit and trigger URL rerender
    await act(async () => {
      await new Promise(r => setTimeout(r, 250));
    });

    // We can't directly check the MemoryRouter URL in DOM simply, but we can verify the DOM re-rendered with new val (though value update isn't immediate in the harness if it relies on URL, wait, setValue calls setSearchParams which triggers render. Wait, it doesn't update the local state, it only updates the URL which then drives the hook state).
    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe('20');
  });
});
