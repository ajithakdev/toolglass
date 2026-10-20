import { describe, expect, it } from 'vitest';
import { jsonToZod } from './zod';

const body = (v: unknown) => jsonToZod(v).split('\n')[2]!.replace('export const Schema = ', '');

describe('jsonToZod', () => {
  it('maps primitives', () => {
    expect(body('x')).toBe('z.string();');
    expect(body(3)).toBe('z.number().int();');
    expect(body(1.5)).toBe('z.number();');
    expect(body(null)).toBe('z.null();');
    expect(body([])).toBe('z.array(z.unknown());');
  });

  it('marks keys missing from some items optional and merges nullables', () => {
    const out = jsonToZod([{ id: 1, tag: 'a' }, { id: 2, tag: null, extra: true }], 'Items');
    expect(out).toContain('export const Items = z.array(z.object({');
    expect(out).toContain('  id: z.number().int(),');
    expect(out).toContain('  tag: z.string().nullable(),');
    expect(out).toContain('  extra: z.boolean().optional(),');
    expect(out).toContain('export type Items = z.infer<typeof Items>;');
  });

  it('quotes keys that are not identifiers and makes unions', () => {
    const out = jsonToZod({ 'first-name': 'x', v: [1, 'a'] });
    expect(out).toContain('"first-name": z.string(),');
    expect(out).toContain('v: z.array(z.union([z.number().int(), z.string()])),');
  });

  it('falls back to a safe name', () => expect(jsonToZod(1, 'bad name')).toContain('export const Schema'));

  it('writes Valibot with wrapped modifiers', () => {
    const out = jsonToZod([{ id: 1, tag: 'a' }, { id: 2, tag: null, extra: true }], 'Items', 'valibot');
    expect(out).toContain("import * as v from 'valibot';");
    expect(out).toContain('  id: v.pipe(v.number(), v.integer()),');
    expect(out).toContain('  tag: v.nullable(v.string()),');
    expect(out).toContain('  extra: v.optional(v.boolean()),');
    expect(out).toContain('export type Items = v.InferOutput<typeof Items>;');
  });
});
