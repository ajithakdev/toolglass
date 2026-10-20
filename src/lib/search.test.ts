import { describe, it, expect } from 'vitest';
import { catalog } from '../tools/catalog';
import { searchTools } from './search';

const slugs = (q: string) => searchTools(catalog, q).map((t) => t.slug);

describe('searchTools', () => {
  it('keeps catalog order for an empty query', () => {
    expect(slugs('  ')).toEqual(catalog.map((t) => t.slug));
  });

  it('puts title matches first', () => {
    expect(slugs('json')[0]).toBe('json');
    expect(slugs('pass')[0]).toBe('password');
  });

  it('finds tools by keyword and by what they replace', () => {
    expect(slugs('postman')).toContain('api-tester');
    expect(slugs('epoch')).toContain('timestamp');
    expect(slugs('sha256')).toContain('hash');
  });

  it('requires every word to match', () => {
    expect(slugs('json typescript')).toEqual(['json-to-ts', 'json-to-zod']);
    expect(slugs('json zzzz')).toEqual([]);
  });

  it('ignores case and accents', () => {
    expect(slugs('MÁRKDOWN')).toContain('markdown');
  });
});
