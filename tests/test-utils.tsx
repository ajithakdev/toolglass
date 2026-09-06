import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../src/components/ui/Toast';
import type { ReactNode } from 'react';

export interface RenderResult {
  container: HTMLDivElement;
  root: Root;
  unmount: () => void;
}

export interface RenderOptions {
  route?: string;
  routePath?: string;
}

/**
 * Creates and renders a React tree wrapped in MemoryRouter and ToastProvider.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = '/', routePath = route }: RenderOptions = {}
): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <Routes>
            <Route path={routePath} element={ui} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );
  });

  return {
    container,
    root,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

/**
 * Simulates typing into an input or textarea using React's native setter.
 */
export async function simulateInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): Promise<void> {
  await act(async () => {
    const proto =
      element instanceof HTMLInputElement
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    nativeSetter?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/**
 * Awaitable timer wrapped in act() for animations and effects.
 */
export async function waitAct(ms = 50): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}
