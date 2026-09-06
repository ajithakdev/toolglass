import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from './NotFound';

// Configure act environment for React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('NotFound Page Component', () => {
  let container: HTMLDivElement;
  let root: Root;

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
    vi.restoreAllMocks();
  });

  it('renders general 404 page for unknown paths', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/random-unknown-path']}>
          <NotFound />
        </MemoryRouter>
      );
    });

    expect(container.querySelector('[data-testid="not-found-page"]')).not.toBeNull();
    expect(container.textContent).toContain('404');
    expect(container.textContent).toContain('Page Not Found');
    expect(container.textContent).toContain('/random-unknown-path');
    expect(container.textContent).toContain('Explore All Tools');
  });

  it('renders tool-specific 404 when isToolNotFound is true', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/invalid-tool-name']}>
          <NotFound attemptedSlug="invalid-tool-name" isToolNotFound={true} />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Tool Not Found:');
    expect(container.textContent).toContain('invalid-tool-name');
  });

  it('suggests related tools when slug matches partially', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/time']}>
          <NotFound attemptedSlug="time" isToolNotFound={true} />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Did you mean one of these tools?');
    expect(container.textContent).toContain('Timestamp');
  });

  it('filters tools dynamically when typing in search input', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/unknown']}>
          <NotFound />
        </MemoryRouter>
      );
    });

    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(searchInput, 'base64');
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true });
      searchInput.dispatchEvent(changeEvent);
    });

    expect(container.textContent).toContain('Search Results for "base64"');
  });
});
