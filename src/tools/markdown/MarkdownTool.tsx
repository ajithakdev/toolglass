import { useState, useMemo, useEffect } from 'react';
import { TextArea } from '../../components/ui/Field';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ToolLayout } from '../../components/ToolLayout';
import { useToolAction } from '../../hooks/useToolAction';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/Button';

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Markdown Export</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #111; }
            pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
            code { font-family: monospace; }
            img { max-width: 100%; }
            blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 16px; color: #666; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadHtml = () => {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
              Markdown Input
            </div>
          </div>
          <TextArea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{ 
              fontFamily: 'var(--font-mono)', 
              minHeight: 500, 
              height: '100%', 
              resize: 'vertical' 
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
              HTML Preview
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={downloadHtml} variant="soft" size="sm">Download</Button>
              <Button onClick={handlePrint} variant="primary" size="sm">PDF / Print</Button>
              <CopyButton value={rawHtml} label="Copy HTML" size="sm" />
            </div>
          </div>
          <div 
            className="glass"
            style={{ 
              padding: '24px 32px', 
              minHeight: 500, 
              height: '100%', 
              overflowY: 'auto',
              background: 'var(--surface-icon-bg)'
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
