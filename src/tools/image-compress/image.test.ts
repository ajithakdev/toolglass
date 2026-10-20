import { describe, expect, it } from 'vitest';
import { fitSize, formatBytes, renameFor } from './image';

describe('fitSize', () => {
  it('keeps the size when there is no limit', () => expect(fitSize(4000, 3000, 0, 0)).toEqual({ width: 4000, height: 3000 }));
  it('scales to the tighter limit', () => {
    expect(fitSize(4000, 3000, 1920, 1920)).toEqual({ width: 1920, height: 1440 });
    expect(fitSize(3000, 4000, 1920, 1080)).toEqual({ width: 810, height: 1080 });
  });
  it('never upscales', () => expect(fitSize(800, 600, 1920, 0)).toEqual({ width: 800, height: 600 }));
});

describe('helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 ** 2)).toBe('3.00 MB');
  });
  it('renames for the new format', () => {
    expect(renameFor('holiday.photo.png', 'image/jpeg')).toBe('holiday.photo.jpg');
    expect(renameFor('a.jpeg', 'image/webp')).toBe('a.webp');
  });
});
