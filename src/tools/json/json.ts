/** Line and column (1-based) of a JSON.parse error, read from the engine's message. */
export function errorLocation(input: string, message: string): { line: number; column: number } | null {
  // Firefox and newer V8 give line/column directly
  const lc = /line (\d+) column (\d+)/.exec(message);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  const pos = /position (\d+)/.exec(message);
  const offset = pos ? Number(pos[1]) : /end of (JSON|data)/i.test(message) ? input.length : -1;
  if (offset < 0) return null;
  const before = input.slice(0, offset).split('\n');
  return { line: before.length, column: before[before.length - 1]!.length + 1 };
}

type Schema = {
  type?: string | string[];
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
  items?: Schema;
  enum?: unknown[];
  const?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
};

function typeOf(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number' && Number.isInteger(v)) return 'integer';
  return typeof v;
}

/**
 * Validate a value against a JSON Schema. Returns error strings like "$.a: expected string".
 * shortcut: covers the common keywords only (no $ref, allOf/anyOf/oneOf, formats); switch to ajv if users need full drafts.
 */
export function validateSchema(value: unknown, schema: Schema, path = '$'): string[] {
  const errs: string[] = [];
  const t = typeOf(value);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const ok = types.some((s) => s === t || (s === 'number' && t === 'integer'));
    if (!ok) return [`${path}: expected ${types.join(' or ')}, got ${t}`];
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value)))
    errs.push(`${path}: must be one of ${JSON.stringify(schema.enum)}`);
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(value))
    errs.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errs.push(`${path}: must be >= ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errs.push(`${path}: must be <= ${schema.maximum}`);
  }
  if (typeof value === 'string') {
    const len = [...value].length;
    if (schema.minLength !== undefined && len < schema.minLength) errs.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && len > schema.maxLength) errs.push(`${path}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errs.push(`${path}: does not match /${schema.pattern}/`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errs.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errs.push(`${path}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => errs.push(...validateSchema(v, schema.items!, `${path}[${i}]`)));
  }
  if (t === 'object') {
    const obj = value as Record<string, unknown>;
    for (const k of schema.required ?? []) if (!(k in obj)) errs.push(`${path}: missing required "${k}"`);
    for (const [k, v] of Object.entries(obj)) {
      const sub = schema.properties?.[k];
      if (sub) errs.push(...validateSchema(v, sub, `${path}.${k}`));
      else if (schema.additionalProperties === false) errs.push(`${path}: unexpected property "${k}"`);
      else if (typeof schema.additionalProperties === 'object') errs.push(...validateSchema(v, schema.additionalProperties, `${path}.${k}`));
    }
  }
  return errs;
}
