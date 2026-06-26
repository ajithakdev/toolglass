import { useState, useMemo } from 'react';
import { Pipette } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Field } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { useToolStats } from '../../hooks/useToolStats';

const PRESET_COLORS = [
  '#FF0000', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B',
  '#4CAF50', '#009688', '#00BCD4', '#2196F3', '#3F51B5',
  '#673AB7', '#9C27B0', '#E91E63', '#795548', '#607D8B',
  '#000000', '#FFFFFF',
];

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

      const r_ = r / 255, g_ = g / 255, b_ = b / 255;
      const max = Math.max(r_, g_, b_), min = Math.min(r_, g_, b_);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
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
        const newL = Math.max(0, Math.min(100, Math.round(l * 100) + dl));
        return `hsl${a < 1 ? 'a' : ''}(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${newL}%${a < 1 ? `, ${a}` : ''})`;
      });

      return { rgb: computed, hex, hsl, color: computed, variations, isHex: a === 1 && hex.length === 7 ? hex : null };
    } catch {
      return null;
    }
  }, [input]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field label="Any Color Format (Hex, RGB, HSL, Named)">
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: 10,
                background: parsed?.isHex || 'var(--surface-button-off)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              title="Pick a color"
            >
              <Pipette size={20} style={{ pointerEvents: 'none', color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))', mixBlendMode: 'difference' }} />
              <input
                type="color"
                value={parsed?.isHex || '#000000'}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: -10,
                  width: 70,
                  height: 70,
                  cursor: 'pointer',
                  opacity: 0
                }}
              />
            </div>
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

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8 }}>Preset Colors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setInput(c)}
                title={c}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: c,
                  cursor: 'pointer',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)'; }}
              />
            ))}
          </div>
        </div>

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
  const { slug = 'color' } = useParams();
  const { increment } = useToolStats(slug);

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        cursor: 'pointer',
        padding: '10px 14px',
        background: 'var(--glass-bg)',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
      }}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        increment();
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <div style={{ width: 40, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{value}</div>
      <div style={{ fontSize: 12, color: copied ? '#10b981' : 'var(--ink-mute)', transition: 'color 0.2s', fontWeight: 500 }}>
        {copied ? 'Copied!' : 'Copy'}
      </div>
    </div>
  );
}
