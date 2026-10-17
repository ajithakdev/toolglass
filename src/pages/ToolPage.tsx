import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toolBySlug } from '../tools/registry';
import { useRecentTools } from '../hooks/useRecentTools';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { NotFound } from './NotFound';

/* ── Loading skeleton, shown only if the tool takes a moment to load ── */
function Loader() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div role="status" aria-label="Loading tool" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)', paddingTop: 'var(--s-3)' }}>
      <div className="skeleton" style={{ width: 180, height: 14 }} />
      <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
        <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 'var(--radius)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ width: '40%', height: 30 }} />
          <div className="skeleton" style={{ width: '70%', height: 14 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-xl)' }} />
    </div>
  );
}

/* ── Route component ─────────────────────────────────────────────── */
export function ToolPage() {
  const { slug = '' } = useParams();
  const tool = toolBySlug(slug);
  const { addRecent } = useRecentTools();

  useEffect(() => {
    if (tool) {
      addRecent(tool.slug);
    }
  }, [tool, addRecent]);

  if (!tool) {
    return <NotFound attemptedSlug={slug} isToolNotFound={true} />;
  }

  const { Component } = tool;
  return (
    <ErrorBoundary toolTitle={tool.title}>
      <Suspense fallback={<Loader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}
