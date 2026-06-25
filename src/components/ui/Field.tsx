import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--surface-input)',
        backdropFilter: 'blur(10px)',
        fontSize: 14,
        outline: 'none',
        color: 'var(--ink)',
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
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--surface-input)',
        backdropFilter: 'blur(10px)',
        fontSize: 13,
        outline: 'none',
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
          padding: '12px 32px 12px 14px',
          borderRadius: 12,
          border: '1px solid var(--line)',
          background: 'var(--surface-input)',
          backdropFilter: 'blur(10px)',
          fontSize: 14,
          outline: 'none',
          color: 'var(--ink)',
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
          fontSize: 12
        }}
      >
        ▼
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
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderRadius: 12,
          border: `1px solid ${open ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
          background: 'var(--surface-input)',
          backdropFilter: 'blur(10px)',
          fontSize: 14,
          color: 'var(--ink)',
          textAlign: 'left',
          boxShadow: open ? '0 0 0 4px rgba(139, 92, 246, 0.1)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <span>{selected?.label}</span>
        <span style={{ fontSize: 10, color: 'var(--ink-mute)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'var(--surface-palette)',
              backdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid var(--surface-palette-border)',
              borderRadius: 16,
              padding: 6,
              boxShadow: '0 12px 40px -8px rgba(40, 0, 100, 0.3), 0 4px 12px -4px rgba(80, 40, 140, 0.1)',
              maxHeight: 260,
              overflowY: 'auto'
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  fontSize: 14,
                  background: opt.value === value ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                  color: 'var(--ink)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt.label}
                {opt.value === value && <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>}
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
        background: checked ? 'rgba(167, 139, 250, 0.18)' : 'var(--surface-button-off)',
        border: `1px solid ${checked ? 'rgba(167, 139, 250, 0.4)' : 'var(--line)'}`,
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ink)',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
        width: '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          background: checked
            ? 'linear-gradient(135deg, #a78bfa, #f0abfc)'
            : 'var(--toggle-track-off)',
          position: 'relative',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 16 : 2,
            width: 16,
            height: 16,
            background: '#fff',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
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
        accentColor: '#8b5cf6',
      }}
    />
  );
}
