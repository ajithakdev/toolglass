import { m } from 'framer-motion';
import { Check, ChevronRight, Link2, ShieldCheck, Star } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useClipboard } from '../hooks/useClipboard';
import { useFavorites } from '../hooks/useFavorites';
import { useToolStats } from '../hooks/useToolStats';
import { currentUrl } from '../hooks/useUrlState';
import { EASE_OUT, stagger } from '../lib/motion';
import { CATEGORIES } from '../tools/catalog';
import { toolBySlug, tools } from '../tools/registry';
import { GlassCard } from './ui/GlassCard';
import { ToolCard } from './ui/ToolCard';

function IconButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="nav-btn" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} style={{ color: pressed ? 'var(--accent)' : undefined }}>
      {children}
    </button>
  );
}

/** Shell around every tool: breadcrumb, title and actions, the tool body, then related tools. */
export function ToolLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { slug = '' } = useParams();
  const tool = toolBySlug(slug);
  const { count, enabled } = useToolStats(slug);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { copy, copied } = useClipboard(1800);

  // Backspace outside a text field goes back to the tools hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      e.preventDefault();
      navigate('/tools');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!tool) return null;
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const related = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4);
  const fav = isFavorite(tool.slug);

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)', paddingBottom: 'var(--s-8)' }}
    >
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)', color: 'var(--ink-mute)', paddingTop: 'var(--s-3)' }}>
        <Link to="/tools" className="crumb">Tools</Link>
        <ChevronRight size={14} aria-hidden />
        {category && (
          <>
            <Link to={`/tools?cat=${category.id}`} className="crumb">{category.name}</Link>
            <ChevronRight size={14} aria-hidden />
          </>
        )}
        <span aria-current="page" style={{ color: 'var(--ink-soft)' }}>{tool.title}</span>
      </nav>

      <header style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span
          aria-hidden
          style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 'var(--radius)', display: 'grid', placeItems: 'center', background: 'var(--surface-3)', boxShadow: 'var(--edge), var(--e1)' }}
        >
          <span style={{ transform: 'scale(1.15)', display: 'grid' }}>{tool.icon}</span>
        </span>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--t-2xl)', lineHeight: 1.08, letterSpacing: 'var(--track-tight)', fontWeight: 650 }}>{tool.title}</h1>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--t-base)', maxWidth: 'var(--measure)' }}>{tool.description}</p>
          <p style={{ margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
            <ShieldCheck size={14} color="var(--status-success)" aria-hidden />
            {/* The API Tester is the one tool that sends network requests */}
            {tool.slug === 'api-tester' ? 'Runs in your browser. Requests go only to the URLs you send them to' : 'Runs on your device'}
            {tool.replaces ? `. Instead of ${tool.replaces}.` : '.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <IconButton label={fav ? 'Remove from favorites' : 'Add to favorites'} pressed={fav} onClick={() => toggleFavorite(tool.slug)}>
            <Star size={16} strokeWidth={1.9} fill={fav ? 'currentColor' : 'none'} />
            <span className="hide-sm">{fav ? 'Saved' : 'Favorite'}</span>
          </IconButton>
          <IconButton label="Copy link to this tool" onClick={() => copy(currentUrl())}>
            {copied ? <Check size={16} strokeWidth={2.2} /> : <Link2 size={16} strokeWidth={1.9} />}
            <span className="hide-sm">{copied ? 'Copied' : 'Share'}</span>
          </IconButton>
        </div>
      </header>

      <GlassCard strong padding="clamp(16px, 3vw, 28px)" style={{ borderRadius: 'var(--radius-xl)' }}>
        {children}
      </GlassCard>

      {enabled && count > 0 && (
        <p className="num" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
          You've used this tool {count} {count === 1 ? 'time' : 'times'}, counted on this device only.
        </p>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-h" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
          <h2 id="related-h" className="section-label">More {category?.name.toLowerCase()} tools</h2>
          <m.div className="tool-grid" initial="hidden" animate="show" variants={stagger(0.05)}>
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} compact />
            ))}
          </m.div>
        </section>
      )}
    </m.div>
  );
}
