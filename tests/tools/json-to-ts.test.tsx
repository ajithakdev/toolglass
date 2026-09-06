import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JsonToTsTool from '../../src/tools/json-to-ts/JsonToTsTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('JsonToTsTool Component & Type Generation', () => {
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

  function renderTool() {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/json-to-ts']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<JsonToTsTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  function setJsonInput(val: string) {
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

  it('generates TypeScript interfaces for default JSON', () => {
    renderTool();

    const output = container.querySelector('output');
    expect(output).not.toBeNull();
    const content = output?.textContent || '';

    expect(content).toContain('export interface User {');
    expect(content).toContain('id: number;');
    expect(content).toContain('name: string;');
    expect(content).toContain('active: boolean;');
    expect(content).toContain('export interface Root {');
    expect(content).toContain('user: User;');
    expect(content).toContain('roles: string[];');
  });

  it('switches to "export type" when interface toggle is switched off', () => {
    renderTool();

    const toggle = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Use interface')
    );
    expect(toggle).toBeDefined();

    act(() => {
      toggle?.click();
    });

    const output = container.querySelector('output');
    const content = output?.textContent || '';

    expect(content).toContain('export type User = {');
    expect(content).toContain('export type Root = {');
    expect(content).not.toContain('export interface');
  });

  it('handles invalid JSON with an error message and hides output', () => {
    renderTool();

    setJsonInput('{"broken": json');

    expect(container.textContent).toContain('Invalid JSON:');
    expect(container.querySelector('output')).toBeNull();
  });
});
