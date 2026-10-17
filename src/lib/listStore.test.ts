import { describe, it, expect, beforeEach } from 'vitest';
import { createListStore } from './listStore';

describe('createListStore', () => {
  beforeEach(() => localStorage.clear());

  it('persists, dedupes, and caps the list', () => {
    const s = createListStore('t1', 3);
    s.set(['a', 'b', 'a', 'c', 'd']);
    expect(s.get()).toEqual(['a', 'b', 'c']);
    expect(JSON.parse(localStorage.getItem('t1')!)).toEqual(['a', 'b', 'c']);
  });

  it('ignores corrupt or non-string stored data', () => {
    localStorage.setItem('t2', '{"x":1}');
    expect(createListStore('t2').get()).toEqual([]);
    localStorage.setItem('t3', '["ok", 5, null]');
    expect(createListStore('t3').get()).toEqual(['ok']);
    localStorage.setItem('t4', 'not json');
    expect(createListStore('t4').get()).toEqual([]);
  });
});
