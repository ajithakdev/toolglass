import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/Toast';
import NanoIdTool from '../../src/tools/nanoid/NanoIdTool';

// Configure act environment for React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('NanoIdTool Component & Generation Logic', () => {
  let container: HTMLDivElement;
  let root: Root;

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
  });

  const renderTool = () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/nanoid']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<NanoIdTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  };

  it('renders with default 5 NanoIDs of length 21 using URL-safe characters', () => {
    renderTool();

    const output = container.querySelector('output');
    expect(output).not.toBeNull();
    const ids = (output?.textContent || '').trim().split('\n').filter(Boolean);
    expect(ids).toHaveLength(5);

    for (const id of ids) {
      expect(id).toHaveLength(21);
      // Default alphabet is URL-safe: letters, digits, _, -
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    }
  });

  it('restricts characters strictly to custom alphabet', () => {
    renderTool();

    const inputs = Array.from(container.querySelectorAll('input'));
    const alphabetInput = inputs.find(
      (el) => el.value.includes('useandom')
    ) as HTMLInputElement;
    expect(alphabetInput).toBeTruthy();

    // Set custom hex alphabet
    act(() => {
      // Simulate input event
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(alphabetInput, '0123456789ABCDEF');
      alphabetInput.dispatchEvent(new Event('input', { bubbles: true }));
      alphabetInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const output = container.querySelector('output');
    const ids = (output?.textContent || '').trim().split('\n').filter(Boolean);
    expect(ids).toHaveLength(5);

    for (const id of ids) {
      expect(id).toMatch(/^[0-9A-F]+$/);
    }
  });

  it('generates unique IDs across regenerate clicks', () => {
    renderTool();

    const set = new Set<string>();
    const regenBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Regenerate')
    );
    expect(regenBtn).toBeDefined();

    for (let i = 0; i < 5; i++) {
      act(() => {
        regenBtn?.click();
      });
      const output = container.querySelector('output');
      const lines = (output?.textContent || '').trim().split('\n').filter(Boolean);
      for (const line of lines) {
        set.add(line);
      }
    }

    expect(set.size).toBe(25);
  });

  it('resets settings to default when Reset is clicked', () => {
    renderTool();

    const resetBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Reset')
    );
    expect(resetBtn).toBeDefined();

    act(() => {
      resetBtn?.click();
    });

    const output = container.querySelector('output');
    const ids = (output?.textContent || '').trim().split('\n').filter(Boolean);
    expect(ids).toHaveLength(5);
    expect(ids[0]).toHaveLength(21);
  });
});
