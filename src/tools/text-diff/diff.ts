export type DiffLine = { type: 'same' | 'add' | 'del'; text: string };

/** Above this many cells the LCS table gets slow and big. */
export const MAX_CELLS = 25_000_000;

/**
 * Line diff from a longest-common-subsequence table.
 * shortcut: O(n*m) memory, capped at MAX_CELLS (about 5000 x 5000 lines); switch to Myers if people diff bigger files.
 */
export function diffLines(a: string, b: string): DiffLine[] | null {
  const x = a.split('\n');
  const y = b.split('\n');
  // Trim the common head and tail so typical edits stay far under the cap
  let start = 0;
  while (start < x.length && start < y.length && x[start] === y[start]) start++;
  let endX = x.length;
  let endY = y.length;
  while (endX > start && endY > start && x[endX - 1] === y[endY - 1]) {
    endX--;
    endY--;
  }
  const n = endX - start;
  const m = endY - start;
  if (n * m > MAX_CELLS) return null;

  const w = m + 1;
  const lcs = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i * w + j] = x[start + i] === y[start + j] ? lcs[(i + 1) * w + j + 1]! + 1 : Math.max(lcs[(i + 1) * w + j]!, lcs[i * w + j + 1]!);

  const out: DiffLine[] = x.slice(0, start).map((text) => ({ type: 'same', text }));
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[start + i] === y[start + j]) {
      out.push({ type: 'same', text: x[start + i]! });
      i++;
      j++;
    } else if (j < m && (i === n || lcs[i * w + j + 1]! >= lcs[(i + 1) * w + j]!)) {
      out.push({ type: 'add', text: y[start + j]! });
      j++;
    } else {
      out.push({ type: 'del', text: x[start + i]! });
      i++;
    }
  }
  for (const text of x.slice(endX)) out.push({ type: 'same', text });
  return out;
}
