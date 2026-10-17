import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

export function Field({
  label,
  hint,
  children,
  style,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <label style={{ display: 'block', ...style }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        {hint && <span className="num" style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputBase: CSSProperties = {
  padding: '11px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--surface-input)',
  boxShadow: 'var(--edge)',
  fontSize: 14,
  outline: 'none',
  color: 'var(--ink)',
  transition: 'border-color var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out)',
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        ...inputBase,
        ...props.style,
      }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        ...inputBase,
        fontSize: 13,
        lineHeight: 1.6,
        resize: 'vertical',
        minHeight: 120,
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink)',
        ...props.style,
      }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        {...props}
        style={{
          width: '100%',
          ...inputBase,
          paddingRight: 36,
          appearance: 'none',
          WebkitAppearance: 'none',
          ...props.style,
        }}
      >
        {props.children}
      </select>
      <div 
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--ink-mute)',
          display: 'grid',
        }}
      >
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

export function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...inputBase,
          borderColor: open ? 'var(--accent)' : 'var(--border)',
          textAlign: 'left',
          boxShadow: open ? '0 0 0 4px var(--accent-soft)' : 'var(--edge)',
        }}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={16} color="var(--ink-mute)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 500,
              background: 'var(--surface-3)',
              backdropFilter: 'var(--blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius)',
              padding: 6,
              boxShadow: 'var(--edge), var(--e3)',
              maxHeight: 260,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                title={opt.label}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  background: opt.value === value ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--ink)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--dur-1) var(--ease-out)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = 'var(--surface-1)';
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {opt.label}
                </span>
                {opt.value === value && <Check size={14} color="var(--accent)" style={{ flexShrink: 0 }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: checked ? 'var(--accent-soft)' : 'var(--surface-1)',
        border: `1px solid ${checked ? 'var(--accent-ring)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--t-sm)',
        fontWeight: 500,
        color: 'var(--ink)',
        textAlign: 'left',
        transition: 'background-color var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out)',
        width: '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          background: checked ? 'var(--accent)' : 'var(--toggle-track-off)',
          position: 'relative',
          transition: 'background-color var(--dur-2) var(--ease-out)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            transform: checked ? 'translateX(14px)' : 'none',
            width: 16,
            height: 16,
            background: '#fff',
            borderRadius: '50%',
            transition: 'transform var(--dur-2) var(--ease-out)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        accentColor: 'var(--accent)',
        cursor: 'pointer',
      }}
    />
  );
}
