import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom doesn't implement matchMedia — stub it for useTheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe('App Shell & Routing Integration', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
  });

  function renderApp(route = '/') {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      );
    });
  }

  it('renders navbar with Toolglass brand name and GitHub link', async () => {
    renderApp();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container.textContent).toContain('Toolglass');
    expect(container.textContent).toContain('GitHub');

    const githubLink = container.querySelector('a[href*="github.com"]') as HTMLAnchorElement;
    expect(githubLink).not.toBeNull();
    expect(githubLink.href).toContain('ajithakdev/toolglass');
  });

  it('renders "Search tools" button with Ctrl K shortcut in nav', async () => {
    renderApp();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const searchBtn = container.querySelector('#open-command-palette');
    expect(searchBtn).not.toBeNull();
    expect(searchBtn?.textContent).toContain('Search tools');
    expect(searchBtn?.textContent).toContain('Ctrl K');
  });

  it('renders footer with privacy notice and Local Usage Stats toggle', async () => {
    renderApp();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container.textContent).toContain('No data leaves your browser');
    expect(container.textContent).toContain('Local Usage Stats');

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(true); // enabled by default
  });

  it('renders Landing page at root route /', async () => {
    renderApp('/');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Landing page shows the tagline
    expect(container.textContent).toContain('Frosted developer utilities');
    expect(container.textContent).toContain('All Utilities');
  });

  it('renders 404 page for unknown route /some/random/page', async () => {
    renderApp('/some/random/page');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container.textContent).toContain('404');
  });

  it('renders tool page for valid tool slug /tools/password', async () => {
    renderApp('/tools/password');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(container.textContent).toContain('Password Generator');
  });

  it('renders tool-not-found for invalid slug /tools/doesntexist', async () => {
    renderApp('/tools/doesntexist');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container.textContent).toContain('404');
    expect(container.textContent).toContain('doesntexist');
  });

  it('opens command palette when Ctrl+K is pressed', async () => {
    renderApp();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Press Ctrl+K
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
      );
      await new Promise((r) => setTimeout(r, 100));
    });

    // Command palette should be open — look for the dialog role
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    const input = dialog?.querySelector('input');
    expect(input?.placeholder).toBe('Search tools…');
    expect(dialog?.textContent).toContain('Password Generator');
  });

  it('opens command palette via search button click', async () => {
    renderApp();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const searchBtn = container.querySelector('#open-command-palette') as HTMLButtonElement;
    expect(searchBtn).not.toBeNull();

    await act(async () => {
      searchBtn.click();
      await new Promise((r) => setTimeout(r, 100));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });
});
