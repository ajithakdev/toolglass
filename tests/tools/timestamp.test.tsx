import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TimestampTool from '../../src/tools/timestamp/TimestampTool';
import { ToastProvider } from '../../src/components/ui/Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('TimestampTool Component & Suite Features', () => {
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
    localStorage.clear();
  });

  function renderTool(initialEntry = '/tools/timestamp') {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[initialEntry]}>
          <ToastProvider>
            <Routes>
              <Route path="/tools/:slug" element={<TimestampTool />} />
            </Routes>
          </ToastProvider>
        </MemoryRouter>
      );
    });
  }

  it('converts epoch timestamp 1700000000 to correct ISO format in Convert tab', async () => {
    renderTool('/tools/timestamp?mode=convert&q=1700000000');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(container.textContent).toContain('2023-11-14T22:13:20.000Z');
    expect(container.textContent).toContain('1700000000');
  });

  it('renders Batch tab and parses embedded timestamps into structured rows', async () => {
    renderTool('/tools/timestamp?mode=batch&batch=1700000000%201700000060');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // The Batch tab is active (button text 'Batch' is visible)
    expect(container.textContent).toContain('Batch');
    expect(container.textContent).toContain('2023-11-14T22:13:20.000Z');
    expect(container.textContent).toContain('2023-11-14T22:14:20.000Z');
  });

  it('renders Diff tab and calculates duration range between two dates', async () => {
    renderTool('/tools/timestamp?mode=diff&diffMode=range&d1=2026-01-01&d2=2027-01-01');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(container.textContent).toContain('Duration Between Two Dates');
    // 365 days between 2026-01-01 and 2027-01-01
    expect(container.textContent).toContain('365');
    expect(container.textContent).toContain('days');
  });

  it('renders Cron tab and previews schedule and next 5 run times', async () => {
    renderTool('/tools/timestamp?mode=cron&cron=*%2F5%20*%20*%20*%20*');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(container.textContent).toContain('Cron Expression');
    expect(container.textContent).toContain('every 5 minutes');
    expect(container.textContent).toContain('Next 5 Scheduled Runs');
  });

  it('switches tabs smoothly when clicking mode buttons', async () => {
    renderTool('/tools/timestamp?mode=convert');

    const buttons = Array.from(container.querySelectorAll('button'));
    const cronBtn = buttons.find((b) => b.textContent?.trim() === 'Cron');
    expect(cronBtn).toBeDefined();

    await act(async () => {
      cronBtn?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(container.textContent).toContain('Cron Expression');
  });
});
