import { describe, it, expect } from 'vitest';
import { getJsonLeafPaths, getNestedValue, parseCurl } from './curl';

describe('parseCurl', () => {
  it('returns null for anything that is not a curl command', () => {
    expect(parseCurl('wget https://x.dev')).toBeNull();
  });

  it('reads method, headers, body, and url', () => {
    const r = parseCurl(`curl -X put https://api.dev/u/1 -H 'Content-Type: application/json' -H "X-Id: a:b" -d '{"a":1}'`)!;
    expect(r.url).toBe('https://api.dev/u/1');
    expect(r.fetchOptions.method).toBe('PUT');
    expect(r.fetchOptions.headers).toEqual({ 'Content-Type': 'application/json', 'X-Id': 'a:b' });
    expect(r.fetchOptions.body).toBe('{"a":1}');
  });

  it('switches GET to POST when a body is given', () => {
    expect(parseCurl('curl https://a.dev --data x=1')!.fetchOptions.method).toBe('POST');
  });

  it('turns -u into a Basic auth header', () => {
    expect(parseCurl('curl -u user:pass https://a.dev')!.fetchOptions.headers.Authorization).toBe(`Basic ${btoa('user:pass')}`);
  });

  it('joins backslash line continuations', () => {
    expect(parseCurl('curl \\\n  https://a.dev \\\n  -X DELETE')!.fetchOptions.method).toBe('DELETE');
  });

  it('does not crash on a flag with no value', () => {
    expect(parseCurl('curl https://a.dev -X')!.fetchOptions.method).toBe('GET');
    expect(() => parseCurl('curl https://a.dev -H')).not.toThrow();
  });
});

describe('JSON path helpers', () => {
  const data = { user: { id: 7, tags: ['a'], token: 't' }, list: [{ n: 1 }] };

  it('reads nested values as strings', () => {
    expect(getNestedValue(data, 'user.token')).toBe('t');
    expect(getNestedValue(data, 'user.id')).toBe('7');
    expect(getNestedValue(data, 'user.tags')).toBe('["a"]');
    expect(getNestedValue(data, 'user.missing')).toBeNull();
    expect(getNestedValue(null, 'x')).toBeNull();
  });

  it('lists leaf paths, using the first array element', () => {
    expect(getJsonLeafPaths(data)).toEqual(['user.id', 'user.tags.0', 'user.token', 'list.0.n']);
  });
});
