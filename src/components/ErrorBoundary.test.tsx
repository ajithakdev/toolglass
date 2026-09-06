import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

// Configure act environment for React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated tool rendering crash');
  }
  return <div data-testid="child-content">Normal Tool Content</div>;
}

describe('ErrorBoundary Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders children normally when no error occurs', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <ErrorBoundary toolTitle="Timestamp">
            <ProblemChild shouldThrow={false} />
          </ErrorBoundary>
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Normal Tool Content');
    expect(container.querySelector('[data-testid="child-content"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="error-boundary-card"]')).toBeNull();
  });

  it('catches render errors and displays the glassmorphic error fallback UI', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <ErrorBoundary toolTitle="Timestamp Converter">
            <ProblemChild shouldThrow={true} />
          </ErrorBoundary>
        </MemoryRouter>
      );
    });

    expect(container.querySelector('[data-testid="error-boundary-card"]')).not.toBeNull();
    expect(container.textContent).toContain('Timestamp Converter encountered an error');
    expect(container.textContent).toContain('Simulated tool rendering crash');
    expect(container.textContent).toContain('100% Client-Side Privacy');
  });

  it('renders custom fallback if provided', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <ErrorBoundary
            fallback={(error, reset) => (
              <div>
                <span>Custom: {error.message}</span>
                <button onClick={reset}>Custom Reset</button>
              </div>
            )}
          >
            <ProblemChild shouldThrow={true} />
          </ErrorBoundary>
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Custom: Simulated tool rendering crash');
    expect(container.textContent).toContain('Custom Reset');
  });

  it('allows recovery via Try Again reset button', () => {
    function StatefulWrapper() {
      const [hasError, setHasError] = useState(true);
      return (
        <MemoryRouter>
          <ErrorBoundary toolTitle="Test Tool" onReset={() => setHasError(false)}>
            <ProblemChild shouldThrow={hasError} />
          </ErrorBoundary>
        </MemoryRouter>
      );
    }

    act(() => {
      root.render(<StatefulWrapper />);
    });

    expect(container.textContent).toContain('Test Tool encountered an error');

    const tryAgainBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Try Again')
    );
    expect(tryAgainBtn).toBeDefined();

    act(() => {
      tryAgainBtn?.click();
    });

    expect(container.textContent).toContain('Normal Tool Content');
  });
});
