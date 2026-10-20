import yaml from 'js-yaml';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

export type Format = 'json' | 'yaml' | 'toml';

export function parse(text: string, from: Format): unknown {
  if (from === 'json') return JSON.parse(text);
  // JSON_SCHEMA: no custom tags, so untrusted YAML cannot build odd objects
  if (from === 'yaml') return yaml.load(text, { schema: yaml.JSON_SCHEMA });
  return parseToml(text);
}

export function stringify(value: unknown, to: Format): string {
  if (to === 'json') return JSON.stringify(value, null, 2);
  if (to === 'yaml') return yaml.dump(value, { lineWidth: -1, noRefs: true });
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('TOML needs a table (key/value object) at the top level.');
  return stringifyToml(value as Record<string, unknown>);
}

export const convert = (text: string, from: Format, to: Format) => stringify(parse(text, from), to);
