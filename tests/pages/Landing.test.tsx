import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../../src/pages/Landing';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Landing', () => {
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

  async function renderComponent() {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );
    });
    await act(async () => { await new Promise(r => setTimeout(r, 150)); });
  }

  it('renders heading and tagline', async () => {
    await renderComponent();
    expect(container.textContent).toContain('Toolglass');
    expect(container.textContent).toContain('Frosted developer utilities');
  });

  it('shows category buttons and all tools by default', async () => {
    await renderComponent();
    expect(container.textContent).toContain('All Utilities');
    expect(container.textContent).toContain('Generators');
    expect(container.textContent).toContain('Utilities');

    // All tools should be present, verify some from different categories
    expect(container.textContent).toContain('UUID');
    expect(container.textContent).toContain('Base64');
  });

  it('filters tools when category is clicked', async () => {
    await renderComponent();
    const buttons = Array.from(container.querySelectorAll('button'));
    const generatorsBtn = buttons.find(b => b.textContent?.includes('Generators'));
    
    expect(generatorsBtn).not.toBeUndefined();
    
    await act(async () => {
      generatorsBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => { await new Promise(r => setTimeout(r, 150)); });

    expect(container.textContent).toContain('UUID');
    // Base64 is in Encoders & Decoders, shouldn't be here
    expect(container.textContent).not.toContain('Base64');
  });

  it('shows Recent section when localStorage has recent tools', async () => {
    localStorage.setItem('toolglass_recent_tools', JSON.stringify(['uuid', 'base64']));
    await renderComponent();

    const recentHeader = Array.from(container.querySelectorAll('div')).find(div => div.textContent === 'Recent');
    expect(recentHeader).not.toBeUndefined();
  });
});
