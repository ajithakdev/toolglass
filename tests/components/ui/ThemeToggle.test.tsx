import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeToggle } from '../../../src/components/ui/ThemeToggle';

describe('ThemeToggle', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
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

  function renderToggle() {
    act(() => {
      root.render(<ThemeToggle />);
    });
  }

  it('renders moon icon in light mode and toggles to sun in dark mode', async () => {
    renderToggle();

    const button = container.querySelector('#theme-toggle') as HTMLButtonElement;
    expect(button).not.toBeNull();
    // Default is light (moon icon)
    expect(button.textContent).toContain('🌙');

    await act(async () => {
      button.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(button.textContent).toContain('☀️');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('rotates slightly on hover events', () => {
    renderToggle();
    const button = container.querySelector('#theme-toggle') as HTMLButtonElement;

    act(() => {
      button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(button.style.transform).toBe('rotate(20deg)');

    act(() => {
      button.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    });
    expect(button.style.transform).toBe('rotate(0deg)');
  });

  it('supports document.startViewTransition if available', async () => {
    const startViewTransitionMock = vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return {
        ready: Promise.resolve(),
      };
    });
    (document as unknown as { startViewTransition: unknown }).startViewTransition =
      startViewTransitionMock;

    renderToggle();
    const button = container.querySelector('#theme-toggle') as HTMLButtonElement;

    await act(async () => {
      button.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(startViewTransitionMock).toHaveBeenCalled();
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });
});
