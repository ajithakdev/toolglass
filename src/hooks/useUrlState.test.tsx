import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { currentUrl, intParam, useUrlState } from './useUrlState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function Harness({ show = true }: { show?: boolean }) {
  return show ? <Inner /> : null;
}

function Inner() {
  const [text, setText] = useUrlState('q', '', (v) => v, (v) => v);
  const [n, setN] = useUrlState('n', 5, intParam(1, 50, 5), String);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button id="n" onClick={() => setN(9)}>n</button>
      <button id="paste" onClick={() => navigate('/?q=pasted')}>paste</button>
      <span id="n-val">{n}</span>
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
  const search = () => container.querySelector('output')!.textContent;
  const render = async (url: string, show = true) => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[url]}>
          <Harness show={show} />
        </MemoryRouter>,
      );
    });
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('reads the initial values from the URL', async () => {
    await render('/?q=hello&n=99');
    expect(container.querySelector('input')!.value).toBe('hello');
    expect(container.querySelector('#n-val')!.textContent).toBe('50');
  });

  it('removes the params from the URL after mount, keeping the value', async () => {
    await render('/?q=hello&n=7&keep=1');
    expect(search()).toBe('?keep=1');
    expect(container.querySelector('input')!.value).toBe('hello');
  });

  it('does not touch the URL while editing', async () => {
    await render('/');
    const input = container.querySelector('input')!;
    for (const v of ['a', 'ab', 'abc']) {
      await act(async () => type(input, v));
      expect(input.value).toBe(v);
      expect(search()).toBe('');
    }
    await act(async () => container.querySelector<HTMLButtonElement>('#n')!.click());
    expect(search()).toBe('');
  });

  it('currentUrl lists non-default values and omits defaults', async () => {
    await render('/');
    expect(new URL(currentUrl()).search).toBe('');
    await act(async () => type(container.querySelector('input')!, 'shared'));
    await act(async () => container.querySelector<HTMLButtonElement>('#n')!.click());
    let params = new URL(currentUrl()).searchParams;
    expect(params.get('q')).toBe('shared');
    expect(params.get('n')).toBe('9');
    await act(async () => type(container.querySelector('input')!, ''));
    params = new URL(currentUrl()).searchParams;
    expect(params.has('q')).toBe(false);
    expect(params.get('n')).toBe('9');
  });

  it('unmount removes the keys from currentUrl', async () => {
    await render('/');
    await act(async () => type(container.querySelector('input')!, 'gone'));
    expect(new URL(currentUrl()).searchParams.get('q')).toBe('gone');
    await render('/', false);
    expect(new URL(currentUrl()).searchParams.has('q')).toBe(false);
  });

  it('adopts a param that arrives later, then cleans it', async () => {
    await render('/');
    await act(async () => container.querySelector<HTMLButtonElement>('#paste')!.click());
    expect(container.querySelector('input')!.value).toBe('pasted');
    expect(search()).toBe('');
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
