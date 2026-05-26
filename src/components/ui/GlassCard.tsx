import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props extends HTMLMotionProps<'div'> {
  children: ReactNode;
  strong?: boolean;
  padding?: number | string;
}

export function GlassCard({ children, strong, padding = 24, className, style, ...rest }: Props) {
  return (
    <motion.div
      className={cn(strong ? 'glass-strong' : 'glass', className)}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
