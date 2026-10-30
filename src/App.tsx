import { LazyMotion, MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CommandPalette } from './components/CommandPalette';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';
import { ToastProvider } from './components/ui/Toast';
import { applyMetaToDocument, HOME, pageForPath } from './seo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './pages/NotFound';

// Home, ToolPage and NotFound (used by ToolPage) stay in the entry chunk: they are where visitors land
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const ToolsHub = lazy(() => import('./pages/ToolsHub').then((m) => ({ default: m.ToolsHub })));

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ paddingTop: 'var(--s-4)' }}>
      {/* Full-height fallback keeps the footer below the fold while a lazy page loads */}
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>{children}</Suspense>
    </div>
  );
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Keep title and meta tags in step with client-side navigation (prerendered pages set them on load)
  useEffect(() => {
    applyMetaToDocument(pageForPath(location.pathname) ?? HOME);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    // reducedMotion="user": framer drops transforms but keeps fades when the OS asks for less motion
    <MotionConfig reducedMotion="user">
      {/* `m` componentss render at once and animate when these features arrive */}
      <LazyMotion features={() => import('./lib/motionFeatures').then((r) => r.default)}>
      <ToastProvider>
        <Shell onOpenPalette={() => setPaletteOpen(true)}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Page><ToolsHub /></Page>} />
              <Route path="/tools/:slug" element={<Page><ToolPage /></Page>} />
              <Route path="/about" element={<Page><About /></Page>} />
              <Route path="*" element={<Page><NotFound /></Page>} />
            </Routes>
          </ErrorBoundary>
        </Shell>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </ToastProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
