import type { ToolInfo } from '../tools/catalog';

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/**
 * Ranks tools for a free-text query. Every word must match somewhere; title
 * hits outrank keyword hits, which outrank description hits. Empty query keeps
 * catalog order.
 */
export function searchTools<T extends ToolInfo>(tools: T[], query: string): T[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return tools;

  const scored: { tool: T; score: number }[] = [];
  for (const tool of tools) {
    const title = norm(tool.title);
    const keywords = tool.keywords.map(norm);
    const rest = norm(`${tool.short} ${tool.replaces ?? ''} ${tool.slug}`);
    const desc = norm(tool.description);
    let score = 0;
    let all = true;
    for (const w of words) {
      let best = 0;
      if (title.startsWith(w)) best = 10;
      else if (title.split(/\W+/).some((t) => t.startsWith(w))) best = 8;
      else if (title.includes(w)) best = 6;
      if (keywords.some((k) => k === w)) best = Math.max(best, 7);
      else if (keywords.some((k) => k.startsWith(w) || k.includes(` ${w}`))) best = Math.max(best, 5);
      if (!best && rest.includes(w)) best = 3;
      if (!best && desc.includes(w)) best = 1;
      if (!best) {
        all = false;
        break;
      }
      score += best;
    }
    if (all) scored.push({ tool, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.tool);
}
