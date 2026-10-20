const NAMED: Record<string, string> = {
  '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos', ' ': 'nbsp', '©': 'copy', '®': 'reg', '™': 'trade',
  '€': 'euro', '£': 'pound', '¥': 'yen', '¢': 'cent', '§': 'sect', '°': 'deg', '±': 'plusmn', '×': 'times', '÷': 'divide',
  '…': 'hellip', '–': 'ndash', '—': 'mdash', '‘': 'lsquo', '’': 'rsquo', '“': 'ldquo', '”': 'rdquo', '•': 'bull',
  '→': 'rarr', '←': 'larr', '↑': 'uarr', '↓': 'darr', '½': 'frac12', '¼': 'frac14', '¾': 'frac34', 'µ': 'micro', '¶': 'para',
};

export type EntityStyle = 'named' | 'decimal' | 'hex';

/** Escape &, <, >, quotes, and (optionally) every non-ASCII character. */
export function encodeEntities(text: string, style: EntityStyle, nonAscii: boolean): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const special = '&<>"\''.includes(ch);
    if (!special && (!nonAscii || cp < 128)) out += ch;
    else if (style === 'named' && NAMED[ch]) out += `&${NAMED[ch]};`;
    else if (style === 'hex') out += `&#x${cp.toString(16).toUpperCase()};`;
    else out += `&#${cp};`;
  }
  return out;
}

/**
 * Decode every HTML entity the browser knows (all 2,000+ named ones).
 * A detached <textarea> parses its content as text, so tags in the input are never created or run.
 */
export function decodeEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}
