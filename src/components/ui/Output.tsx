import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { CopyButton } from './CopyButton';

export function Output({
  value,
  multiline,
  placeholder = 'Output will appear here',
  trailing,
  label,
}: {
  value: string;
  multiline?: boolean;
  placeholder?: string;
  trailing?: ReactNode;
  /** Accessible label for screen readers, e.g. "Generated password" */
  label?: string;
}) {
  return (
    <div
      className="output-box"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems: multiline ? 'flex-start' : 'center',
      }}
    >
      {/* aria-live so screen readers announce generated results */}
      <output
        role="status"
        aria-live="polite"
        aria-label={label}
        style={{ display: 'contents' }}
      >
        <m.div
          key={value || 'empty'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="mono"
          style={{
            flex: 1,
            fontSize: 'var(--t-sm)',
            color: value ? 'var(--ink)' : 'var(--ink-mute)',
            wordBreak: 'break-all',
            whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
            overflow: multiline ? 'auto' : 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: multiline ? 360 : undefined,
            minWidth: 0,
          }}
        >
          {value || placeholder}
        </m.div>
      </output>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {trailing}
        <CopyButton value={value} compact />
      </div>
    </div>
  );
}
