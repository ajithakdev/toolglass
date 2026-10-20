import { describe, expect, it } from 'vitest';
import { transformList, type ListOptions } from './list';

const base: ListOptions = { split: 'auto', join: 'comma-space', trim: true, dropEmpty: true, dedupe: 'none', sort: 'none' };

describe('transformList', () => {
  it('splits lines, trims, and drops blanks', () => expect(transformList(' a \n\n b\n', base)).toEqual({ output: 'a, b', count: 2 }));
  it('dedupes ignoring case, keeping the first', () => expect(transformList('A,b,a,B', { ...base, dedupe: 'ignore-case' }).output).toBe('A, b'));
  it('sorts naturally', () => expect(transformList('item10,item2,item1', { ...base, sort: 'asc' }).output).toBe('item1, item2, item10'));
  it('builds a safe SQL IN list', () => expect(transformList("o'neil,bob", { ...base, join: 'sql' }).output).toBe("IN ('o''neil', 'bob')"));
  it('builds a JSON array', () => expect(JSON.parse(transformList('x\ny', { ...base, join: 'json' }).output)).toEqual(['x', 'y']));
});
