import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
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

describe('useUrlState with several keys and navigation', () => {
  let container: HTMLDivElement;
  let root: Root;

  function Two() {
    const [a, setA] = useUrlState('a', 'x', (v) => v, (v) => v);
    const [b, setB] = useUrlState('b', 'x', (v) => v, (v) => v);
    const location = useLocation();
    const navigate = useNavigate();
    return (
      <>
        <button id="both" onClick={() => { setA('1'); setB('2'); }}>both</button>
        <button id="to-other" onClick={() => navigate('/?a=other&b=old')}>other</button>
        <button id="to-mine" onClick={() => navigate('/?a=mine&b=old')}>mine</button>
        <input value={a} onChange={(e) => setA(e.target.value)} />
        <span id="vals">{a},{b}</span>
        <output>{location.search}</output>
      </>
    );
  }

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/?a=old&b=old']}>
          <Two />
        </MemoryRouter>,
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('writes two keys changed in one event without losing either', () => {
    act(() => container.querySelector<HTMLButtonElement>('#both')!.click());
    act(() => vi.advanceTimersByTime(200));
    expect(container.querySelector('output')!.textContent).toBe('?a=1&b=2');
    expect(container.querySelector('#vals')!.textContent).toBe('1,2');
  });

  it('re-syncs on A -> B -> A navigation after its own write', () => {
    const input = container.querySelector('input')!;
    act(() => type(input, 'mine'));
    act(() => vi.advanceTimersByTime(200));
    act(() => container.querySelector<HTMLButtonElement>('#to-other')!.click());
    expect(input.value).toBe('other');
    act(() => container.querySelector<HTMLButtonElement>('#to-mine')!.click());
    expect(input.value).toBe('mine');
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
