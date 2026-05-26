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
  sm: { padding: '6px 12px', fontSize: 13, borderRadius: 10 },
  md: { padding: '10px 18px', fontSize: 14, borderRadius: 12 },
  lg: { padding: '14px 22px', fontSize: 15, borderRadius: 14 },
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
          background:
            'linear-gradient(135deg, #a78bfa 0%, #f0abfc 50%, #fda4af 100%)',
          color: '#1b1140',
          fontWeight: 600,
          boxShadow:
            '0 6px 20px -8px rgba(167, 139, 250, 0.7), inset 0 1px 0 rgba(255,255,255,0.6)',
        }
      : variant === 'soft'
        ? {
            background: 'rgba(255,255,255,0.6)',
            color: 'var(--ink)',
            fontWeight: 500,
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(14px)',
          }
        : {
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontWeight: 500,
          };

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
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
        ...style,
      }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
