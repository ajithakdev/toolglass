import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider, useToast } from '../../../src/components/ui/Toast';

function ToastTrigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.push('Success message', 'success')}>Trigger Success</button>
      <button onClick={() => toast.push('Error message', 'error')}>Trigger Error</button>
      <button onClick={() => toast.push('Info message', 'info')}>Trigger Info</button>
      <button onClick={() => toast.push('Updated message', 'info', 999)}>Update Toast</button>
    </div>
  );
}

describe('Toast and ToastProvider', () => {
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

  function renderToaster() {
    act(() => {
      root.render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );
    });
  }

  it('renders success, error, and info toasts', () => {
    renderToaster();

    const buttons = Array.from(container.querySelectorAll('button'));
    const successBtn = buttons.find((b) => b.textContent === 'Trigger Success')!;
    const errorBtn = buttons.find((b) => b.textContent === 'Trigger Error')!;
    const infoBtn = buttons.find((b) => b.textContent === 'Trigger Info')!;

    act(() => {
      successBtn.click();
      errorBtn.click();
      infoBtn.click();
    });

    expect(container.textContent).toContain('Success message');
    expect(container.textContent).toContain('Error message');
    expect(container.textContent).toContain('Info message');
  });

  it('updates an existing toast with same id', () => {
    renderToaster();

    const updateBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Update Toast'
    )!;

    act(() => {
      updateBtn.click();
    });
    expect(container.textContent).toContain('Updated message');
  });

  it('auto-dismisses toasts after timer completes', async () => {
    renderToaster();

    const successBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Trigger Success'
    )!;

    act(() => {
      successBtn.click();
    });
    expect(container.textContent).toContain('Success message');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 3100));
    });

    expect(container.textContent).not.toContain('Success message');
  });

  it('throws error when useToast is used outside of ToastProvider', () => {
    function BrokenComponent() {
      useToast();
      return null;
    }

    expect(() => {
      act(() => {
        root.render(<BrokenComponent />);
      });
    }).toThrow('useToast must be used within ToastProvider');
  });
});
