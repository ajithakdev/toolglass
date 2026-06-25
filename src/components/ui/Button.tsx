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
  sm: { padding: '7px 16px', fontSize: 13, borderRadius: 10 },
  md: { padding: '10px 22px', fontSize: 14, borderRadius: 12 },
  lg: { padding: '14px 28px', fontSize: 15, borderRadius: 14 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full,
  className,
  style,
  disabled,
  ...rest
}: Props) {

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(16px) saturate(180%)',
          color: 'var(--accent)',
          fontWeight: 700,
          border: '1px solid var(--accent)',
          boxShadow: '0 0 12px -2px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.12)',
        }
      : variant === 'soft'
        ? {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            color: 'var(--ink)',
            fontWeight: 600,
            border: '1px solid var(--glass-border)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }
        : {
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontWeight: 500,
            border: '1px solid transparent',
            boxShadow: 'none',
          };

  return (
    <motion.button
      whileHover={disabled ? {} : { y: -1, boxShadow: variant === 'primary'
        ? '0 0 20px -2px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)'
        : variant === 'soft'
          ? '0 4px 16px -4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.12)'
          : undefined
      }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(className)}
      disabled={disabled}
      style={{
        ...sizeStyles[size],
        ...variantStyle,
        width: full ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        letterSpacing: '-0.01em',
        userSelect: 'none',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
