import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
Element.prototype.scrollIntoView ??= () => {};

describe('CommandPalette a11y', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('links the input to the selected option and announces the count', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter>
          <CommandPalette open onClose={() => {}} />
        </MemoryRouter>,
      );
    });

    const input = document.getElementById('command-palette-input')!;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-controls')).toBe('command-palette-results');
    const active = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(active)?.getAttribute('aria-selected')).toBe('true');

    const options = document.querySelectorAll('[role="option"]');
    expect(document.querySelector('[role="status"]')?.textContent).toBe(`${options.length} tools found`);
  });
});
