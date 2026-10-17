import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CommandPalette } from './components/CommandPalette';
import { Shell } from './components/Shell';
import { Landing } from './pages/Landing';
import { ToolPage } from './pages/ToolPage';
import { ToastProvider } from './components/ui/Toast';
import { toolBySlug } from './tools/registry';
import { applyMetaToDocument, HOME, toolPage } from './seo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './pages/NotFound';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Keep title and meta tags in step with client-side navigation (prerendered pages set them on load)
  useEffect(() => {
    const tool = location.pathname.startsWith('/tools/') ? toolBySlug(location.pathname.slice(7)) : undefined;
    applyMetaToDocument(tool ? toolPage(tool) : HOME);
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
      <ToastProvider>
        <Shell onOpenPalette={() => setPaletteOpen(true)}>
          <ErrorBoundary>
            <div className="container" style={{ paddingTop: 'var(--s-5)' }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/tools" element={<Landing />} />
                <Route path="/tools/:slug" element={<ToolPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </ErrorBoundary>
        </Shell>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </ToastProvider>
    </MotionConfig>
  );
}
