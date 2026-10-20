import { describe, expect, it } from 'vitest';
import { isoWithOffset, rfc2822 } from './timestamp';

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
