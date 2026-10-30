import { describe, expect, it } from 'vitest';
import { jsonToTs } from './jsonToTs';

describe('jsonToTs', () => {
  it('names a nested object', () => {
    const result = jsonToTs('{ "user": { "id": 1, "name": "Ada" } }', 'Root', true);
    expect(result).toContain('export interface User {\n  id: number;\n  name: string;\n}');
    expect(result).toContain('export interface Root {\n  user: User;\n}');
  });

  it('unions mixed array items, including null', () => {
    const result = jsonToTs('{ "values": [1, "a", null] }', 'Root', true);
    expect(result).toContain('values: (number | string | null)[];');
  });

  it('keeps a null property as null', () => {
    const result = jsonToTs('{ "note": null }', 'Root', true);
    expect(result).toContain('note: null;');
  });

  it('suffixes a duplicate interface name', () => {
    const result = jsonToTs('{ "user": { "id": 1 }, "User": { "name": "Ada" } }', 'Root', true);
    expect(result).toContain('export interface User {');
    expect(result).toContain('export interface User2 {');
    expect(result).toContain('user: User;');
    expect(result).toContain('User: User2;');
  });
});
