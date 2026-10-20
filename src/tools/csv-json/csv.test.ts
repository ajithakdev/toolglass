import { describe, expect, it } from 'vitest';
import { csvToObjects, detectType, objectsToCsv, parseCsv, sniffDelimiter, toSqlInsert } from './csv';

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, and newlines in fields', () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n"multi\nline",2\r\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['multi\nline', '2'],
    ]);
  });
  it('keeps empty fields', () => expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]));
  it('throws on an unclosed quote', () => expect(() => parseCsv('"abc')).toThrow());
  it('sniffs semicolons and tabs', () => {
    expect(sniffDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(sniffDelimiter('a\tb')).toBe('\t');
  });
});

describe('conversions', () => {
  it('round-trips CSV through objects', () => {
    const csv = 'name,note\nAda,"likes, commas"\nBob,"has ""quotes"""';
    expect(objectsToCsv(csvToObjects(csv))).toBe(csv);
  });
  it('writes nested values as JSON and fills missing columns', () => {
    expect(objectsToCsv([{ a: 1, b: { c: 2 } }, { a: 2, d: null }])).toBe('a,b,d\n1,"{""c"":2}",\n2,,');
  });
  it('builds a SQL INSERT with safe quoting', () => {
    expect(toSqlInsert('users', [{ id: '1', name: "O'Brien", zip: '02139', x: '' }])).toBe(
      'INSERT INTO "users" ("id", "name", "zip", "x") VALUES\n  (1, \'O\'\'Brien\', \'02139\', NULL);',
    );
  });

  it('detects types when asked', () => {
    expect(csvToObjects('a,b,c,d,e\n42,true,,007,1.5e3', undefined, true)).toEqual([{ a: 42, b: true, c: null, d: '007', e: 1500 }]);
    expect(detectType('12345678901234567890')).toBe('12345678901234567890');
  });
});
