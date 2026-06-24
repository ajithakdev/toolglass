import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tools } from '../tools/registry';

/* ─── Palette-scoped CSS injected once ───────────────────────────────── */
const PALETTE_STYLES = `
  .palette-input::placeholder {
    color: var(--ink-mute);
    opacity: 1;
    font-weight: 400;
    font-size: 13px;
  }
  .palette-input {
    caret-color: var(--accent);
    -webkit-appearance: none;
    appearance: none;
  }
  .palette-input:focus,
  .palette-input:focus-visible {
    outline: none;
    box-shadow: none;
    border-radius: 0;
  }
  /* Hide native scrollbar in results list */
  .palette-results {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .palette-results::-webkit-scrollbar {
    display: none;
  }
`;

function InjectStyles() {
  return <style>{PALETTE_STYLES}</style>;
}

/* ─── SVG search icon (no emoji rendering quirks) ────────────────────── */
function SearchIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      style={{ flexShrink: 0, color: 'var(--ink-mute)' }}
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Focus trap ─────────────────────────────────────────────────────── */
function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    first?.focus();
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [active, ref]);
}

/* ─── Main component ─────────────────────────────────────────────────── */
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = tools.filter((t) => {
    const q = query.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.short.toLowerCase().includes(q);
  });

  /* Reset on open */
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      prevFocusRef.current?.focus();
    }
  }, [open]);

  /* Keep selected in bounds when filter changes */
  useEffect(() => {
    setSelected(0);
  }, [query]);

  /* Auto-scroll selected item into view */
  useEffect(() => {
    const item = itemRefs.current[selected];
    if (item && listRef.current) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selected]);

  useFocusTrap(containerRef, open);

  const navigateTo = (slug: string) => {
    onClose();
    navigate(`/tools/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => (s - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selected]) navigateTo(filtered[selected].slug);
    }
  };

  /* Gradient fade colors for the scroll mask — theme-aware via inline */
  const fadeSurface = 'var(--surface-palette)';

  return (
    <>
      <InjectStyles />
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 5, 28, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '16vh',
            }}
          >
            <motion.div
              key="palette-box"
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              style={{
                width: '100%',
                maxWidth: 580,
                margin: '0 16px',
                borderRadius: 22,
                overflow: 'hidden',
                background: fadeSurface,
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                border: '1px solid var(--surface-palette-border)',
                boxShadow:
                  '0 32px 80px -8px rgba(40, 0, 100, 0.4), 0 8px 24px -4px rgba(80, 40, 140, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >

              {/* ── Search Row ───────────────────────────────────────── */}
              <div
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderBottom: '1px solid var(--divider)',
                }}
              >
                <SearchIcon />
                <input
                  ref={inputRef}
                  id="command-palette-input"
                  className="palette-input"
                  type="text"
                  placeholder="Search tools…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxShadow: 'none',
                    letterSpacing: '-0.01em',
                    paddingInlineStart: 2,
                    WebkitAppearance: 'none',
                  }}
                />
                <kbd
                  style={{
                    fontSize: 10,
                    padding: '3px 7px',
                    borderRadius: 6,
                    background: 'var(--kbd-bg)',
                    color: 'var(--ink-mute)',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--kbd-border)',
                    letterSpacing: '0.02em',
                    userSelect: 'none',
                  }}
                >
                  esc
                </kbd>
              </div>

              {/* ── Results with scroll-fade mask ────────────────────── */}
              <div style={{ position: 'relative' }}>
                {/* Scrollable list — no native scrollbar */}
                <div
                  ref={listRef}
                  role="listbox"
                  aria-label="Tool results"
                  className="palette-results"
                  style={{
                    maxHeight: 340,
                    overflowY: 'auto',
                    padding: '6px 8px',
                  }}
                >
                  {filtered.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: '32px 24px',
                        textAlign: 'center',
                        color: 'var(--ink-mute)',
                        fontSize: 14,
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>⊘</div>
                      No tools match <strong style={{ color: 'var(--ink-soft)' }}>"{query}"</strong>
                    </motion.div>
                  )}

                  {filtered.map((t, i) => (
                    <motion.button
                      key={t.slug}
                      ref={(el) => { itemRefs.current[i] = el; }}
                      role="option"
                      aria-selected={i === selected}
                      onClick={() => navigateTo(t.slug)}
                      onMouseEnter={() => setSelected(i)}
                      animate={{
                        background:
                          i === selected
                            ? 'rgba(139, 92, 246, 0.12)'
                            : 'rgba(139, 92, 246, 0)',
                      }}
                      transition={{ duration: 0.1 }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '10px 12px',
                        borderRadius: 13,
                        border: `1px solid ${i === selected ? 'rgba(139, 92, 246, 0.22)' : 'transparent'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: 2,
                      }}
                    >
                      {/* Icon tile */}
                      <div
                        aria-hidden
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: t.tint,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 19,
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}
                      >
                        {t.icon}
                      </div>

                      {/* Labels */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--ink-soft)',
                            marginTop: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.short}
                        </div>
                      </div>

                      {/* Enter hint on selected */}
                      <AnimatePresence>
                        {i === selected && (
                          <motion.kbd
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.12 }}
                            style={{
                              fontSize: 12,
                              padding: '3px 8px',
                              borderRadius: 7,
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: 'var(--accent)',
                              fontFamily: 'var(--font-mono)',
                              border: '1px solid rgba(139, 92, 246, 0.25)',
                              flexShrink: 0,
                              userSelect: 'none',
                            }}
                          >
                            ↵
                          </motion.kbd>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}

                  {/* Bottom padding so last item isn't hidden behind fade */}
                  {filtered.length > 0 && <div style={{ height: 6 }} />}
                </div>

                {/* Soft fade-out mask at bottom — signals scrollable content */}
                {filtered.length > 5 && (
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 52,
                      background: `linear-gradient(to bottom, transparent, ${fadeSurface})`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>

              {/* ── Footer hints ─────────────────────────────────────── */}
              <div
                style={{
                  padding: '10px 18px',
                  borderTop: '1px solid var(--divider)',
                  display: 'flex',
                  gap: 18,
                  fontSize: 11,
                  color: 'var(--ink-mute)',
                  userSelect: 'none',
                }}
              >
                {[
                  { key: '↑↓', label: 'navigate' },
                  { key: '↵', label: 'open' },
                  { key: 'esc', label: 'close' },
                ].map(({ key, label }) => (
                  <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <kbd
                      style={{
                        padding: '2px 5px',
                        borderRadius: 5,
                        background: 'var(--kbd-bg)',
                        border: '1px solid var(--kbd-border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        lineHeight: 1.4,
                        color: 'var(--ink-soft)',
                      }}
                    >
                      {key}
                    </kbd>
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
