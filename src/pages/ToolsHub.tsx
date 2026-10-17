import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { GripVertical, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Kbd } from '../components/Shell';
import { Segmented } from '../components/ui/Segmented';
import { ToolCard } from '../components/ui/ToolCard';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { useUrlState } from '../hooks/useUrlState';
import { fadeUp, stagger } from '../lib/motion';
import { searchTools } from '../lib/search';
import { AUDIENCES, CATEGORIES, type Audience, type CategoryId } from '../tools/catalog';
import { toolBySlug, tools, type ToolMeta } from '../tools/registry';

const id = (v: string) => v;
const ISSUE_URL = 'https://github.com/ajithakdev/toolglass/issues/new?labels=new%20tool&title=';

// Only offer audiences and categories that have tools today
const audienceOptions = [
  { value: 'all', label: 'All' },
  ...AUDIENCES.filter((a) => tools.some((t) => t.audience.includes(a.id))).map((a) => ({
    value: a.id,
    label: a.id === 'everyone' ? 'Everyday' : a.name,
  })),
];
const categoryOptions = CATEGORIES.filter((c) => tools.some((t) => t.category === c.id));

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  // "/" focuses search, like most developer sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="glass-strong" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: '0 var(--s-4)', height: 56, borderRadius: 'var(--radius-lg)' }}>
      <Search size={20} strokeWidth={1.8} color="var(--ink-mute)" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search: json, password, qr code, timestamp…"
        aria-label="Search tools"
        className="hub-search"
        style={{ flex: 1, minWidth: 0, height: '100%', border: 0, background: 'transparent', fontSize: 'var(--t-md)', outline: 'none', color: 'var(--ink)' }}
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 999, color: 'var(--ink-mute)' }}>
          <X size={16} />
        </button>
      ) : (
        <span className="hide-sm">
          <Kbd>/</Kbd>
        </span>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={active ? 'chip chip-on' : 'chip'}>
      {children}
    </button>
  );
}

function FavoritesRail() {
  const { favorites, reorder } = useFavorites();
  const items = favorites.map(toolBySlug).filter((t): t is ToolMeta => !!t);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="fav-h" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <h2 id="fav-h" className="section-label">Favorites <span style={{ fontWeight: 400 }}>· drag to reorder</span></h2>
      <Reorder.Group axis="x" values={favorites} onReorder={reorder} className="rail" as="ul">
        {items.map((t) => (
          <Reorder.Item key={t.slug} value={t.slug} as="li" style={{ listStyle: 'none' }} whileDrag={{ scale: 1.03 }}>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 6px', borderRadius: 999 }}>
              <GripVertical size={14} color="var(--ink-mute)" aria-hidden style={{ cursor: 'grab' }} />
              <Link to={`/tools/${t.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--t-sm)', fontWeight: 550, whiteSpace: 'nowrap' }}>
                <span style={{ display: 'grid', placeItems: 'center', transform: 'scale(0.75)', width: 22, height: 22 }}>{t.icon}</span>
                {t.title}
              </Link>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </section>
  );
}

function RecentRail() {
  const { recents } = useRecentTools();
  const items = recents.map(toolBySlug).filter((t): t is ToolMeta => !!t);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="recent-h" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <h2 id="recent-h" className="section-label">Recently used</h2>
      <ul className="rail">
        {items.map((t) => (
          <li key={t.slug} style={{ listStyle: 'none' }}>
            <Link to={`/tools/${t.slug}`} className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', borderRadius: 999, fontSize: 'var(--t-sm)', fontWeight: 550, whiteSpace: 'nowrap' }}>
              <span style={{ display: 'grid', placeItems: 'center', transform: 'scale(0.75)', width: 22, height: 22 }}>{t.icon}</span>
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ToolsHub() {
  const [query, setQuery] = useUrlState('q', '', id, id);
  const [audience, setAudience] = useUrlState('for', 'all', id, id);
  const [category, setCategory] = useUrlState('cat', 'all', id, id);

  const filtered = useMemo(() => {
    const byAudience = audience === 'all' ? tools : tools.filter((t) => t.audience.includes(audience as Audience));
    const byCategory = category === 'all' ? byAudience : byAudience.filter((t) => t.category === (category as CategoryId));
    return searchTools(byCategory, query);
  }, [query, audience, category]);

  const searching = query.trim().length > 0;
  const groups = categoryOptions
    .map((c) => ({ ...c, items: filtered.filter((t) => t.category === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)', paddingBottom: 'var(--s-8)' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', paddingTop: 'var(--s-6)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--t-3xl)', lineHeight: 1.02, letterSpacing: 'var(--track-tight)', fontWeight: 650 }}>All tools</h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--t-md)', maxWidth: 'var(--measure)' }}>
          <span className="num">{tools.length}</span> free tools. Each one runs in your browser, so your files and text never leave this device.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <SearchBox value={query} onChange={setQuery} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="rail" role="group" aria-label="Category">
            <Chip active={category === 'all'} onClick={() => setCategory('all')}>All categories</Chip>
            {categoryOptions.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
          <div className="rail">
            <Segmented label="Who it's for" value={audience} options={audienceOptions} onChange={setAudience} size="sm" />
          </div>
        </div>
      </div>

      {!searching && category === 'all' && audience === 'all' && (
        <>
          <FavoritesRail />
          <RecentRail />
        </>
      )}

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass" style={{ padding: 'var(--s-7) var(--s-5)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 'var(--t-lg)', fontWeight: 600 }}>No tool matches that yet.</p>
            <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
              Tell us what you need and it may be next.{' '}
              <a className="link" href={ISSUE_URL + encodeURIComponent(`Tool request: ${query}`)} target="_blank" rel="noreferrer">
                Request a tool
              </a>
            </p>
          </motion.div>
        ) : searching ? (
          <motion.section key={`q-${query}`} aria-label="Search results" variants={stagger(0.03)} initial="hidden" animate="show" className="tool-grid">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </motion.section>
        ) : (
          <motion.div key={`g-${category}-${audience}`} initial="hidden" animate="show" variants={stagger(0.06)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-7)' }}>
            {groups.map((g) => (
              <motion.section key={g.id} variants={fadeUp} aria-labelledby={`cat-${g.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                  <h2 id={`cat-${g.id}`} style={{ margin: 0, fontSize: 'var(--t-xl)', fontWeight: 620 }}>{g.name}</h2>
                  <span style={{ color: 'var(--ink-mute)', fontSize: 'var(--t-sm)' }}>{g.blurb}</span>
                </div>
                <motion.div variants={stagger(0.04)} className="tool-grid">
                  {g.items.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </motion.div>
              </motion.section>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
