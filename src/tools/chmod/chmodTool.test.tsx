import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChmodTool from './ChmodTool';
import { ToastProvider } from '../../components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ChmodTool Component', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
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

  function renderTool(route = '/tools/chmod') {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[route]}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<ChmodTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('renders default octal 755 and symbolic rwxr-xr-x', () => {
    renderTool();

    expect(container.textContent).toContain('Linux chmod Calculator');
    expect(container.textContent).toContain('rwxr-xr-x');
    expect(container.textContent).toContain('chmod 755 script.sh');
  });

  it('switches to preset when clicked', async () => {
    renderTool();

    const buttons = Array.from(container.querySelectorAll('button'));
    const preset600 = buttons.find((b) => b.textContent?.includes('600'));
    expect(preset600).toBeDefined();

    await act(async () => {
      preset600?.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('rw-------');
    expect(container.textContent).toContain('chmod 600 script.sh');
  });

  it('toggles permission checkboxes and updates outputs', async () => {
    renderTool();

    // Verify initial state (755, rwxr-xr-x)
    expect(container.textContent).toContain('755');
    expect(container.textContent).toContain('rwxr-xr-x');
    expect(container.textContent).toContain('chmod 755 script.sh');

    const checkboxes = Array.from(
      container.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
    const userReadCheckbox = checkboxes[0]; // User read

    // Uncheck User Read -> transforms 755 to 355 (-wxr-xr-x)
    await act(async () => {
      userReadCheckbox.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('355');
    expect(container.textContent).toContain('-wxr-xr-x');
    expect(container.textContent).toContain('chmod 355 script.sh');
    expect(container.textContent).toContain('u=wx,g=rx,o=rx');

    // Check User Read again -> restores 755 (rwxr-xr-x)
    await act(async () => {
      userReadCheckbox.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('755');
    expect(container.textContent).toContain('rwxr-xr-x');
    expect(container.textContent).toContain('chmod 755 script.sh');
  });

  it('loads and reflects permissions from URL parameters (?v=644)', () => {
    renderTool('/tools/chmod?v=644');

    expect(container.textContent).toContain('644');
    expect(container.textContent).toContain('rw-r--r--');
    expect(container.textContent).toContain('chmod 644 script.sh');
  });

  it('handles reverse lookup via octal text input', async () => {
    renderTool();

    const octalInput = container.querySelector(
      'input[aria-label="Octal permission value"]'
    ) as HTMLInputElement;
    expect(octalInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(octalInput, '777');
      octalInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('rwxrwxrwx');
  });

  it('resets to 755 on clicking reset', async () => {
    renderTool();

    // Click 644 first
    const buttons = Array.from(container.querySelectorAll('button'));
    const preset644 = buttons.find((b) => b.textContent?.includes('644'));
    await act(async () => {
      preset644?.click();
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(container.textContent).toContain('chmod 644 script.sh');

    // Click Reset
    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reset to 755')
    );
    await act(async () => {
      resetBtn?.click();
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain('chmod 755 script.sh');
  });

  it('allows intermediate editing in octal input and resets on blur if invalid', async () => {
    renderTool();

    const octalInput = container.querySelector(
      'input[aria-label="Octal permission value"]'
    ) as HTMLInputElement;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    // Type intermediate 2 digits: "75"
    await act(async () => {
      nativeSetter?.call(octalInput, '75');
      octalInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(octalInput.value).toBe('75');

    // Blur without completing 3rd digit -> resets to canonical octal
    await act(async () => {
      octalInput.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      octalInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(octalInput.value).toBe('755');
  });

  it('toggles between file and directory types for ls-style preview', async () => {
    renderTool();

    // Default is file with '-' prefix
    expect(container.textContent).toContain('-rwxr-xr-x');

    const dirButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Directory (d)')
    );
    expect(dirButton).toBeDefined();

    await act(async () => {
      dirButton?.click();
      await new Promise((r) => setTimeout(r, 20));
    });

    // Switches to 'd' prefix for directory
    expect(container.textContent).toContain('drwxr-xr-x');
  });

  it('escapes filenames with shell metacharacters in generated commands', async () => {
    renderTool();

    const filenameInput = container.querySelector(
      'input[aria-label="Target file name"]'
    ) as HTMLInputElement;
    expect(filenameInput).not.toBeNull();

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeSetter?.call(filenameInput, 'my script; rm -rf /');
      filenameInput.dispatchEvent(new Event('input', { bubbles: true }));
      filenameInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(container.textContent).toContain("chmod 755 'my script; rm -rf /'");
  });
});
