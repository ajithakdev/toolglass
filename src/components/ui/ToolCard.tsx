import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ToolMeta } from '../../tools/registry';
import { useToolStats } from '../../hooks/useToolStats';

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const { allStats, enabled } = useToolStats();
  const count = allStats[tool.slug] || 0;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/tools/${tool.slug}`}
        className="glass"
        style={{
          display: 'block',
          padding: 22,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.25s ease',
          textDecoration: 'none',
        }}
      >
        {enabled && count > 0 && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: 11,
            fontWeight: 700,
            background: 'var(--surface-nav-item)',
            border: '1px solid var(--glass-border)',
            padding: '2px 8px',
            borderRadius: 999,
            color: 'var(--ink-mute)',
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          }}>
            {count} ×
          </div>
        )}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: tool.tint,
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              fontSize: 28,
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'var(--surface-icon-bg)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--icon-highlight)',
            }}
          >
            {tool.icon}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              {tool.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
              {tool.short}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
