import { m } from 'framer-motion';
import { useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { spring } from '../../lib/motion';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/** Radio group styled as a glass pill with a sliding indicator. Arrow keys move the selection. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  iconOnly,
  size = 'md',
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T, event?: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the group */
  label: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md';
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const h = size === 'sm' ? 28 : 32;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const next = (i + step + options.length) % options.length;
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={{
        display: 'inline-flex',
        padding: 3,
        gap: 2,
        borderRadius: 999,
        background: 'var(--surface-1)',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--edge)',
      }}
    >
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={iconOnly ? o.label : undefined}
            title={iconOnly ? o.label : undefined}
            tabIndex={active ? 0 : -1}
            onClick={(e) => onChange(o.value, e)}
            style={{
              position: 'relative',
              height: h - 8,
              minWidth: iconOnly ? h - 8 : undefined,
              padding: iconOnly ? 0 : '0 10px',
              borderRadius: 999,
              display: 'inline-grid',
              placeItems: 'center',
              fontSize: 'var(--t-sm)',
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--accent)' : 'var(--ink-mute)',
              transition: 'color var(--dur-2) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            {active && (
              <m.span
                layoutId={`seg-${id}`}
                transition={spring}
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  background: 'var(--accent-soft)',
                  boxShadow: 'inset 0 0 0 1px var(--accent-ring)',
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {o.icon}
              {!iconOnly && o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
