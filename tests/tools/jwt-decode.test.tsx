import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JwtDecodeTool from '../../src/tools/jwt-decode/JwtDecodeTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('JwtDecodeTool Component & Validation', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const VALID_FUTURE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';

  const EXPIRED_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjN9.signature';

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
        <MemoryRouter initialEntries={['/tools/jwt-decode']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<JwtDecodeTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  function setInput(val: string) {
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textarea, val);
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  it('renders empty without decoding initially', () => {
    renderTool();
    expect(container.querySelectorAll('output')).toHaveLength(0);
  });

  it('decodes a valid JWT with future expiration and displays VALID badge', () => {
    renderTool();
    setInput(VALID_FUTURE_JWT);

    const outputs = Array.from(container.querySelectorAll('output'));
    expect(outputs).toHaveLength(2);

    // Header output
    expect(outputs[0].textContent).toContain('HS256');
    // Payload output
    expect(outputs[1].textContent).toContain('John Doe');

    // Check expiration badge
    expect(container.textContent).toContain('VALID');
    expect(container.textContent).not.toContain('EXPIRED');
  });

  it('decodes an expired JWT and displays EXPIRED badge', () => {
    renderTool();
    setInput(EXPIRED_JWT);

    const outputs = Array.from(container.querySelectorAll('output'));
    expect(outputs).toHaveLength(2);
    expect(outputs[1].textContent).toContain('John Doe');

    expect(container.textContent).toContain('EXPIRED');
  });

  it('displays error message on malformed JWT string', () => {
    renderTool();
    setInput('not.a-valid-jwt');

    expect(container.textContent).toContain('Invalid JWT format (must have 3 parts separated by dots)');
    expect(container.querySelectorAll('output')).toHaveLength(0);
  });
});
