import { describe, expect, it } from 'vitest';
import { applyOffset, describeCron, getDurationDescription, getNextCronRuns, isoWithOffset, parseSmartDate, rfc2822 } from './timestamp';

const d = new Date('2025-01-01T00:00:00.000Z');

describe('timestamp formats', () => {
  it('formats ISO 8601 with a positive offset', () => {
    expect(isoWithOffset(d, 'Asia/Kolkata')).toBe('2025-01-01T05:30:00+05:30');
  });

  it('formats ISO 8601 with a negative offset across a date change', () => {
    expect(isoWithOffset(d, 'America/New_York')).toBe('2024-12-31T19:00:00-05:00');
  });

  it('uses +00:00 for UTC', () => {
    expect(isoWithOffset(d, 'UTC')).toBe('2025-01-01T00:00:00+00:00');
  });

  it('formats RFC 2822', () => {
    expect(rfc2822(d)).toBe('Wed, 01 Jan 2025 00:00:00 +0000');
  });
});

describe('cron next runs', () => {
  // Wednesday 1 Jan 2025, 10:00 local time
  const from = new Date(2025, 0, 1, 10, 0);
  const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  it('ORs day-of-month and day-of-week when both are set', () => {
    const runs = getNextCronRuns('0 0 1 * 1', 4, from).map(ymd);
    expect(runs).toEqual(['2025-1-6', '2025-1-13', '2025-1-20', '2025-1-27']);
    expect(getNextCronRuns('0 0 1 * 1', 5, from).map(ymd)).toContain('2025-2-1');
  });

  it('treats 7 as Sunday', () => {
    expect(getNextCronRuns('0 9 * * 7', 2, from).map((d) => [ymd(d), d.getDay(), d.getHours()])).toEqual([
      ['2025-1-5', 0, 9],
      ['2025-1-12', 0, 9],
    ]);
    expect(getNextCronRuns('0 0 * * 1-7', 7, from).map((d) => d.getDay()).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('finds yearly and leap-day schedules', () => {
    expect(getNextCronRuns('0 0 1 1 *', 1, from).map(ymd)).toEqual(['2026-1-1']);
    expect(getNextCronRuns('0 0 29 2 *', 2, from).map(ymd)).toEqual(['2028-2-29', '2032-2-29']);
  });

  it('starts after the current minute and keeps time order within a day', () => {
    expect(getNextCronRuns('*/30 10,11 * * *', 3, from).map((d) => `${d.getHours()}:${d.getMinutes()}`)).toEqual(['10:30', '11:0', '11:30']);
  });

  it('rejects malformed or out-of-range fields', () => {
    for (const bad of ['abc * * * *', '99 * * * *', '* 24 * * *', '* * 0 * *', '* * * 13 *', '* * * * 8', '*/0 * * * *', '5-1 * * * *', '* * * *', '* * * * * *']) {
      expect(getNextCronRuns(bad, 1, from), bad).toEqual([]);
      expect(describeCron(bad), bad).toBe('Invalid cron expression');
    }
    expect(describeCron('*/5 * * * *')).toMatch(/^Runs every 5 minutes/);
  });
});

describe('parseSmartDate', () => {
  it('treats a short number as unix seconds', () => {
    expect(parseSmartDate('1700000000')?.getTime()).toBe(1700000000000);
  });

  it('treats a 13-digit number as unix milliseconds', () => {
    expect(parseSmartDate('1700000000000')?.getTime()).toBe(1700000000000);
  });

  it('returns null for empty or unparseable input', () => {
    expect(parseSmartDate('')).toBeNull();
    expect(parseSmartDate('   ')).toBeNull();
    expect(parseSmartDate('not-a-date')).toBeNull();
  });
});

describe('applyOffset', () => {
  const base = new Date(2025, 0, 15, 12, 0, 0);

  it('adds years and months', () => {
    const next = applyOffset(base, '+1y2mo');
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(2);
    expect(next.getDate()).toBe(15);
  });

  it('subtracts days', () => {
    const next = applyOffset(base, '-3d');
    expect(next.getFullYear()).toBe(2025);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(12);
  });

  it('returns the same date when the offset does not match', () => {
    expect(applyOffset(base, 'nope')).toBe(base);
  });
});

describe('getDurationDescription', () => {
  it('breaks a duration into days, hours, minutes, and seconds', () => {
    expect(getDurationDescription(90_061_000)).toBe('1d 1h 1m 1s');
  });

  it('marks a negative duration as past', () => {
    expect(getDurationDescription(-90_061_000)).toBe('1d 1h 1m 1s ago');
  });

  it('uses 0s for an empty duration', () => {
    expect(getDurationDescription(0)).toBe('0s');
  });
});
