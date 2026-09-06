import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JsonTool from '../../src/tools/json/JsonTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('JsonTool Component & JSON Formatting', () => {
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
  });

  function renderTool() {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/json']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<JsonTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('beautifies valid JSON with 2-space indentation', () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const beautifyBtn = buttons.find((b) => b.textContent?.includes('Beautify'));
    expect(beautifyBtn).toBeDefined();

    act(() => {
      beautifyBtn?.click();
    });

    const output = container.querySelector('output');
    expect(output).not.toBeNull();
    const expected = JSON.stringify({ hello: 'world', arr: [1, 2, 3] }, null, 2);
    expect(output?.textContent?.trim()).toBe(expected);
  });

  it('minifies valid JSON without extra whitespace', () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const minifyBtn = buttons.find((b) => b.textContent?.includes('Minify'));
    expect(minifyBtn).toBeDefined();

    act(() => {
      minifyBtn?.click();
    });

    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('{"hello":"world","arr":[1,2,3]}');
  });

  it('handles invalid JSON by showing error hint and clearing output', () => {
    renderTool();

    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    // Type invalid JSON
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textarea, '{ broken: json, ');
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const buttons = Array.from(container.querySelectorAll('button'));
    const beautifyBtn = buttons.find((b) => b.textContent?.includes('Beautify'));

    act(() => {
      beautifyBtn?.click();
    });

    // Check error display in hint
    expect(container.textContent).toContain('⚠');
    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('Formatted JSON will appear here');
  });

  it('clears all state when Clear is clicked', () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const clearBtn = buttons.find((b) => b.textContent?.includes('Clear'));
    expect(clearBtn).toBeDefined();

    act(() => {
      clearBtn?.click();
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.value).toBe('');
    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('Formatted JSON will appear here');
  });
});
