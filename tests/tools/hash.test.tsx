import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HashTool from '../../src/tools/hash/HashTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('HashTool Component & Cryptographic Hashing', () => {
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
        <MemoryRouter initialEntries={['/tools/hash']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<HashTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('computes correct default SHA-256 for "hello world"', async () => {
    renderTool();

    // Allow promise in useEffect to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const output = container.querySelector('output');
    expect(output).not.toBeNull();
    // SHA-256 of "hello world"
    expect(output?.textContent?.trim()).toBe(
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    );
  });

  it('switches algorithms and calculates SHA-1, SHA-384, SHA-512', async () => {
    renderTool();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const buttons = Array.from(container.querySelectorAll('button'));

    // Switch to SHA-1
    const sha1Btn = buttons.find((b) => b.textContent?.trim() === 'SHA-1');
    expect(sha1Btn).toBeDefined();

    await act(async () => {
      sha1Btn?.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const output = container.querySelector('output');
    // SHA-1 of "hello world"
    expect(output?.textContent?.trim()).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');

    // Switch to SHA-384
    const sha384Btn = buttons.find((b) => b.textContent?.trim() === 'SHA-384');
    expect(sha384Btn).toBeDefined();

    await act(async () => {
      sha384Btn?.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(output?.textContent?.trim()).toHaveLength(96);

    // Switch to SHA-512
    const sha512Btn = buttons.find((b) => b.textContent?.trim() === 'SHA-512');
    expect(sha512Btn).toBeDefined();

    await act(async () => {
      sha512Btn?.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // SHA-512 of "hello world" (128 hex characters)
    const sha512Hash = output?.textContent?.trim();
    expect(sha512Hash).toHaveLength(128);
    expect(sha512Hash).toBe(
      '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
    );
  });

  it('updates hash when input is cleared or modified', async () => {
    renderTool();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    // Change input to empty string
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textarea, '');
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const output = container.querySelector('output');
    // SHA-256 of empty string
    expect(output?.textContent?.trim()).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});
