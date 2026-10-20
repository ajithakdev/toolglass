import { describe, expect, it } from 'vitest';
import { formatSql } from './sqlFormat';

describe('formatSql', () => {
  it('lays out a simple select', () => {
    expect(formatSql("select id, name from users where active = 1 and role = 'admin' order by name")).toBe(
      ["SELECT", "  id,", "  name", "FROM", "  users", "WHERE", "  active = 1", "  AND role = 'admin'", "ORDER BY", "  name"].join('\n'),
    );
  });

  it('keeps strings, quoted names, and comments as written', () => {
    const out = formatSql('select "from", \'select x from y\' -- where?\nfrom t');
    expect(out).toContain('"from"');
    expect(out).toContain("'select x from y'");
    expect(out).toContain('-- where?');
  });

  it('keeps function calls on one line', () => {
    expect(formatSql('select count(*), coalesce(a, b) from t')).toBe('SELECT\n  count(*),\n  coalesce(a, b)\nFROM\n  t');
  });

  it('indents subqueries and joins', () => {
    expect(formatSql('select * from a left join b on a.id = b.id where a.x in (select x from c)')).toBe(
      ['SELECT', '  *', 'FROM', '  a', 'LEFT JOIN b ON a.id = b.id', 'WHERE', '  a.x IN (', '    SELECT', '      x', '    FROM', '      c', '  )'].join('\n'),
    );
  });

  it('does not split BETWEEN ... AND', () => {
    expect(formatSql('select a from t where x between 1 and 5')).toContain('x BETWEEN 1 AND 5');
  });

  it('separates statements', () => {
    expect(formatSql('select 1; select 2;')).toBe('SELECT\n  1;\n\nSELECT\n  2;');
  });

  it('is stable when run twice', () => {
    const once = formatSql('insert into t (a, b) values (1, 2) returning a');
    expect(formatSql(once)).toBe(once);
  });

  it('can lowercase or keep keyword case', () => {
    expect(formatSql('SELECT a FROM t', '  ', 'lower')).toBe('select\n  a\nfrom\n  t');
    expect(formatSql('Select a From t', '  ', 'keep')).toBe('Select\n  a\nFrom\n  t');
  });
});
