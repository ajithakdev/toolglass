import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MarkdownTool from '../../src/tools/markdown/MarkdownTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('MarkdownTool Component & Preview / Sanitization', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-html');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  function renderTool() {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/markdown']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<MarkdownTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  function setMarkdown(val: string) {
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textarea, val);
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  it('renders default markdown preview with heading, strong text, and code', () => {
    renderTool();

    const preview = container.querySelector('.glass[style*="min-height: 500px"]');
    expect(preview).not.toBeNull();
    expect(preview?.querySelector('h1')?.textContent).toBe('Hello World');
    expect(preview?.querySelector('strong')?.textContent).toBe('Markdown');
    expect(preview?.querySelector('code')?.textContent).toContain('console.log');
  });

  it('sanitizes malicious script tags and inline handlers via DOMPurify', () => {
    renderTool();

    setMarkdown(
      '# Safe Header\n\n<script>alert("xss")</script><img src="x" onerror="alert(1)" />'
    );

    const preview = container.querySelector('.glass[style*="min-height: 500px"]');
    expect(preview?.querySelector('h1')?.textContent).toBe('Safe Header');
    expect(preview?.querySelector('script')).toBeNull();
    // Image tag might exist without onerror attribute
    const img = preview?.querySelector('img');
    if (img) {
      expect(img.getAttribute('onerror')).toBeNull();
    }
  });

  it('triggers HTML download file creation when Download is clicked', () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const downloadBtn = buttons.find((b) => b.textContent?.trim() === 'Download');
    expect(downloadBtn).toBeDefined();

    act(() => {
      downloadBtn?.click();
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('handles PDF/Print button by opening print window', () => {
    const printMock = vi.fn();
    const openMock = vi.fn().mockReturnValue({
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: printMock,
    });
    window.open = openMock;

    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const printBtn = buttons.find((b) => b.textContent?.includes('PDF / Print'));
    expect(printBtn).toBeDefined();

    act(() => {
      printBtn?.click();
    });

    expect(openMock).toHaveBeenCalled();
  });
});
