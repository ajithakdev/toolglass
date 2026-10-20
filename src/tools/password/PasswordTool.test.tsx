import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PasswordTool from './PasswordTool';
import { ToastProvider } from '../../components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('PasswordTool bulk mode', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function renderTool(route: string) {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[route]}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<PasswordTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>,
      );
    });
  }

  const output = () => container.querySelector('output')!.textContent!;
  const downloadButton = () => Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Download .txt');

  it('shows one password and no download by default', () => {
    renderTool('/tools/password');
    expect(output()).not.toContain('\n');
    expect(downloadButton()).toBeUndefined();
  });

  it('lists count distinct passwords from the URL and offers a download', () => {
    renderTool('/tools/password?c=12&len=10');
    const lines = output().split('\n');
    expect(lines).toHaveLength(12);
    expect(new Set(lines).size).toBe(12);
    lines.forEach((l) => expect(l).toHaveLength(10));
    expect(downloadButton()).toBeDefined();
  });

  it('offers nothing to export when every class is off', () => {
    renderTool('/tools/password?c=10&u=0&l=0&n=0&s=0');
    expect(output()).not.toContain('\n');
    expect(downloadButton()).toBeUndefined();
  });
});
