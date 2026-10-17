import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { intParam, useUrlState } from './useUrlState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function Harness() {
  const [text, setText] = useUrlState('q', '', (v) => v, (v) => v);
  const location = useLocation();
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <output>{location.search}</output>
    </>
  );
}

function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('useUrlState', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('keeps every keystroke and writes the URL after the debounce', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/?q=']}>
          <Harness />
        </MemoryRouter>,
      );
    });
    const input = container.querySelector('input')!;
    for (const value of ['a', 'ab', 'abc']) {
      act(() => type(input, value));
      expect(input.value).toBe(value);
    }
    expect(container.querySelector('output')!.textContent).toBe('?q=');

    act(() => vi.advanceTimersByTime(200));
    expect(input.value).toBe('abc');
    expect(container.querySelector('output')!.textContent).toBe('?q=abc');
  });

  it('reads the initial value from the URL', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/?q=hello']}>
          <Harness />
        </MemoryRouter>,
      );
    });
    expect(container.querySelector('input')!.value).toBe('hello');
  });
});

describe('intParam', () => {
  const parse = intParam(1, 50, 5);

  it('clamps out-of-range values', () => {
    expect(parse('100000000')).toBe(50);
    expect(parse('-3')).toBe(1);
  });

  it('falls back on junk', () => {
    expect(parse('abc')).toBe(5);
    expect(parse('Infinity')).toBe(5);
  });

  it('rounds fractions', () => {
    expect(parse('7.6')).toBe(8);
  });
});
