import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EASE_OUT } from '../../lib/motion';
import { searchTools } from '../../lib/search';
import { tools } from '../../tools/registry';

/** Search field with live suggestions (ARIA combobox). Enter opens the highlighted tool. */
export function HeroSearch() {
  const navigate = useNavigate();
  const listId = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (q.trim() ? searchTools(tools, q).slice(0, 6) : []), [q]);
  const show = open && q.trim().length > 0;

  const go = (slug?: string) => {
    if (slug) navigate(`/tools/${slug}`);
    else navigate(`/tools?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
      <div
        className="glass-strong focus-pill"
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', height: 58, padding: '0 6px 0 var(--s-4)', borderRadius: 999 }}
      >
        <Search size={19} strokeWidth={1.8} color="var(--ink-mute)" aria-hidden />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={show && results[active] ? `${listId}-${active}` : undefined}
          aria-label="Search tools"
          className="bare-input"
          placeholder="What do you need to do?"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && q.trim()) {
              go(results[active]?.slug);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          style={{ flex: 1, minWidth: 0, height: '100%', border: 0, outline: 'none', background: 'transparent', fontSize: 'var(--t-md)', color: 'var(--ink)' }}
        />
        <button
          type="button"
          onClick={() => (q.trim() ? go(results[active]?.slug) : navigate('/tools'))}
          aria-label={q.trim() ? 'Open result' : 'Browse all tools'}
          style={{
            height: 46,
            padding: '0 18px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontWeight: 600,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
          className="press"
        >
          <span className="hide-sm">{q.trim() ? 'Open' : 'Browse'}</span>
          <ArrowRight size={17} strokeWidth={2} />
        </button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 20,
              margin: 0,
              padding: 6,
              listStyle: 'none',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-3)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--edge), var(--e3)',
            }}
          >
            {results.length === 0 ? (
              <li style={{ padding: '12px 14px', color: 'var(--ink-soft)', fontSize: 14 }}>
                No tool for that yet. Press Enter to search all tools.
              </li>
            ) : (
              results.map((t, i) => (
                <li
                  key={t.slug}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(t.slug)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: i === active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 8, background: 'var(--surface-2)', flexShrink: 0 }}>
                    <span style={{ transform: 'scale(0.8)', display: 'grid' }}>{t.icon}</span>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</span>
                    <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.short}</span>
                  </span>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
