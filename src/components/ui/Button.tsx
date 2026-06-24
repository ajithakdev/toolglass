import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 13, borderRadius: 10 },
  md: { padding: '10px 20px', fontSize: 14, borderRadius: 12 },
  lg: { padding: '14px 24px', fontSize: 15, borderRadius: 14 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full,
  className,
  style,
  ...rest
}: Props) {
  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.9) 0%, rgba(240, 171, 252, 0.9) 50%, rgba(253, 164, 175, 0.9) 100%)',
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 8px 30px -8px rgba(167, 139, 250, 0.6), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }
      : variant === 'soft'
        ? {
            background: 'var(--surface-button-off)',
            color: 'var(--ink)',
            fontWeight: 500,
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.4)',
          }
        : {
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontWeight: 500,
          };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(className)}
      style={{
        ...sizeStyles[size],
        ...variantStyle,
        width: full ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
