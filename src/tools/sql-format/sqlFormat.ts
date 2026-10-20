const KEYWORDS = new Set(
  'select from where and or not in is null like between exists as on join left right inner outer full cross natural group by order having limit offset union all distinct insert into values update set delete create table alter drop add column primary key foreign references index view if case when then else end asc desc with returning default unique check constraint true false fetch first next rows only over partition window interval cast using except intersect'.split(' '),
);
/** Start a new line at the block's indent, then indent what follows. */
const CLAUSES = new Set(['SELECT', 'SELECT DISTINCT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH', 'RETURNING', 'WINDOW']);
const JOIN_WORDS = new Set(['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'NATURAL']);
const PAIRS: Record<string, string> = { GROUP: 'BY', ORDER: 'BY', INSERT: 'INTO', DELETE: 'FROM', UNION: 'ALL', SELECT: 'DISTINCT', PARTITION: 'BY' };

type Tok = { t: 'str' | 'comment' | 'word' | 'punct' | 'space'; v: string };

function tokenize(sql: string): Tok[] {
  const re = /('(?:[^']|'')*'?|"(?:[^"]|"")*"?|`[^`]*`?|\[[^\]]*\]?)|(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|([A-Za-z_][\w$]*|\d+(?:\.\d+)?|@\w+|:\w+|\$\d+)|(\s+)|(<>|<=|>=|!=|::|\|\||.)/g;
  const out: Tok[] = [];
  for (const m of sql.matchAll(re)) {
    if (m[1]) out.push({ t: 'str', v: m[1] });
    else if (m[2]) out.push({ t: 'comment', v: m[2] });
    else if (m[3]) out.push({ t: 'word', v: m[3] });
    else if (m[4]) out.push({ t: 'space', v: m[4] });
    else out.push({ t: 'punct', v: m[5]! });
  }
  return out;
}

/**
 * Basic SQL pretty-printer: uppercases keywords, puts clauses on their own lines, one column per line,
 * and indents subqueries. Strings, quoted names, and comments pass through untouched.
 * shortcut: no dialect-specific rules (procedures, CASE layout); swap in sql-formatter if people need them.
 */
export function formatSql(sql: string, indent = '  ', keywordCase: 'upper' | 'lower' | 'keep' = 'upper'): string {
  const toks = tokenize(sql).filter((t) => t.t !== 'space');
  const lines: string[] = [];
  let line = '';
  // One frame per open paren; subquery frames add an indent level, function-call frames don't
  const stack: { sub: boolean; base: number }[] = [];
  let base = 0;
  const pad = (n: number) => indent.repeat(n);
  const newline = (level: number) => {
    if (line.trim()) lines.push(line.trimEnd());
    line = pad(level);
  };
  const emit = (s: string) => {
    const last = line.at(-1);
    const glue = !line.trim() || last === '(' || last === '.' || s === ',' || s === ')' || s === '.' || s === ';' || s === '::' || last === ':' ;
    line += (glue ? '' : ' ') + s;
  };
  const inFunction = () => stack.length > 0 && !stack.at(-1)!.sub;

  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i]!;
    if (tok.t === 'comment') {
      if (tok.v.startsWith('--')) {
        emit(tok.v);
        newline(base + 1);
      } else emit(tok.v);
      continue;
    }
    if (tok.t !== 'word' && tok.t !== 'punct') {
      emit(tok.v);
      continue;
    }
    let up = tok.v.toUpperCase();
    const kw = (word: string, orig: string) => (keywordCase === 'upper' ? word : keywordCase === 'lower' ? word.toLowerCase() : orig);
    const isKw = tok.t === 'word' && KEYWORDS.has(tok.v.toLowerCase());
    const prevIsDot = toks[i - 1]?.v === '.';
    if (!isKw || prevIsDot) {
      if (tok.v === '(') {
        const sub = toks[i + 1]?.t === 'word' && ['SELECT', 'WITH'].includes(toks[i + 1]!.v.toUpperCase());
        // Function calls hug their name: COUNT(*), not COUNT (*)
        const call = toks[i - 1]?.t === 'word' && !KEYWORDS.has(toks[i - 1]!.v.toLowerCase());
        if (call) line += '(';
        else emit('(');
        stack.push({ sub, base });
        // Clause content sits at base+1, so the subquery's own clauses go one deeper
        if (sub) base += 2;
      } else if (tok.v === ')') {
        const frame = stack.pop();
        if (frame?.sub) {
          base = frame.base;
          newline(base + 1);
        }
        emit(')');
      } else if (tok.v === ',') {
        emit(',');
        if (!inFunction()) newline(base + 1);
      } else if (tok.v === ';') {
        emit(';');
        newline(0);
        lines.push('');
        base = 0;
      } else emit(tok.v);
      continue;
    }
    // Merge two-word keywords
    const next = toks[i + 1]?.v.toUpperCase();
    let orig = tok.v;
    if (PAIRS[up] === next) {
      up += ` ${next}`;
      orig += ` ${toks[i + 1]!.v}`;
      i++;
    }
    if (JOIN_WORDS.has(up) || up === 'JOIN') {
      while (toks[i + 1] && (JOIN_WORDS.has(toks[i + 1]!.v.toUpperCase()) || toks[i + 1]!.v.toUpperCase() === 'JOIN')) {
        up += ` ${toks[i + 1]!.v.toUpperCase()}`;
        orig += ` ${toks[++i]!.v}`;
      }
      if (up.endsWith('JOIN')) {
        newline(base);
        emit(kw(up, orig));
        continue;
      }
    }
    if (CLAUSES.has(up) && !inFunction()) {
      newline(base);
      emit(kw(up, orig));
      newline(base + 1);
    } else if ((up === 'AND' || up === 'OR') && !inFunction() && !/\bBETWEEN\s+\S+$/i.test(line)) {
      newline(base + 1);
      emit(kw(up, orig));
    } else emit(kw(up, orig));
  }
  newline(0);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
