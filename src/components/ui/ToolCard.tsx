import { m } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useToolStats } from '../../hooks/useToolStats';
import { fadeUp } from '../../lib/motion';
import type { ToolMeta } from '../../tools/registry';

export function ToolCard({ tool, compact }: { tool: ToolMeta; compact?: boolean }) {
  const { allStats, enabled } = useToolStats();
  const { isFavorite, toggleFavorite } = useFavorites();
  const count = allStats[tool.slug] || 0;
  const fav = isFavorite(tool.slug);

  return (
    <m.div variants={fadeUp} className="glass lift tool-card" style={{ position: 'relative', borderRadius: 'var(--radius-lg)' }}>
      <Link
        to={`/tools/${tool.slug}`}
        className="stretched"
        onMouseEnter={tool.preload}
        onFocus={tool.preload}
        style={{
          display: 'flex',
          gap: 'var(--s-2)',
          alignItems: compact ? 'center' : 'flex-start',
          flexDirection: compact ? 'row' : 'column',
          padding: compact ? 'var(--s-2) var(--s-3)' : 'var(--s-3) var(--s-4)',
          height: '100%',
        }}
      >
        <span
          aria-hidden
          style={{
            width: compact ? 32 : 36,
            height: compact ? 32 : 36,
            flexShrink: 0,
            borderRadius: 'var(--radius-sm)',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--surface-3)',
            boxShadow: 'var(--edge), var(--e1)',
          }}
        >
          {tool.icon}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, paddingRight: compact ? 28 : 0 }}>
          <span style={{ fontSize: compact ? 'var(--t-base)' : 'var(--t-md)', fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--ink)' }}>
            {tool.title}
          </span>
          <span style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)', lineHeight: 1.4 }}>{tool.short}</span>
          {!compact && tool.replaces && (
            <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', marginTop: 4 }}>Instead of {tool.replaces}</span>
          )}
        </span>
        {!compact && enabled && count > 0 && (
          <span className="num" style={{ marginTop: 'auto', fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
            Used {count} {count === 1 ? 'time' : 'times'}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => toggleFavorite(tool.slug)}
        aria-pressed={fav}
        aria-label={fav ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
        title={fav ? 'Remove from favorites' : 'Add to favorites'}
        className="fav-btn"
        style={{
          position: 'absolute',
          top: compact ? '50%' : 8,
          right: 12,
          transform: compact ? 'translateY(-50%)' : undefined,
          zIndex: 2,
          width: 32,
          height: 32,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          color: fav ? 'var(--accent)' : 'var(--ink-mute)',
        }}
      >
        <Star size={16} strokeWidth={1.9} fill={fav ? 'currentColor' : 'none'} />
      </button>
    </m.div>
  );
}
