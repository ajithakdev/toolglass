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
    });
  });
});

describe('About', () => {
  it('renders every section and groups the storage rows', () => {
    const c = render(<About />);
    ['privacy', 'stored', 'install', 'shortcuts', 'open-source', 'version'].forEach((id) => expect(c.querySelector(`section#${id}`)).not.toBeNull());
    expect(c.querySelectorAll('#stored table tr')).toHaveLength(STORED.length);
    expect([...c.querySelectorAll('#stored h3')].map((h) => h.textContent)).toEqual(['Preferences', 'Tool data', 'API Tester']);
  });
});
