import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToolPage } from '../../src/pages/ToolPage';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ToolPage', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  async function renderComponent(slug: string) {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/tools/${slug}`]}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<ToolPage />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
    // Let Suspense settle
    await act(async () => { await new Promise(r => setTimeout(r, 200)); });
  }

  it('renders tool component for valid slug and adds to recent', async () => {
    await renderComponent('uuid');
    
    // Since component loading might take a tiny bit due to lazy loading (if any), but in our setup it's synchronous in tests if not lazy, let's just check it doesn't say Tool not found
    expect(container.textContent).not.toContain('Tool not found');
    
    const recent = JSON.parse(localStorage.getItem('toolglass_recent_tools') || '[]');
    expect(recent).toContain('uuid');
  });

  it('renders NotFound for invalid slug', async () => {
    await renderComponent('invalid-tool-slug-123');
    
    expect(container.textContent).toContain('Tool Not Found');
  });
});
