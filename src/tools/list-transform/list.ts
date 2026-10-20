export type Split = 'auto' | 'newline' | 'comma' | 'tab' | 'semicolon' | 'space';
export type Join = 'newline' | 'comma' | 'comma-space' | 'json' | 'sql' | 'quoted';
export interface ListOptions {
  split: Split;
  join: Join;
  trim: boolean;
  dropEmpty: boolean;
  dedupe: 'none' | 'exact' | 'ignore-case';
  sort: 'none' | 'asc' | 'desc' | 'reverse';
}

const SPLIT: Record<Exclude<Split, 'auto'>, RegExp> = { newline: /\r?\n/, comma: /,/, tab: /\t/, semicolon: /;/, space: /\s+/ };

export function splitItems(text: string, split: Split): string[] {
  const s = split === 'auto' ? (/\n/.test(text) ? 'newline' : text.includes('\t') ? 'tab' : text.includes(';') && !text.includes(',') ? 'semicolon' : 'comma') : split;
  return text.split(SPLIT[s]);
}

export function transformList(text: string, o: ListOptions): { output: string; count: number } {
  let items = splitItems(text, o.split);
  if (o.trim) items = items.map((s) => s.trim());
  if (o.dropEmpty) items = items.filter((s) => s !== '');
  if (o.dedupe !== 'none') {
    const seen = new Set<string>();
    items = items.filter((s) => {
      const k = o.dedupe === 'ignore-case' ? s.toLowerCase() : s;
      return seen.has(k) ? false : (seen.add(k), true);
    });
  }
  const cmp = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare;
  if (o.sort === 'asc') items.sort(cmp);
  if (o.sort === 'desc') items.sort((a, b) => cmp(b, a));
  if (o.sort === 'reverse') items.reverse();
  const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
  const output =
    o.join === 'newline' ? items.join('\n')
    : o.join === 'comma' ? items.join(',')
    : o.join === 'comma-space' ? items.join(', ')
    : o.join === 'json' ? JSON.stringify(items, null, 2)
    : o.join === 'sql' ? `IN (${items.map(q).join(', ')})`
    : items.map((s) => `"${s.replace(/"/g, '\\"')}"`).join(', ');
  return { output, count: items.length };
}
