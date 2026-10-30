import { AnimatePresence, m } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Kbd } from '../components/Shell';
import { FavoritesRail, RecentRail } from '../components/ToolRails';
import { Segmented } from '../components/ui/Segmented';
import { ToolCard } from '../components/ui/ToolCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useUrlState } from '../hooks/useUrlState';
import { fadeUp, stagger } from '../lib/motion';
import { searchTools } from '../lib/search';
import { AUDIENCES, CATEGORIES, type Audience, type CategoryId } from '../tools/catalog';
import { byTitle, tools } from '../tools/registry';

const id = (v: string) => v;
const ISSUE_URL = 'https://github.com/ajithakdev/toolglass/issues/new?template=feature_request.yml&labels=enhancement,new%20tool&title=';

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
    <div className="glass-strong focus-pill" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: '0 var(--s-4)', height: 44, borderRadius: 'var(--radius-lg)' }}>
      <Search size={20} strokeWidth={1.8} color="var(--ink-mute)" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search: json, password, qr code, timestamp…"
        aria-label="Search tools"
        className="hub-search bare-input"
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

export function ToolsHub() {
  const [query, setQuery] = useUrlState('q', '', id, id);
  const [audience, setAudience] = useUrlState('for', 'all', id, id);
  const [category, setCategory] = useUrlState('cat', 'all', id, id);
  const desktop = useMediaQuery('(min-width: 1024px)');
  const { hash } = useLocation();

  const filtered = useMemo(() => {
    const byAudience = audience === 'all' ? tools : tools.filter((t) => t.audience.includes(audience as Audience));
    const byCategory = category === 'all' ? byAudience : byAudience.filter((t) => t.category === (category as CategoryId));
    return searchTools(byCategory, query);
  }, [query, audience, category]);

  const searching = query.trim().length > 0;
  const groups = categoryOptions
    .map((c) => ({ ...c, items: filtered.filter((t) => t.category === c.id) }))
    .map((g) => (searching ? g : { ...g, items: byTitle(g.items) }))
    .filter((g) => g.items.length > 0);

  // Home's category tiles link to /tools#cat-<id>
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)', paddingBottom: 'var(--s-7)' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', paddingTop: 'var(--s-2)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--t-3xl)', lineHeight: 1.05, letterSpacing: 'var(--track-tight)', fontWeight: 650 }}>All tools</h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--t-md)', maxWidth: 'var(--measure)' }}>
          <span className="num">{tools.length}</span> free tools. Each one runs in your browser, so your files and text never leave this device.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <SearchBox value={query} onChange={setQuery} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* The sidebar covers categories on desktop; chips stay only to clear a ?cat= filter */}
          {(!desktop || category !== 'all') && (
          <div className="rail" role="group" aria-label="Category">
            <Chip active={category === 'all'} onClick={() => setCategory('all')}>All categories</Chip>
            {categoryOptions.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
          )}
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
          <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass" style={{ padding: 'var(--s-7) var(--s-5)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 'var(--t-lg)', fontWeight: 600 }}>No tool matches that yet.</p>
            <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
              Tell us what you need and it may be next.{' '}
              <a className="link" href={ISSUE_URL + encodeURIComponent(`Tool request: ${query}`)} target="_blank" rel="noreferrer">
                Request a tool
              </a>
            </p>
          </m.div>
        ) : searching ? (
          <m.section key={`q-${query}`} aria-label="Search results" variants={stagger(0.03)} initial="hidden" animate="show" className="tool-grid">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </m.section>
        ) : (
          <m.div key={`g-${category}-${audience}`} initial="hidden" animate="show" variants={stagger(0.06)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            {groups.map((g) => (
              <m.section key={g.id} variants={fadeUp} aria-labelledby={`cat-${g.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                  <h2 id={`cat-${g.id}`} style={{ margin: 0, scrollMarginTop: 'calc(var(--header-h) + var(--s-4))', fontSize: 'var(--t-xl)', fontWeight: 620 }}>{g.name}</h2>
                  <span style={{ color: 'var(--ink-mute)', fontSize: 'var(--t-sm)' }}>{g.blurb}</span>
                </div>
                <m.div variants={stagger(0.04)} className="tool-grid">
                  {g.items.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </m.div>
              </m.section>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
