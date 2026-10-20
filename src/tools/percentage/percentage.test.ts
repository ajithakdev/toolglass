import { describe, expect, it } from 'vitest';
import { addPercent, percentChange, percentOf, whatPercent } from './percentage';

describe('percentage', () => {
  it('works out X% of Y', () => expect(percentOf(15, 200)).toBe(30));
  it('works out what percent X is of Y', () => expect(whatPercent(30, 200)).toBe(15));
  it('works out percent change both ways', () => {
    expect(percentChange(50, 75)).toBe(50);
    expect(percentChange(80, 60)).toBe(-25);
    expect(percentChange(-50, -25)).toBe(50);
  });
  it('adds or removes a percentage', () => {
    expect(addPercent(100, 18)).toBeCloseTo(118);
    expect(addPercent(100, -20)).toBe(80);
  });
  it('returns NaN instead of dividing by zero', () => {
    expect(whatPercent(1, 0)).toBeNaN();
    expect(percentChange(0, 5)).toBeNaN();
  });
});
