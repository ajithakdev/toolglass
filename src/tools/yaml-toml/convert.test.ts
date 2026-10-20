import { describe, expect, it } from 'vitest';
import { convert, parse } from './convert';

const json = '{\n  "name": "toolglass",\n  "port": 8080,\n  "tags": [\n    "a",\n    "b"\n  ],\n  "db": {\n    "host": "localhost"\n  }\n}';

describe('convert', () => {
  it('round-trips JSON through YAML', () => expect(convert(convert(json, 'json', 'yaml'), 'yaml', 'json')).toBe(json));
  it('round-trips JSON through TOML', () => expect(convert(convert(json, 'json', 'toml'), 'toml', 'json')).toBe(json));
  it('writes readable YAML', () => expect(convert('{"a":[1,2]}', 'json', 'yaml')).toBe('a:\n  - 1\n  - 2\n'));
  it('rejects a top-level array for TOML', () => expect(() => convert('[1]', 'json', 'toml')).toThrow(/table/));
  it('does not run custom YAML tags', () => expect(() => parse('a: !!js/function "x"', 'yaml')).toThrow());
  it('reports YAML syntax errors', () => expect(() => parse('a: [1, 2', 'yaml')).toThrow());
});
