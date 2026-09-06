import { describe, it, expect } from 'vitest';
import { tools, toolBySlug } from '../../src/tools/registry';

describe('Tool Registry', () => {
  it('registers exactly 17 developer tools', () => {
    expect(tools).toHaveLength(17);
  });

  it('contains unique slugs for every registered tool', () => {
    const slugs = tools.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(tools.length);
  });

  it('ensures every tool has complete metadata and a lazy Component', () => {
    for (const tool of tools) {
      expect(tool.slug).toBeTruthy();
      expect(typeof tool.slug).toBe('string');
      expect(tool.title).toBeTruthy();
      expect(tool.short).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.icon).toBeDefined();
      expect(tool.tint).toMatch(/^linear-gradient/);
      expect(tool.Component).toBeDefined();
    }
  });

  it('resolves tool metadata correctly using toolBySlug', () => {
    const pwdTool = toolBySlug('password');
    expect(pwdTool).toBeDefined();
    expect(pwdTool?.title).toBe('Password Generator');

    const timestampTool = toolBySlug('timestamp');
    expect(timestampTool).toBeDefined();
    expect(timestampTool?.title).toBe('Timestamp');

    const apiTesterTool = toolBySlug('api-tester');
    expect(apiTesterTool).toBeDefined();
    expect(apiTesterTool?.title).toBe('API Tester');
  });

  it('returns undefined for non-existent slugs', () => {
    expect(toolBySlug('nonexistent-tool')).toBeUndefined();
    expect(toolBySlug('')).toBeUndefined();
  });
});
