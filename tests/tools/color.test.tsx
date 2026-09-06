import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ColorTool from '../../src/tools/color/ColorTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ColorTool Component & Color Conversions', () => {
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

  function renderTool() {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/color']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<ColorTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  function setColorInput(color: string) {
    const textInput = container.querySelector('input.input') as HTMLInputElement;
    expect(textInput).not.toBeNull();
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textInput, color);
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
      textInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  it('renders default color #8b5cf6 with HEX, RGB, and HSL conversions', () => {
    renderTool();

    expect(container.textContent).toContain('HEX');
    expect(container.textContent).toContain('RGB');
    expect(container.textContent).toContain('HSL');
    expect(container.textContent).toContain('#8B5CF6');
    expect(container.textContent).toContain('rgb(139, 92, 246)');
  });

  it('updates conversion values when preset color is clicked', () => {
    renderTool();

    const redPreset = container.querySelector('div[title="#FF0000"]') as HTMLElement;
    expect(redPreset).not.toBeNull();

    act(() => {
      redPreset.click();
    });

    expect(container.textContent).toContain('#FF0000');
    expect(container.textContent).toContain('rgb(255, 0, 0)');
    expect(container.textContent).toContain('hsl(0, 100%, 50%)');
  });

  it('displays error message when color format is invalid', () => {
    renderTool();

    setColorInput('not-a-real-color-12345');

    expect(container.textContent).toContain('Invalid color format.');
    expect(container.textContent).not.toContain('HEX');
  });

  it('copies color to clipboard when copy row is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderTool();

    const hexLabel = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent?.trim() === 'HEX'
    );
    expect(hexLabel).toBeDefined();
    const hexRow = hexLabel?.parentElement as HTMLDivElement;
    expect(hexRow).not.toBeNull();

    await act(async () => {
      hexRow.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith('#8B5CF6');
    expect(hexRow.textContent).toContain('Copied!');
  });
});
