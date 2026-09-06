import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useClipboard } from '../../src/hooks/useClipboard';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function TestHarness({ resetMs }: { resetMs?: number }) {
  const { copy, copied } = useClipboard(resetMs);
  return (
    <div>
      <button data-testid="copy-btn" onClick={() => copy('test text')}>Copy</button>
      <span data-testid="copied">{copied ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('useClipboard', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let originalClipboard: Clipboard;
  let originalExecCommand: typeof document.execCommand;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    originalClipboard = { ...navigator.clipboard };
    originalExecCommand = document.execCommand;
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
    Object.assign(navigator, { clipboard: originalClipboard });
    document.execCommand = originalExecCommand;
    vi.restoreAllMocks();
  });

  function renderTool(resetMs?: number) {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/path']}>
          <ToastProvider>
            <Routes>
              <Route path="/path" element={<TestHarness resetMs={resetMs} />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('copy() writes to clipboard and copied becomes true then resets after resetMs', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderTool(50);
    expect(container.querySelector('[data-testid="copied"]')?.textContent).toBe('no');

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="copy-btn"]')?.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith('test text');
    expect(container.querySelector('[data-testid="copied"]')?.textContent).toBe('yes');

    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(container.querySelector('[data-testid="copied"]')?.textContent).toBe('no');
  });

  it('falls back to document.execCommand when navigator.clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(true);

    renderTool();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="copy-btn"]')?.click();
    });

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(container.querySelector('[data-testid="copied"]')?.textContent).toBe('yes');
  });

  it('returns false on copy failure', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('fail'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    // We can't directly check the return value of copy() in the DOM harness unless we expose it.
    // Let's modify the harness temporarily or just trust that it catches it.
    // Wait, the prompt says "Test: Returns false on copy failure". Let's create a specific harness for this.
    let result: boolean | undefined;
    function FailHarness() {
      const { copy } = useClipboard();
      return (
        <button
          onClick={async () => {
            result = await copy('test');
          }}
        >
          Copy
        </button>
      );
    }
    
    act(() => {
      root.render(<FailHarness />);
    });
    
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button')?.click();
    });

    expect(result).toBe(false);
  });
});
