export type Target = 'zod' | 'valibot';

const LIB = {
  zod: {
    string: 'z.string()', int: 'z.number().int()', number: 'z.number()', boolean: 'z.boolean()', null: 'z.null()', unknown: 'z.unknown()',
    array: (x: string) => `z.array(${x})`, object: (body: string) => `z.object(${body})`, union: (xs: string[]) => `z.union([${xs.join(', ')}])`,
    nullable: (x: string) => `${x}.nullable()`, optional: (x: string) => `${x}.optional()`,
    head: "import { z } from 'zod';", infer: (n: string) => `z.infer<typeof ${n}>`,
  },
  valibot: {
    string: 'v.string()', int: 'v.pipe(v.number(), v.integer())', number: 'v.number()', boolean: 'v.boolean()', null: 'v.null()', unknown: 'v.unknown()',
    array: (x: string) => `v.array(${x})`, object: (body: string) => `v.object(${body})`, union: (xs: string[]) => `v.union([${xs.join(', ')}])`,
    nullable: (x: string) => `v.nullable(${x})`, optional: (x: string) => `v.optional(${x})`,
    head: "import * as v from 'valibot';", infer: (n: string) => `v.InferOutput<typeof ${n}>`,
  },
};
type Lib = (typeof LIB)['zod'];

const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

/** Merge the shapes of several values into one schema string. */
function schemaFor(values: unknown[], depth: number, L: Lib): string {
  const pad = '  '.repeat(depth);
  const kinds = new Map<string, unknown[]>();
  for (const v of values) {
    const kind = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
    if (!kinds.has(kind)) kinds.set(kind, []);
    kinds.get(kind)!.push(v);
  }
  const nullable = kinds.delete('null');
  const parts = [...kinds].map(([kind, vs]) => {
    if (kind === 'string') return L.string;
    if (kind === 'number') return vs.every((v) => Number.isInteger(v)) ? L.int : L.number;
    if (kind === 'boolean') return L.boolean;
    if (kind === 'array') {
      const items = (vs as unknown[][]).flat();
      return L.array(items.length ? schemaFor(items, depth, L) : L.unknown);
    }
    if (kind === 'object') {
      const objs = vs as Record<string, unknown>[];
      const keys = [...new Set(objs.flatMap(Object.keys))];
      if (!keys.length) return L.object('{}');
      const fields = keys.map((k) => {
        const present = objs.filter((o) => k in o).map((o) => o[k]);
        const s = schemaFor(present, depth + 1, L);
        return `${pad}  ${key(k)}: ${present.length < objs.length ? L.optional(s) : s},`;
      });
      return L.object(`{\n${fields.join('\n')}\n${pad}}`);
    }
    return L.unknown;
  });
  const base = parts.length === 0 ? L.null : parts.length === 1 ? parts[0]! : L.union(parts);
  return nullable && parts.length ? L.nullable(base) : base;
}

/** Zod or Valibot schema source for a JSON value. Keys missing from some array items become optional. */
export function jsonToZod(value: unknown, name = 'Schema', target: Target = 'zod'): string {
  const L = LIB[target];
  const n = /^[A-Za-z_$][\w$]*$/.test(name) ? name : 'Schema';
  return `${L.head}\n\nexport const ${n} = ${schemaFor([value], 0, L)};\n\nexport type ${n} = ${L.infer(n)};\n`;
}
