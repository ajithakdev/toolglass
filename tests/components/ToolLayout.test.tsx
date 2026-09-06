import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToolLayout } from '../../src/components/ToolLayout';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ToolLayout', () => {
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

  async function renderComponent(slug: string, usageCount: number = 0) {
    if (usageCount > 0) {
      localStorage.setItem('toolglass_stats', JSON.stringify({ [slug]: usageCount }));
    }

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/tools/${slug}`]}>
          <Routes>
            <Route path="/tools/:slug" element={<ToolLayout><div>Test Child Content</div></ToolLayout>} />
          </Routes>
        </MemoryRouter>
      );
    });
    // Wait for animations
    await act(async () => { await new Promise(r => setTimeout(r, 150)); });
  }

  it('renders tool info correctly', async () => {
    await renderComponent('uuid');
    
    expect(container.textContent).toContain('Back');
    expect(container.textContent).toContain('UUID'); // Title
    expect(container.textContent).toContain('Test Child Content');
  });

  it('shows usage count from stats', async () => {
    await renderComponent('uuid', 5);
    
    expect(container.textContent).toContain("You've used this tool 5 times");
  });

  it('returns null if tool not found', async () => {
    await renderComponent('unknown-tool-slug');
    expect(container.textContent).toBe('');
  });
});
