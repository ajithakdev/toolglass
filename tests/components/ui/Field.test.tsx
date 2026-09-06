import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Dropdown,
  Toggle,
  Slider,
} from '../../../src/components/ui/Field';

describe('Field Components', () => {
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
    vi.restoreAllMocks();
  });

  it('renders Field with label and optional hint', () => {
    act(() => {
      root.render(
        <Field label="Username" hint="Required field">
          <input data-testid="inp" />
        </Field>
      );
    });

    expect(container.textContent).toContain('Username');
    expect(container.textContent).toContain('Required field');
    expect(container.querySelector('[data-testid="inp"]')).not.toBeNull();
  });

  it('renders TextInput and handles user typing', () => {
    const onChange = vi.fn();
    act(() => {
      root.render(<TextInput placeholder="Type here" onChange={onChange} />);
    });

    const input = container.querySelector('input')!;
    expect(input.placeholder).toBe('Type here');

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(input, 'hello');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('renders TextArea with monospaced style', () => {
    act(() => {
      root.render(<TextArea defaultValue="code content" />);
    });

    const ta = container.querySelector('textarea')!;
    expect(ta.value).toBe('code content');
  });

  it('renders Select with options and chevron', () => {
    const onChange = vi.fn();
    act(() => {
      root.render(
        <Select defaultValue="b" onChange={onChange}>
          <option value="a">Alpha</option>
          <option value="b">Beta</option>
        </Select>
      );
    });

    const select = container.querySelector('select')!;
    expect(select.value).toBe('b');
    expect(container.textContent).toContain('▼');

    act(() => {
      select.value = 'a';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders Dropdown, opens menu, and selects option', async () => {
    const onChange = vi.fn();
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];

    act(() => {
      root.render(<Dropdown value="opt1" options={options} onChange={onChange} />);
    });

    expect(container.textContent).toContain('Option 1');

    // Click trigger to open
    const trigger = container.querySelector('button')!;
    await act(async () => {
      trigger.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('Option 2');

    // Click option 2
    const optButtons = Array.from(container.querySelectorAll('button'));
    const opt2Btn = optButtons.find((b) => b.textContent?.includes('Option 2'))!;
    await act(async () => {
      opt2Btn.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onChange).toHaveBeenCalledWith('opt2');
  });

  it('closes Dropdown when clicking trigger again', async () => {
    const options = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];

    act(() => {
      root.render(<Dropdown value="a" options={options} onChange={() => {}} />);
    });

    const trigger = container.querySelector('button')!;
    await act(async () => {
      trigger.click();
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(container.textContent).toContain('B');

    // Click trigger again to close
    await act(async () => {
      trigger.click();
      await new Promise((r) => setTimeout(r, 250));
    });

    // Menu should be closed
    expect(container.querySelectorAll('button')).toHaveLength(1);
  });

  it('renders Toggle and triggers onChange', () => {
    const onChange = vi.fn();
    act(() => {
      root.render(<Toggle checked={false} onChange={onChange} label="Enable Feature" />);
    });

    const button = container.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(container.textContent).toContain('Enable Feature');

    act(() => {
      button.click();
    });

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders Slider and handles value adjustments', () => {
    const onChange = vi.fn();
    act(() => {
      root.render(<Slider value={20} min={4} max={64} onChange={onChange} />);
    });

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('20');

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(input, '32');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith(32);
  });
});
