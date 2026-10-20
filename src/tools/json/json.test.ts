import { describe, expect, it } from 'vitest';
import { errorLocation, validateSchema } from './json';

describe('errorLocation', () => {
  it('reads line and column from the message', () => {
    expect(errorLocation('', 'bad at line 3 column 7 of the JSON data')).toEqual({ line: 3, column: 7 });
  });

  it('converts a position to line and column', () => {
    expect(errorLocation('{\n  "a": }', 'Unexpected token } in JSON at position 9')).toEqual({ line: 2, column: 8 });
  });

  it('points at the end for truncated input', () => {
    expect(errorLocation('{"a":', 'Unexpected end of JSON input')).toEqual({ line: 1, column: 6 });
  });

  it('works with the real engine message', () => {
    const input = '{\n  "a": 1,\n}';
    let msg = '';
    try {
      JSON.parse(input);
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(errorLocation(input, msg)?.line).toBe(3);
  });

  it('returns null when the message has no location', () => {
    expect(errorLocation('x', 'something odd')).toBeNull();
  });
});

describe('validateSchema', () => {
  const schema = {
    type: 'object',
    required: ['id', 'name'],
    additionalProperties: false,
    properties: {
      id: { type: 'integer', minimum: 1 },
      name: { type: 'string', minLength: 1, pattern: '^[a-z]+$' },
      tags: { type: 'array', items: { enum: ['a', 'b'] }, maxItems: 2 },
    },
  };

  it('accepts a valid value', () => {
    expect(validateSchema({ id: 1, name: 'abc', tags: ['a'] }, schema)).toEqual([]);
  });

  it('reports every problem with its path', () => {
    const errs = validateSchema({ id: 0, name: 'ABC', tags: ['c', 'a', 'b'], extra: 1 }, schema);
    expect(errs).toEqual([
      '$.id: must be >= 1',
      '$.name: does not match /^[a-z]+$/',
      '$.tags: more than 2 items',
      '$.tags[0]: must be one of ["a","b"]',
      '$: unexpected property "extra"',
    ]);
  });

  it('reports missing required keys and wrong types', () => {
    expect(validateSchema({ id: 'x' }, schema)).toEqual(['$: missing required "name"', '$.id: expected integer, got string']);
  });

  it('treats integers as numbers', () => {
    expect(validateSchema(3, { type: 'number' })).toEqual([]);
    expect(validateSchema(3.5, { type: 'integer' })).toEqual(['$: expected integer, got number']);
  });
});
