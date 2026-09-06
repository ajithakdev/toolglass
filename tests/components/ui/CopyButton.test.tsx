import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CopyButton } from '../../../src/components/ui/CopyButton';
import { ToastProvider } from '../../../src/components/ui/Toast';

describe('CopyButton', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  function renderButton(value: string, label = 'Copy', disabled = false) {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/uuid']}>
          <ToastProvider>
            <Routes>
              <Route
                path="/tools/:slug"
                element={<CopyButton value={value} label={label} disabled={disabled} />}
              />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('renders default label and copies text to clipboard on click', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    renderButton('test-value-123', 'Copy All');
    expect(container.textContent).toContain('Copy All');

    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(false);

    await act(async () => {
      button.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(writeMock).toHaveBeenCalledWith('test-value-123');
    expect(container.textContent).toContain('Copied');
  });

  it('handles empty value by disabling or not triggering copy', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    renderButton('');
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await act(async () => {
      button.click();
    });

    expect(writeMock).not.toHaveBeenCalled();
  });

  it('handles copy failure gracefully', async () => {
    const writeMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    renderButton('failure-value');
    const button = container.querySelector('button') as HTMLButtonElement;

    await act(async () => {
      button.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(writeMock).toHaveBeenCalled();
  });
});
