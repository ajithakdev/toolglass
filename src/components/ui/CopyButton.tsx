import { AnimatePresence, m } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useClipboard } from '../../hooks/useClipboard';
import { useToolStats } from '../../hooks/useToolStats';
import { useToast } from './Toast';
import { Button } from './Button';

interface Props {
  value: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Quiet icon button for result boxes. The label stays as the accessible name. */
  compact?: boolean;
}

export function CopyButton({ value, label = 'Copy', size = 'md', disabled, compact }: Props) {
  const { copy, copied } = useClipboard();
  const toast = useToast();
  const { slug } = useParams();
  const { increment } = useToolStats(slug || '');

  const onClick = async () => {
    if (!value) return;
    const ok = await copy(value);
    if (ok) increment();
    toast.push(ok ? 'Copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  if (compact) {
    const empty = disabled || !value;
    return (
      <button
        type="button"
        className="icon-btn"
        aria-label={copied ? 'Copied' : label}
        title={label}
        aria-disabled={empty || undefined}
        onClick={empty ? undefined : onClick}
        style={{ color: copied ? 'var(--status-success)' : undefined }}
      >
        {copied ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={1.9} />}
      </button>
    );
  }

  return (
    <Button onClick={onClick} variant="soft" size={size} disabled={disabled || !value}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <m.span
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} strokeWidth={2.4} /> Copied
            </span>
          </m.span>
        ) : (
          <m.span
            key="lbl"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </m.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
