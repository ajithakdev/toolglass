import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CATEGORIES } from '../tools/catalog';
import { toolsInCategory } from '../tools/registry';
import { STORED } from '../lib/stored';
import { ToastProvider } from '../components/ui/Toast';
import { About } from './About';
import { Home } from './Home';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
vi.mock('../components/home/GlassScene', () => ({ default: () => null }));

function render(node: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(
      <MemoryRouter>
        <ToastProvider>{node}</ToastProvider>
      </MemoryRouter>,
    );
  });
  return container;
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} });
});

describe('Home', () => {
  it('shows a tile with a tool count for every non-empty category', () => {
    const c = render(<Home />);
    const tiles = [...c.querySelectorAll('.cat-tile')];
    const expected = CATEGORIES.filter((k) => toolsInCategory(k.id).length > 0);
    expect(tiles).toHaveLength(expected.length);
    expected.forEach((k, i) => {
      expect(tiles[i]!.textContent).toContain(`${toolsInCategory(k.id).length} tool`);
      expect(tiles[i]!.querySelector('a')!.getAttribute('href')).toBe(`/tools#cat-${k.id}`);
      const pills = [...tiles[i]!.querySelectorAll('.pill')];
      const n = toolsInCategory(k.id).length;
      expect(pills).toHaveLength(Math.min(n, 3) + (n > 3 ? 1 : 0));
      if (n > 3) {
        expect(pills[3]!.textContent).toBe(`+${n - 3} more`);
        expect(pills[3]!.getAttribute('href')).toBe(`/tools#cat-${k.id}`);
      }
    });
  });

  it('renders the proof number immediately and the sticker board links', () => {
    const c = render(<Home />);
    expect(c.querySelector('.proof-number .num')!.textContent).toMatch(/^\d+$/);
    expect(c.querySelectorAll('.board-tags a.tag').length).toBeGreaterThan(0);
    expect(c.querySelector('.board-center a.cta')!.getAttribute('href')).toBe('/tools');
  });
});

describe('About', () => {
  it('renders every section and groups the storage rows', () => {
    const c = render(<About />);
    ['privacy', 'stored', 'install', 'shortcuts', 'open-source', 'version'].forEach((id) => expect(c.querySelector(`section#${id}`)).not.toBeNull());
    expect(c.querySelectorAll('#stored table tr')).toHaveLength(STORED.length);
    const rows = [...c.querySelectorAll('.glance > div dt')].map((d) => d.textContent);
    expect(rows).toEqual(['Tools', 'Requests to other servers', 'Saved on this device', 'Version']);
    expect([...c.querySelectorAll('#stored h3')].map((h) => h.textContent)).toEqual(['Preferences', 'Tool data', 'API Tester']);
  });
});
