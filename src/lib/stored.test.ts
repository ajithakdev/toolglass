import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STORED } from './stored';

describe('stored-data list', () => {
  it('covers every key in the CODEMAP storage table', () => {
    const codemap = readFileSync('docs/CODEMAP.md', 'utf8');
    const table = codemap.slice(codemap.indexOf('## Browser storage keys'), codemap.indexOf('## Global keyboard shortcuts'));
    const keys = [...table.matchAll(/^\| `([^`]+)` \| (local|session) \|/gm)].map((m) => [m[1], m[2]]);
    expect(keys.length).toBeGreaterThan(0);
    expect(STORED.map((s) => [s.key, s.session ? 'session' : 'local']).sort()).toEqual(keys.sort());
  });
});
