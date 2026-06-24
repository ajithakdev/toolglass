import { useState, useMemo } from 'react';
import { Field } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';

export default function ColorTool() {
  const [input, setInput] = useState('#8b5cf6');

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const div = document.createElement('div');
      div.style.color = input;
      if (!div.style.color) return null;
      document.body.appendChild(div);
      const computed = window.getComputedStyle(div).color;
      document.body.removeChild(div);

      const rgbaMatch = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!rgbaMatch) return null;

      const r = parseInt(rgbaMatch[1], 10);
      const g = parseInt(rgbaMatch[2], 10);
      const b = parseInt(rgbaMatch[3], 10);
      const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase() + (a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase() : '');

      let r_ = r / 255, g_ = g / 255, b_ = b / 255;
      const max = Math.max(r_, g_, b_), min = Math.min(r_, g_, b_);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r_: h = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break;
          case g_: h = (b_ - r_) / d + 2; break;
          case b_: h = (r_ - g_) / d + 4; break;
        }
        h /= 6;
      }
      const hsl = `hsl${a < 1 ? 'a' : ''}(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%${a < 1 ? `, ${a}` : ''})`;

      const variations = [-20, -10, 0, 10, 20].map(dl => {
        let newL = Math.max(0, Math.min(100, Math.round(l * 100) + dl));
        return `hsl${a < 1 ? 'a' : ''}(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${newL}%${a < 1 ? `, ${a}` : ''})`;
      });

      return { rgb: computed, hex, hsl, color: computed, variations, isHex: a === 1 && hex.length === 7 ? hex : null };
    } catch {
      return null;
    }
  }, [input]);

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert colors between Hex, RGB, and HSL. Provides live preview."
      icon="🎨"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field label="Any Color Format (Hex, RGB, HSL, Named)">
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="color"
              value={parsed?.isHex || '#000000'}
              onChange={(e) => setInput(e.target.value)}
              style={{
                width: 42,
                height: 42,
                padding: 0,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                background: 'none',
                flexShrink: 0
              }}
            />
            <input
              type="text"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ 
                flex: 1, 
                fontFamily: 'var(--font-mono)',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--glass-border)',
                background: 'var(--surface-input)',
                color: 'var(--ink)',
                outline: 'none'
              }}
            />
          </div>
        </Field>

        {parsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8 }}>Similar shades</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {parsed.variations.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setInput(v)}
                  title={v}
                  style={{
                    width: 32, height: 32, borderRadius: 6, background: v,
                    cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), var(--icon-highlight)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        )}

        {parsed ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: parsed.color,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), var(--icon-highlight)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              <CopyRow label="HEX" value={parsed.hex} />
              <CopyRow label="RGB" value={parsed.rgb} />
              <CopyRow label="HSL" value={parsed.hsl} />
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--status-error)' }}>Invalid color format.</div>
        )}
      </div>
    </ToolLayout>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        cursor: 'pointer',
        padding: '10px 14px',
        background: 'var(--surface-card)',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
      }}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <div style={{ width: 40, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{value}</div>
      <div style={{ fontSize: 12, color: copied ? '#10b981' : 'var(--ink-mute)', transition: 'color 0.2s', fontWeight: 500 }}>
        {copied ? '✨ Copied!' : 'Copy'}
      </div>
    </div>
  );
}
