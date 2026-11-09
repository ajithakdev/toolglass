import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CATEGORIES } from '../tools/catalog';
import { tools } from '../tools/registry';
import { ToolRail } from './ToolRail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ToolRail', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mount = () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/json']}>
          <Routes>
            <Route path="/tools/:slug" element={<ToolRail />} />
          </Routes>
        </MemoryRouter>,
      );
    });
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('lists every category and marks the open tool as the current page', () => {
    mount();
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Tools');
    // Categories with no tools yet are not rendered
    for (const c of CATEGORIES.filter((c) => tools.some((t) => t.category === c.id))) {
      expect(container.querySelector(`section[aria-label="${c.name}"]`), c.name).not.toBeNull();
    }
    const current = container.querySelector('a[aria-current="page"]');
    expect(current?.getAttribute('href')).toBe('/tools/json');
  });

  it('collapses a category and keeps the rail collapse in localStorage', () => {
    mount();
    const dev = container.querySelector('section[aria-label="Developers"]')!;
    expect(dev.querySelectorAll('a').length).toBeGreaterThan(0);
    act(() => dev.querySelector('button')!.click());
    expect(dev.querySelectorAll('a').length).toBe(0);

    const toggle = container.querySelector('button[aria-label="Collapse sidebar"]') as HTMLButtonElement;
    act(() => toggle.click());
    expect(localStorage.getItem('toolglass_rail_collapsed')).toBe('1');
    expect(container.querySelector('button[aria-label="Expand sidebar"]')).not.toBeNull();

    act(() => root.unmount());
    container.remove();
    mount();
    expect(container.querySelector('button[aria-label="Expand sidebar"]')).not.toBeNull();
    expect(container.querySelector('a[href="/tools/json"]')?.getAttribute('aria-label')).toBe('JSON Formatter');
  });
});
