import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PasswordTool from '../../src/tools/password/PasswordTool';
import { ToastProvider } from '../../src/components/ui/Toast';

describe('PasswordTool Component', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
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

  function renderTool(route = '/tools/password') {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[route]}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<PasswordTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('renders password output, strength meter, and character class toggles', async () => {
    renderTool();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('Password Generator');
    expect(container.textContent).toContain('Strength');
    expect(container.textContent).toContain('Uppercase');
    expect(container.textContent).toContain('Lowercase');
    expect(container.textContent).toContain('Numbers');
    expect(container.textContent).toContain('Symbols');
    expect(container.textContent).toContain('Regenerate');
    expect(container.textContent).toContain('Reset');
  });

  it('regenerates a new password on clicking Regenerate', async () => {
    renderTool();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const output = container.querySelector('output');
    const firstPwd = output?.textContent || '';
    expect(firstPwd.length).toBe(20);

    const regenBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Regenerate')
    )!;

    await act(async () => {
      regenBtn.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    const secondPwd = output?.textContent || '';
    expect(secondPwd.length).toBe(20);
  });

  it('toggles character classes and updates password pool', async () => {
    renderTool();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const toggles = Array.from(container.querySelectorAll('button[role="switch"]'));
    const uppercaseToggle = toggles.find((t) => t.textContent?.includes('Uppercase'))!;

    await act(async () => {
      uppercaseToggle.click();
      await new Promise((r) => setTimeout(r, 300));
    });

    expect(uppercaseToggle.getAttribute('aria-checked')).toBe('false');
  });

  it('resets settings to default on clicking Reset', async () => {
    renderTool();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reset')
    )!;

    await act(async () => {
      resetBtn.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('20 chars');
  });

  it('copies share link when Share button is clicked', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    renderTool();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const shareBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Share')
    )!;

    await act(async () => {
      shareBtn.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(writeMock).toHaveBeenCalled();
    expect(container.textContent).toContain('Copied!');
  });
});
