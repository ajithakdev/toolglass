import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Inline images only: a remote <img> in pasted Markdown (e.g. a tracking pixel) would make the page phone home
const isInline = (url: string) => /^(data|blob):/i.test(url.trim());

/** Markdown to sanitized HTML. `keepRemoteImages` is for exports, which the user opens outside Toolglass. */
export function renderMarkdown(markdown: string, keepRemoteImages = false): string {
  if (!keepRemoteImages) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'IMG' && !isInline(node.getAttribute('src') ?? '')) {
        node.setAttribute('alt', `${node.getAttribute('alt') || 'Image'} (remote image not loaded)`);
        node.removeAttribute('src');
      }
      node.removeAttribute('srcset');
    });
  }
  try {
    return DOMPurify.sanitize(marked.parse(markdown) as string);
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes');
  }
}
