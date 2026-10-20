import { describe, expect, it } from 'vitest';
import { formatDuration } from './timer';

describe('formatDuration', () => {
  it('formats minutes, seconds, and hundredths', () => expect(formatDuration(83_456)).toBe('01:23.45'));
  it('adds hours when needed', () => expect(formatDuration(3_723_450)).toBe('1:02:03.45'));
  it('can drop hundredths', () => expect(formatDuration(1_500_000, false)).toBe('25:00'));
  it('clamps negatives to zero', () => expect(formatDuration(-5)).toBe('00:00.00'));
});
