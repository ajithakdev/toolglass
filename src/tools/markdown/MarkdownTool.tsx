import { useState, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ToolLayout } from '../../components/ToolLayout';
import { useToolAction } from '../../hooks/useToolAction';
import { CopyButton } from '../../components/ui/CopyButton';

export default function MarkdownTool() {
  const recordAction = useToolAction();
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a **Markdown** preview.\n\n- Write markdown on the left\n- See HTML on the right\n\n```javascript\nconsole.log("Enjoy!");\n```');

  const { html, rawHtml } = useMemo(() => {
    try {
      const raw = marked.parse(markdown) as string;
      const sanitized = DOMPurify.sanitize(raw);
      return { html: sanitized, rawHtml: raw };
    } catch (e) {
      return { html: 'Error parsing markdown', rawHtml: '' };
    }
  }, [markdown]);

  useEffect(() => {
    if (markdown.trim().length > 0) recordAction();
  }, [markdown, recordAction]);

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write Markdown and instantly preview the rendered HTML."
      icon="📝"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
            Markdown Input
          </div>
          <textarea
            className="input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{ 
              fontFamily: 'var(--font-mono)', 
              minHeight: 400, 
              height: '100%', 
              resize: 'vertical' 
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
              HTML Preview
            </div>
            <CopyButton value={rawHtml} label="Copy HTML" size="sm" />
          </div>
          <div 
            className="glass"
            style={{ 
              padding: 16, 
              minHeight: 400, 
              height: '100%', 
              overflowY: 'auto' 
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
