import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/Toast';
import UuidTool from '../../src/tools/uuid/UuidTool';

// Configure act environment for React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('UuidTool Component & Generation Logic', () => {
  let container: HTMLDivElement;
  let root: Root;

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

  const renderTool = () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/tools/uuid']}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<UuidTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  };

  it('renders with default 5 UUIDs conforming strictly to RFC 4122 v4', () => {
    renderTool();

    const output = container.querySelector('output');
    expect(output).not.toBeNull();
    const text = output?.textContent || '';
    const uuids = text.trim().split('\n').filter(Boolean);
    expect(uuids).toHaveLength(5);

    for (const id of uuids) {
      expect(id).toMatch(UUID_V4_REGEX);
      // Version 4 check: character at index 14 must be '4'
      expect(id[14]).toBe('4');
      // Variant check: character at index 19 must be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(id[19].toLowerCase());
    }
  });

  it('generates unique UUIDs without collisions on regenerate', () => {
    renderTool();

    const set = new Set<string>();
    const regenBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Regenerate')
    );
    expect(regenBtn).toBeDefined();

    for (let i = 0; i < 5; i++) {
      act(() => {
        regenBtn?.click();
      });
      const output = container.querySelector('output');
      const lines = (output?.textContent || '').trim().split('\n').filter(Boolean);
      for (const line of lines) {
        set.add(line);
      }
    }

    // 5 generations of 5 UUIDs = 25 unique UUIDs
    expect(set.size).toBe(25);
  });

  it('resets count back to 5 when Reset is clicked', () => {
    renderTool();

    const resetBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Reset')
    );
    expect(resetBtn).toBeDefined();

    act(() => {
      resetBtn?.click();
    });

    const output = container.querySelector('output');
    const uuids = (output?.textContent || '').trim().split('\n').filter(Boolean);
    expect(uuids).toHaveLength(5);
  });
});
