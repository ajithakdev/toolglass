import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UrlTool from '../../src/tools/url/UrlTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('UrlTool Component & URI Encoding/Decoding', () => {
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
        <MemoryRouter initialEntries={['/tools/url']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<UrlTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  async function setInput(val: string) {
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textarea, val);
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
  }

  it('encodes default text "Hello, world!" to "Hello%2C%20world!"', () => {
    renderTool();

    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('Hello%2C%20world!');
  });

  it('decodes encoded URI sequence when switched to decode mode', async () => {
    renderTool();

    // Switch to Decode
    const buttons = Array.from(container.querySelectorAll('button'));
    const decodeBtn = buttons.find((b) => b.textContent?.trim() === 'Decode');
    expect(decodeBtn).toBeDefined();

    await act(async () => {
      decodeBtn?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    await setInput('https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26tag%3D%E2%9C%A8');

    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('https://example.com/search?q=hello world&tag=✨');
  });

  it('catches and displays error on malformed URI sequence in decode mode', async () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const decodeBtn = buttons.find((b) => b.textContent?.trim() === 'Decode');
    await act(async () => {
      decodeBtn?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    // Incomplete percent sequence
    await setInput('%E0%A4%A');

    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toContain('Error:');
  });

  it('clears input and displays placeholder when Clear is clicked', async () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const clearBtn = buttons.find((b) => b.textContent?.trim() === 'Clear');
    expect(clearBtn).toBeDefined();

    await act(async () => {
      clearBtn?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.value).toBe('');
    const output = container.querySelector('output');
    expect(output?.textContent?.trim()).toBe('Result will appear here');
  });
});
