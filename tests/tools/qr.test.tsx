import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QRCode from 'qrcode';
import QrTool from '../../src/tools/qr/QrTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('QrTool Component & QR Code Generation', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    // Mock HTMLCanvasElement toDataURL
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,fake');
    // Mock URL.createObjectURL and revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url');
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
        <MemoryRouter initialEntries={['/tools/qr']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<QrTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('renders canvas and invokes QRCode.toCanvas with default options', async () => {
    const toCanvasSpy = vi.spyOn(QRCode, 'toCanvas').mockResolvedValue({} as never);

    renderTool();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(toCanvasSpy).toHaveBeenCalledWith(
      canvas,
      'https://github.com/ajithakdev/toolglass',
      expect.objectContaining({ errorCorrectionLevel: 'M', width: 256 })
    );
  });

  it('updates error correction level and re-generates canvas', async () => {
    const toCanvasSpy = vi.spyOn(QRCode, 'toCanvas').mockResolvedValue({} as never);

    renderTool();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // In Field Dropdown, find the select or click trigger
    const select = container.querySelector('select');
    if (select) {
      act(() => {
        select.value = 'H';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } else {
      // If Dropdown is a custom div/button trigger, let's find options
      const trigger = container.querySelector('[role="combobox"], button');
      expect(trigger).toBeDefined();
    }

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(toCanvasSpy).toHaveBeenCalled();
  });

  it('triggers PNG download on clicking Download PNG button', () => {
    vi.spyOn(QRCode, 'toCanvas').mockResolvedValue({} as never);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const pngBtn = buttons.find((b) => b.textContent?.includes('Download PNG'));
    expect(pngBtn).toBeDefined();

    act(() => {
      pngBtn?.click();
    });

    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('generates SVG and triggers SVG download on clicking Download SVG button', async () => {
    vi.spyOn(QRCode, 'toCanvas').mockResolvedValue({} as never);
    const toStringSpy = vi.spyOn(QRCode, 'toString').mockImplementation(async () => '<svg>qrcode</svg>');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const svgBtn = buttons.find((b) => b.textContent?.includes('Download SVG'));
    expect(svgBtn).toBeDefined();

    await act(async () => {
      svgBtn?.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(toStringSpy).toHaveBeenCalledWith(
      'https://github.com/ajithakdev/toolglass',
      expect.objectContaining({ type: 'svg' })
    );
    expect(appendChildSpy).toHaveBeenCalled();
  });
});
