import type { CSSProperties, ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
  style,
}: {
  label: string;
  hint?: string;
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
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        fontSize: 14,
        outline: 'none',
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
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        fontSize: 13,
        outline: 'none',
        resize: 'vertical',
        minHeight: 120,
        fontFamily: 'var(--font-mono)',
        ...props.style,
      }}
    />
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
        background: checked ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255,255,255,0.5)',
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
            : 'rgba(0,0,0,0.08)',
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
