import { describe, it, expect } from 'vitest';
import { AUDIENCES, CATEGORIES, catalog } from './catalog';
import { tools } from './registry';

describe('tool registry', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = catalog.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every catalog entry an icon and a component', () => {
    for (const t of tools) {
      expect(t.icon, t.slug).toBeTruthy();
      expect(t.Component, t.slug).toBeTruthy();
    }
  });

  it('uses known categories and audiences, with keywords', () => {
    const cats = new Set(CATEGORIES.map((c) => c.id));
    const auds = new Set(AUDIENCES.map((a) => a.id));
    for (const t of catalog) {
      expect(cats.has(t.category), t.slug).toBe(true);
      expect(t.audience.length, t.slug).toBeGreaterThan(0);
      for (const a of t.audience) expect(auds.has(a), t.slug).toBe(true);
      expect(t.keywords.length, t.slug).toBeGreaterThan(0);
    }
  });
});
