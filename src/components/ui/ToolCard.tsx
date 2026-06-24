import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ToolMeta } from '../../tools/registry';

export function ToolCard({ tool }: { tool: ToolMeta }) {
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
