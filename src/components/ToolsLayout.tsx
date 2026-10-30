import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useRecentTools } from '../hooks/useRecentTools';
import { preloadWhenIdle } from '../tools/registry';
import { ToolRail } from './ToolRail';

/** Layout route for /tools and /tools/:slug: the rail stays mounted while only the outlet swaps. */
export function ToolsLayout() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const { favorites } = useFavorites();
  const { recents } = useRecentTools();
  const warm = [...new Set([...favorites, ...recents])].join();

  useEffect(() => {
    if (warm) preloadWhenIdle(warm.split(','));
  }, [warm]);

  return (
    <div className="container" style={{ paddingTop: 'var(--s-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--s-5)' }}>
      {desktop && <ToolRail />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* The height floor stops the footer jumping up while a cold chunk loads */}
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
