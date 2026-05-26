import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CopyButton } from './CopyButton';

export function Output({
  value,
  multiline,
  placeholder = 'Output will appear here',
  trailing,
}: {
  value: string;
  multiline?: boolean;
  placeholder?: string;
  trailing?: ReactNode;
}) {
  return (
    <div
      className="glass-strong"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: multiline ? 'column' : 'row',
        gap: 12,
        alignItems: multiline ? 'stretch' : 'center',
      }}
    >
      <motion.div
        key={value || 'empty'}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="mono"
        style={{
          flex: 1,
          fontSize: 14,
          color: value ? 'var(--ink)' : 'var(--ink-mute)',
          wordBreak: 'break-all',
          whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
          overflow: multiline ? 'auto' : 'hidden',
          textOverflow: 'ellipsis',
          maxHeight: multiline ? 360 : undefined,
          padding: multiline ? 4 : 0,
        }}
      >
        {value || placeholder}
      </motion.div>
      <div style={{ display: 'flex', gap: 8, alignSelf: multiline ? 'flex-end' : 'auto' }}>
        {trailing}
        <CopyButton value={value} />
      </div>
    </div>
  );
}
