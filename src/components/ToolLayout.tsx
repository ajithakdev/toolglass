import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard';

export function ToolLayout({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ink-soft)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← All tools
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            fontSize: 32,
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'var(--grad-soft)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {icon}
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 14 }}>
            {description}
          </p>
        </div>
      </div>

      <GlassCard strong padding={28}>
        {children}
      </GlassCard>
    </motion.div>
  );
}
