import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegexTool from '../../src/tools/regex/RegexTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('RegexTool Component & Pattern Matching', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

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
  });

  function renderTool() {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/regex']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<RegexTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  function setPattern(val: string) {
    const inputs = Array.from(container.querySelectorAll('input'));
    const patternInput = inputs.find((i) => i.placeholder === '\\w+');
    expect(patternInput).toBeDefined();

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(patternInput, val);
      patternInput?.dispatchEvent(new Event('input', { bubbles: true }));
      patternInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  it('renders default regex and matches 2 dates with named capture groups', () => {
    renderTool();

    expect(container.textContent).toContain('Highlighted Matches (2)');

    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe('2024-03-12');
    expect(marks[1].textContent).toBe('2024-03-13');

    // Verify capture groups table
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('year');
    expect(table?.textContent).toContain('2024');
    expect(table?.textContent).toContain('month');
    expect(table?.textContent).toContain('03');
  });

  it('updates match count when toggling global flag off', () => {
    renderTool();

    // Toggle global flag 'g'
    const globalToggle = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Global (g)')
    );
    expect(globalToggle).toBeDefined();

    act(() => {
      globalToggle?.click();
    });

    expect(container.textContent).toContain('Highlighted Matches (1)');
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('2024-03-12');
  });

  it('handles invalid regex syntax gracefully with error display', () => {
    renderTool();

    // Unclosed parenthesis
    setPattern('(invalid[regex');

    expect(container.textContent).toContain('Highlighted Matches (0)');
    // Check error message presence
    const errorDiv = container.querySelector('div[style*="var(--status-error)"]');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent?.length).toBeGreaterThan(0);
  });
});
