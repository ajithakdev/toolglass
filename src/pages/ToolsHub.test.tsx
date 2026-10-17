import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ToolsHub } from './ToolsHub';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ToolsHub', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (url: string) =>
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[url]}>
          <ToolsHub />
        </MemoryRouter>,
      );
    });
  const titles = () => [...container.querySelectorAll('.tool-card a')].map((a) => a.getAttribute('href'));

  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('lists every tool by default', async () => {
    render('/tools');
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(titles()).toContain('/tools/json');
    expect(titles()).toContain('/tools/password');
  });

  it('filters by the query in the URL', async () => {
    render('/tools?q=postman');
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(titles()).toEqual(['/tools/api-tester']);
  });

  it('offers a tool request when nothing matches', async () => {
    render('/tools?q=zzzzqqq');
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(container.textContent).toContain('No tool matches that yet.');
    expect(container.querySelector('a[href*="issues/new"]')).not.toBeNull();
  });

  it('filters by category', async () => {
    render('/tools?cat=time');
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(titles()).toEqual(['/tools/timestamp']);
  });
});
