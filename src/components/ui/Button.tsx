import { m } from 'framer-motion';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { spring } from '../../lib/motion';

type Variant = 'primary' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { height: 32, padding: '0 12px', fontSize: 'var(--t-sm)', borderRadius: 'var(--radius-sm)' },
  md: { height: 40, padding: '0 16px', fontSize: 14, borderRadius: 'var(--radius-sm)' },
  lg: { height: 48, padding: '0 22px', fontSize: 'var(--t-base)', borderRadius: 'var(--radius)' },
};

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--accent-ink)',
    fontWeight: 600,
    border: '1px solid transparent',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), var(--e1)',
  },
  soft: {
    background: 'var(--surface-2)',
    backdropFilter: 'var(--blur)',
    WebkitBackdropFilter: 'var(--blur)',
    color: 'var(--ink)',
    fontWeight: 550,
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--edge), var(--e1)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--ink-soft)',
    fontWeight: 500,
    border: '1px solid transparent',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full,
  className,
  style,
  disabled,
  type = 'button',
  ...rest
}: Props) {
  return (
    <m.button
      type={type}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={spring}
      className={cn(className)}
      disabled={disabled}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: full ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.005em',
        userSelect: 'none',
        opacity: disabled ? 0.45 : 1,
        transition: 'background-color var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), color var(--dur-2) var(--ease-out)',
        ...style,
      }}
      {...(rest as React.ComponentProps<typeof m.button>)}
    >
      {children}
    </m.button>
  );
}
