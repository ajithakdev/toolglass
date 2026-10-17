import { useState, useMemo, useEffect } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { useUrlState } from '../../hooks/useUrlState';
import {
  convertAllCases,
  detectCasing,
  extractWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toConstantCase,
  toKebabCase,
  toSlug,
  toTitleCase,
  toSentenceCase,
  toDotCase,
  toPathCase,
  type CaseResult,
} from './caseConverter';

const SAMPLES = [
  'user_profile_data',
  'APIResponseHandler',
  'fast-furious-tokyo-drift',
  'Café & Restaurant',
  'document.body.style',
];

const BATCH_TARGETS = [
  { label: 'camelCase', fn: (w: string[]) => toCamelCase(w) },
  { label: 'PascalCase', fn: (w: string[]) => toPascalCase(w) },
  { label: 'snake_case', fn: (w: string[]) => toSnakeCase(w) },
  { label: 'CONSTANT_CASE', fn: (w: string[]) => toConstantCase(w) },
  { label: 'kebab-case', fn: (w: string[]) => toKebabCase(w) },
  { label: 'URL Slug', fn: (_w: string[], raw: string) => toSlug(raw) },
  { label: 'Title Case', fn: (w: string[]) => toTitleCase(w) },
  { label: 'Sentence case', fn: (w: string[]) => toSentenceCase(w) },
  { label: 'dot.case', fn: (w: string[]) => toDotCase(w) },
  { label: 'path/case', fn: (w: string[]) => toPathCase(w) },
  { label: 'lowercase', fn: (_w: string[], raw: string) => raw.toLowerCase() },
  { label: 'UPPERCASE', fn: (_w: string[], raw: string) => raw.toUpperCase() },
];

export default function CaseConverterTool() {
  const [urlText, setUrlText] = useUrlState('t', 'hello_world_example', String, String);
  const [text, setTextInternal] = useState(urlText);
  const [isBatch, setIsBatch] = useState(false);
  const [batchTarget, setBatchTarget] = useState('camelCase');

  const setText = (val: string) => {
    setTextInternal(val);
    setUrlText(val);
  };

  useEffect(() => {
    setTextInternal(urlText);
  }, [urlText]);

  const detected = useMemo(() => detectCasing(text), [text]);
  const results: CaseResult[] = useMemo(() => convertAllCases(text), [text]);

  const batchOutput = useMemo(() => {
    if (!text) return '';
    const targetObj = BATCH_TARGETS.find((t) => t.label === batchTarget) || BATCH_TARGETS[0];
    return text
      .split('\n')
      .map((line) => {
        const words = extractWords(line);
        return targetObj.fn(words, line);
      })
      .join('\n');
  }, [text, batchTarget]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Controls row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Quick samples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}>Examples:</span>
            {SAMPLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setText(s)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--surface-nav-item)',
                  border: '1px solid var(--line)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setIsBatch(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: !isBatch ? 'rgba(139, 92, 246, 0.18)' : 'var(--surface-nav-item)',
                border: `1px solid ${!isBatch ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              All Formats
            </button>
            <button
              type="button"
              onClick={() => setIsBatch(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: isBatch ? 'rgba(139, 92, 246, 0.18)' : 'var(--surface-nav-item)',
                border: `1px solid ${isBatch ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              Batch Multi-Line
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to convert..."
            rows={isBatch ? 5 : 3}
            aria-label="Text input to convert"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--line)',
              background: 'var(--surface-input)',
              fontSize: 14,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
              outline: 'none',
              resize: 'vertical',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 11,
              color: 'var(--ink-mute)',
            }}
          >
            <span>
              Detected: <strong style={{ color: 'var(--accent)' }}>{detected}</strong> · {text.length} chars
            </span>
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-mute)',
                  cursor: 'pointer',
                  fontSize: 11,
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Single Mode: All Formats Grid */}
        {!isBatch ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {results.map((res) => (
              <div
                key={res.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'var(--surface-nav-item)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}>{res.name}</span>
                  <CopyButton value={res.value} label="Copy" size="sm" />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    wordBreak: 'break-all',
                    minHeight: 22,
                  }}
                >
                  {res.value || <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Batch Multi-Line Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Convert all lines to:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {BATCH_TARGETS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setBatchTarget(t.label)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      background: batchTarget === t.label ? 'rgba(139, 92, 246, 0.2)' : 'var(--surface-button-off)',
                      border: `1px solid ${batchTarget === t.label ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                readOnly
                value={batchOutput}
                placeholder="Converted multi-line output will appear here..."
                rows={6}
                aria-label="Batch converted output"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--line)',
                  background: 'var(--surface-input)',
                  fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  outline: 'none',
                }}
              />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <CopyButton value={batchOutput} label="Copy Output" size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => setText('hello_world_example')} variant="soft">
            Reset Sample
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
