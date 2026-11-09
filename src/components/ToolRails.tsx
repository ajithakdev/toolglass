import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { toolBySlug, type ToolMeta } from '../tools/registry';

export function FavoritesRail() {
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

export function RecentRail() {
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
