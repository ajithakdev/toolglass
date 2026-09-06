import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from '../../src/components/CommandPalette';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('CommandPalette', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  async function renderComponent(open: boolean, onClose = vi.fn()) {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <CommandPalette open={open} onClose={onClose} />
        </MemoryRouter>
      );
    });
    // Wait for animations
    await act(async () => { await new Promise(r => setTimeout(r, 150)); });
  }

  const setInputValue = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      nativeSetter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('renders nothing when open=false', async () => {
    await renderComponent(false);
    expect(container.querySelector('.palette-input')).toBeNull();
  });

  it('shows search input with placeholder when open', async () => {
    await renderComponent(true);
    const input = container.querySelector('.palette-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.placeholder).toBe('Search tools…');
  });

  it('shows all tools initially', async () => {
    await renderComponent(true);
    const items = container.querySelectorAll('[role="option"]');
    expect(items.length).toBe(17);
  });

  it('filters tools as user types', async () => {
    await renderComponent(true);
    const input = container.querySelector('.palette-input') as HTMLInputElement;
    await setInputValue(input, 'uuid');
    
    const items = container.querySelectorAll('[role="option"]');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('UUID');
  });

  it('shows "No tools match" when query matches nothing', async () => {
    await renderComponent(true);
    const input = container.querySelector('.palette-input') as HTMLInputElement;
    await setInputValue(input, 'thiswillnevermatchanything');
    
    const items = container.querySelectorAll('[role="option"]');
    expect(items.length).toBe(0);
    expect(container.textContent).toContain('No tools match');
  });

  it('handles keyboard navigation and calls onClose on Enter', async () => {
    const onClose = vi.fn();
    await renderComponent(true, onClose);
    
    await act(async () => {
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      container.querySelector('[role="dialog"]')?.dispatchEvent(downEvent);
    });
    
    await act(async () => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      container.querySelector('[role="dialog"]')?.dispatchEvent(enterEvent);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    await renderComponent(true, onClose);
    
    await act(async () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      container.querySelector('[role="dialog"]')?.dispatchEvent(escapeEvent);
    });

    expect(onClose).toHaveBeenCalled();
  });
});
