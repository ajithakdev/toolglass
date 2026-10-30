import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { searchTools } from '../lib/search';
import { CATEGORIES } from '../tools/catalog';
import { toolBySlug, tools, toolsInCategory, type ToolMeta } from '../tools/registry';

const KEY = 'toolglass_rail_collapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

function Item({ tool, collapsed, active }: { tool: ToolMeta; collapsed: boolean; active: boolean }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="rail-item"
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? tool.title : undefined}
      title={collapsed ? tool.title : undefined}
      onMouseEnter={tool.preload}
      onFocus={tool.preload}
      style={collapsed ? { justifyContent: 'center', padding: 0 } : undefined}
    >
      <span aria-hidden style={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 22, height: 22, transform: 'scale(0.8)' }}>{tool.icon}</span>
      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.title}</span>}
    </Link>
  );
}

/** Desktop sidebar: filter, favorites, recent, then every category. Collapses to icons. */
export function ToolRail() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { favorites } = useFavorites();
  const { recents } = useRecentTools();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const toggleRail = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      // keep in memory only
    }
  };

  const pick = (slugs: string[]) => slugs.map(toolBySlug).filter((t): t is ToolMeta => !!t);
  const searching = !collapsed && query.trim() !== '';

  const onCategory = (id: string) => {
    setClosed((c) => {
      const next = new Set(c);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    if (pathname === '/tools') document.getElementById(`cat-${id}`)?.scrollIntoView({ block: 'start' });
  };

  const list = (items: ToolMeta[]) => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((t) => (
        <li key={t.slug}>
          <Item tool={t} collapsed={collapsed} active={t.slug === slug} />
        </li>
      ))}
    </ul>
  );
  const section = (title: string, items: ToolMeta[]) =>
    items.length > 0 && (
      <section aria-label={title}>
        {collapsed ? <Divider /> : <h2 className="section-label" style={{ margin: 0, padding: '8px 8px 4px' }}>{title}</h2>}
        {list(items)}
      </section>
    );

  return (
    <nav
      aria-label="Tools"
      className="glass"
      style={{
        position: 'sticky',
        top: 'var(--header-h)',
        alignSelf: 'flex-start',
        flexShrink: 0,
        width: collapsed ? 56 : 240,
        height: 'calc(100dvh - var(--header-h) - var(--s-4))',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: collapsed ? 'center' : 'space-between', padding: 8, flexShrink: 0 }}>
        {!collapsed && (
          <label className="focus-pill" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 8px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)' }}>
            <Search size={14} color="var(--ink-mute)" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter tools"
              aria-label="Filter tools in the sidebar"
              className="bare-input"
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 'var(--t-sm)' }}
            />
          </label>
        )}
        <button
          type="button"
          className="nav-btn"
          onClick={toggleRail}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', flexShrink: 0 }}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      <div className="rail-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '0 6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {searching ? (
        (() => {
          const hits = searchTools(tools, query);
          return hits.length > 0 ? list(hits) : <p style={{ margin: 0, padding: 8, color: 'var(--ink-mute)', fontSize: 'var(--t-sm)' }}>No tool matches.</p>;
        })()
      ) : (
        <>
          {section('Favorites', pick(favorites))}
          {section('Recent', pick(recents).slice(0, 5))}
          {CATEGORIES.map((c) => {
            const items = toolsInCategory(c.id);
            if (items.length === 0) return null;
            const open = collapsed || !closed.has(c.id);
            return (
              <section key={c.id} aria-label={c.name}>
                {collapsed ? (
                  <Divider />
                ) : (
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => onCategory(c.id)}
                    className="section-label"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 4px', textAlign: 'left' }}
                  >
                    {c.name}
                    <ChevronDown size={13} aria-hidden style={{ transform: open ? undefined : 'rotate(-90deg)' }} />
                  </button>
                )}
                {open && list(items)}
              </section>
            );
          })}
        </>
      )}
      </div>
    </nav>
  );
}

function Divider() {
  return <hr aria-hidden style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 8px' }} />;
}
