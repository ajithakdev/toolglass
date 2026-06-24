import { motion } from 'framer-motion';
import { tools, toolBySlug } from '../tools/registry';
import { useRecentTools } from '../hooks/useRecentTools';
import { ToolCard } from '../components/ui/ToolCard';

export function Landing() {
  const { recents } = useRecentTools();
  const recentTools = recents.map(toolBySlug).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ textAlign: 'center', paddingTop: 24 }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--surface-pill)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--ink-soft)',
            marginBottom: 18,
          }}
        >
          ✨ All client-side · No data leaves your browser
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          <span className="gradient-text">Toolglass</span>
        </h1>
        <p
          style={{
            margin: '14px auto 0',
            maxWidth: 580,
            fontSize: 16,
            color: 'var(--ink-soft)',
          }}
        >
          Frosted developer utilities. Generate, encode, format — beautifully, instantly,
          entirely in your browser.
        </p>
      </motion.header>

      {recentTools.length > 0 && (
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          style={{ marginBottom: 12 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 16, paddingLeft: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recently Used
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {recentTools.map((t) => (
              t && <ToolCard key={`recent-${t.slug}`} tool={t} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18,
        }}
      >
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </motion.section>
    </div>
  );
}
