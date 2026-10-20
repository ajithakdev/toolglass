import { describe, expect, it } from 'vitest';
import { convert, formatNumber, UNITS } from './units';

describe('convert', () => {
  it('converts length', () => {
    expect(formatNumber(convert('Length', 'mi', 'km', 1))).toBe('1.609344');
    expect(formatNumber(convert('Length', 'ft', 'in', 1))).toBe('12');
  });

  it('converts temperature through kelvin', () => {
    expect(formatNumber(convert('Temperature', 'C', 'F', 100))).toBe('212');
    expect(formatNumber(convert('Temperature', 'F', 'C', -40))).toBe('-40');
    expect(formatNumber(convert('Temperature', 'K', 'C', 0))).toBe('-273.15');
  });

  it('tells decimal and binary storage units apart', () => {
    expect(convert('Digital storage', 'GiB', 'GB', 1)).toBeCloseTo(1.073741824);
  });

  it('round-trips every unit', () => {
    for (const [cat, units] of Object.entries(UNITS))
      for (const u of Object.keys(units)) expect(convert(cat, u, Object.keys(units)[0]!, convert(cat, Object.keys(units)[0]!, u, 42))).toBeCloseTo(42, 8);
  });
});

describe('formatNumber', () => {
  it('hides float noise', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(NaN)).toBe('');
  });
});
