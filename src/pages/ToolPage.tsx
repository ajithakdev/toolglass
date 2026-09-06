import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toolBySlug } from '../tools/registry';
import { useRecentTools } from '../hooks/useRecentTools';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { NotFound } from './NotFound';

/* ── Cycling phrases shown while the tool chunk loads ────────────── */
const PHRASES = [
  'Crafting your workspace…',
  'Sketching the interface…',
  'Mixing up the tools…',
  'Warming things up…',
  'Almost there…',
];

/* ── Animated loader ─────────────────────────────────────────────── */
function Loader() {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '62vh',
        gap: 28,
        userSelect: 'none',
      }}
    >
      {/* ── Spinning arc + ✦ centre ─────────────────────────────── */}
      <div style={{ position: 'relative', width: 76, height: 76 }}>

        {/* Rotating gradient arc */}
        <motion.svg
          width="76"
          height="76"
          viewBox="0 0 76 76"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden
        >
          <defs>
            <linearGradient id="tg-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#c4b5fd" />
              <stop offset="50%"  stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="38" cy="38" r="33"
            fill="none"
            stroke="var(--divider)"
            strokeWidth="3"
          />
          {/* Spinning arc — partial circle */}
          <circle
            cx="38" cy="38" r="33"
            fill="none"
            stroke="url(#tg-loader-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="105 103"
            strokeDashoffset="0"
            transform="rotate(-90 38 38)"
          />
        </motion.svg>

        {/* ✦ symbol — gentle breathing pulse */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Loading"
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: '50%',
            background: 'var(--grad)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 21,
            boxShadow: '0 0 28px rgba(139, 92, 246, 0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          ✦
        </motion.div>
      </div>

      {/* ── Cycling phrase ────────────────────────────────────────── */}
      <div style={{ height: 22, display: 'flex', alignItems: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIdx}
            initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(6px)', y: -8 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink-soft)',
              letterSpacing: '-0.01em',
            }}
          >
            {PHRASES[phraseIdx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
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
