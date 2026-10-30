import { m } from 'framer-motion';
import { Check, ChevronRight, Link2, ShieldCheck, Star } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useClipboard } from '../hooks/useClipboard';
import { useFavorites } from '../hooks/useFavorites';
import { useToolStats } from '../hooks/useToolStats';
import { currentUrl } from '../hooks/useUrlState';
import { EASE_OUT } from '../lib/motion';
import { CATEGORIES } from '../tools/catalog';
import { toolBySlug, toolsInCategory } from '../tools/registry';
import { GlassCard } from './ui/GlassCard';

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
  const related = toolsInCategory(tool.category).filter((t) => t.slug !== tool.slug).slice(0, 8);
  const fav = isFavorite(tool.slug);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className={tool.wide ? 'tool-page is-wide' : 'tool-page'}
    >
      <div className="tool-head">
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', flexWrap: 'wrap' }}>
          <Link to="/tools" className="crumb">Tools</Link>
          <ChevronRight size={12} aria-hidden />
          {category && (
            <>
              <Link to={`/tools?cat=${category.id}`} className="crumb">{category.name}</Link>
              <ChevronRight size={12} aria-hidden />
            </>
          )}
          <span aria-current="page" style={{ color: 'var(--ink-soft)' }}>{tool.title}</span>
        </nav>

        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <span
              aria-hidden
              style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center', background: 'var(--surface-3)', boxShadow: 'var(--edge), var(--e1)' }}
            >
              {tool.icon}
            </span>
            <h1 style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 'var(--t-2xl)', lineHeight: 1.1, letterSpacing: 'var(--track-tight)', fontWeight: 650 }}>{tool.title}</h1>
            <div style={{ display: 'flex', gap: 'var(--s-2)', flexShrink: 0 }}>
              <IconButton label={fav ? 'Remove from favorites' : 'Add to favorites'} pressed={fav} onClick={() => toggleFavorite(tool.slug)}>
                <Star size={16} strokeWidth={1.9} fill={fav ? 'currentColor' : 'none'} />
                <span className="hide-sm">{fav ? 'Saved' : 'Favorite'}</span>
              </IconButton>
              <IconButton label="Copy link to this tool" onClick={() => copy(currentUrl())}>
                {copied ? <Check size={16} strokeWidth={2.2} /> : <Link2 size={16} strokeWidth={1.9} />}
                <span className="hide-sm">{copied ? 'Copied' : 'Share'}</span>
              </IconButton>
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--t-sm)', maxWidth: 'var(--measure)' }}>{tool.description}</p>
        </header>
      </div>

      <div className="tool-main">
        <GlassCard strong className="tool-body" padding="clamp(14px, 2vw, 20px)" style={{ borderRadius: 'var(--radius-lg)' }}>
          {children}
        </GlassCard>

        {enabled && count > 0 && (
          <p className="num" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
            You've used this tool {count} {count === 1 ? 'time' : 'times'}, counted on this device only.
          </p>
        )}
      </div>

      <aside className="tool-aside" aria-label="About this tool">
        <div className="tool-privacy">
          <ShieldCheck size={16} color="var(--status-success)" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0 }}>
            {/* The API Tester is the one tool that sends network requests */}
            {tool.slug === 'api-tester' ? 'Runs in your browser. Requests go only to the URLs you send them to.' : 'Runs on your device. Nothing you enter is uploaded.'}
            {tool.replaces ? ` Instead of ${tool.replaces}.` : ''}
          </p>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-h" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', minWidth: 0 }}>
            <h2 id="related-h" className="section-label">More {category?.name.toLowerCase()} tools</h2>
            <ul className="related-list">
              {related.map((t) => (
                <li key={t.slug}>
                  <Link to={`/tools/${t.slug}`} className="related-item" onMouseEnter={t.preload} onFocus={t.preload}>
                    <span aria-hidden className="related-icon">{t.icon}</span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--ink)' }}>{t.title}</span>
                      <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.short}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </m.div>
  );
}
