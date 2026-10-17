import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/ui/Toast';
import CaseConverterTool from './CaseConverterTool';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('CaseConverterTool Component', () => {
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
    vi.restoreAllMocks();
  });

  const renderTool = (initialPath = '/tools/case-converter') => {
    act(() => {
      root.render(
        <ToastProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/tools/:slug" element={<CaseConverterTool />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );
    });
  };

  it('renders the initial layout with default input and format cards', () => {
    renderTool();

    expect(container.textContent).toContain('Text Case Converter & Slug');
    expect(container.textContent).toContain('camelCase');
    expect(container.textContent).toContain('snake_case');
    expect(container.textContent).toContain('kebab-case');
    expect(container.textContent).toContain('URL Slug');

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe('hello_world_example');
  });

  it('updates converted outputs dynamically when input value changes', () => {
    renderTool();

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    act(() => {
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeTextareaValueSetter?.call(textarea, 'quickBrownFox');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('quick_brown_fox');
    expect(container.textContent).toContain('quick-brown-fox');
    expect(container.textContent).toContain('QUICK_BROWN_FOX');
  });

  it('loads sample texts when sample buttons are clicked', () => {
    renderTool();

    const sampleButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('APIResponseHandler')
    );
    expect(sampleButtons.length).toBeGreaterThan(0);

    act(() => {
      sampleButtons[0].click();
    });

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('APIResponseHandler');
    expect(container.textContent).toContain('api_response_handler');
  });

  it('switches to Batch multi-line mode and transforms text', () => {
    renderTool();

    const batchButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Batch Multi-Line')
    );
    expect(batchButton).toBeDefined();

    act(() => {
      batchButton?.click();
    });

    expect(container.textContent).toContain('Convert all lines to:');

    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThanOrEqual(2);

    const inputTextarea = textareas[0];
    act(() => {
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeTextareaValueSetter?.call(inputTextarea, 'first_item\nsecond_item\nthird_item');
      inputTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      inputTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const outputTextarea = textareas[1];
    expect(outputTextarea.value).toContain('firstItem');
    expect(outputTextarea.value).toContain('secondItem');
    expect(outputTextarea.value).toContain('thirdItem');
  });

  it('displays detected casing badge for input', () => {
    renderTool();
    expect(container.textContent).toContain('Detected: snake_case');
  });
});
