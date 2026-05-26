import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { toolBySlug } from '../tools/registry';

function Loader() {
  return (
    <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-mute)' }}>
      Loading…
    </div>
  );
}

export function ToolPage() {
  const { slug = '' } = useParams();
  const tool = toolBySlug(slug);
  if (!tool) return <Navigate to="/" replace />;
  const { Component } = tool;
  return (
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  );
}
