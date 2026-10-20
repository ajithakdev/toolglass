/** Guess the delimiter from the first line: the most common of , ; tab |. */
export function sniffDelimiter(text: string): string {
  const first = text.split('\n', 1)[0] ?? '';
  let best = ',';
  let max = 0;
  for (const d of [',', ';', '\t', '|']) {
    const n = first.split(d).length - 1;
    if (n > max) [best, max] = [d, n];
  }
  return best;
}

/** RFC 4180 parser: quoted fields, "" escapes, and newlines inside quotes. */
export function parseCsv(text: string, delim = sniffDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delim) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Unclosed quote in CSV');
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

/** "42" -> 42, "true" -> true, "" -> null. Keeps leading-zero numbers (zip codes, IDs) and huge integers as strings. */
export function detectType(s: string): string | number | boolean | null {
  if (s === '') return null;
  if (s === 'true' || s === 'false') return s === 'true';
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isSafeInteger(n) || !Number.isInteger(n)) return n;
  }
  return s;
}

export function csvToObjects(text: string, delim?: string, types = false): Record<string, unknown>[] {
  const [header, ...body] = parseCsv(text, delim);
  if (!header) return [];
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, types ? detectType(r[i] ?? '') : (r[i] ?? '')])));
}

const cell = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

export function objectsToCsv(items: Record<string, unknown>[], delim = ','): string {
  const cols = [...new Set(items.flatMap((o) => Object.keys(o)))];
  const esc = (s: string) => (/[",\n\r]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s);
  return [cols.map(esc).join(delim), ...items.map((o) => cols.map((c) => esc(cell(o[c]))).join(delim))].join('\n');
}

const sqlIdent = (s: string) => `"${s.replace(/"/g, '""')}"`;
const sqlValue = (v: unknown) =>
  v === null || v === undefined || v === ''
    ? 'NULL'
    : typeof v === 'number' || typeof v === 'boolean'
      ? String(v)
      : /^-?\d+(\.\d+)?$/.test(String(v)) && !/^-?0\d/.test(String(v))
        ? String(v)
        : `'${cell(v).replace(/'/g, "''")}'`;

/** One multi-row INSERT. Numeric-looking strings stay unquoted, except ones with leading zeros (zip codes, IDs). */
export function toSqlInsert(table: string, items: Record<string, unknown>[]): string {
  if (!items.length) return '';
  const cols = [...new Set(items.flatMap((o) => Object.keys(o)))];
  const values = items.map((o) => `  (${cols.map((c) => sqlValue(o[c])).join(', ')})`).join(',\n');
  return `INSERT INTO ${sqlIdent(table || 'my_table')} (${cols.map(sqlIdent).join(', ')}) VALUES\n${values};`;
}
