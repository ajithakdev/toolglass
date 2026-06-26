import { AnimatePresence, motion } from 'framer-motion';
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
}

export function CopyButton({ value, label = 'Copy', size = 'md', disabled }: Props) {
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

  return (
    <Button onClick={onClick} variant="soft" size={size} disabled={disabled || !value}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            ✓ Copied!
          </motion.span>
        ) : (
          <motion.span
            key="lbl"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
