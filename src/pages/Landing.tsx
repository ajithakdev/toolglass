import { motion, Variants } from 'framer-motion';
import { cloneElement, useState } from 'react';
import { tools, toolBySlug } from '../tools/registry';
import { useRecentTools } from '../hooks/useRecentTools';
import { ToolCard } from '../components/ui/ToolCard';
import { Link } from 'react-router-dom';
import { Clock, Filter, Grid2X2 } from 'lucide-react';

const CATEGORIES = [
  { name: 'Generators', slugs: ['uuid', 'nanoid', 'password', 'objectid', 'qr'] },
  { name: 'Encoders & Decoders', slugs: ['base64', 'url', 'jwt-decode'] },
  { name: 'Converters & Formatters', slugs: ['json', 'color', 'json-to-ts'] },
  { name: 'API & Networking', slugs: ['api-tester'] },
  { name: 'Security & Crypto', slugs: ['hash', 'jwt'] },
  { name: 'Utilities', slugs: ['timestamp', 'regex', 'markdown'] }
];

function RecentPill({ tool }: { tool: any }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="glass"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px 8px 12px',
        borderRadius: 999,
        textDecoration: 'none',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
        {cloneElement(tool.icon as React.ReactElement, { size: 14, strokeWidth: 2 } as any)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{tool.title}</div>
    </Link>
  );
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function Landing() {
  const { recents } = useRecentTools();
  const recentTools = recents.map(toolBySlug).filter(Boolean);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Dot grid background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', paddingTop: 16 }}
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          style={{
            display: 'inline-flex',
            padding: '6px 16px',
            borderRadius: 999,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--ink-soft)',
            marginBottom: 16,
            cursor: 'default',
            letterSpacing: '0.02em'
          }}
        >
          All client-side · No data leaves your browser
        </motion.div>

        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(32px, 7vw, 64px)',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          <span className="gradient-text">Toolglass</span>
        </h1>

        <p
          style={{
            margin: '12px auto 0',
            maxWidth: 520,
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: 'var(--ink-soft)',
            lineHeight: 1.5,
          }}
        >
          Frosted developer utilities — generate, encode, format — beautifully, entirely in your browser.
        </p>
      </motion.header>

      {/* Recently used */}
      {recentTools.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Clock size={14} strokeWidth={2} color="var(--ink-mute)" />
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Recent
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {recentTools.map((t) => (
              t && (
                <motion.div key={`recent-${t.slug}`} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <RecentPill tool={t} />
                </motion.div>
              )
            ))}
          </div>
        </motion.section>
      )}

      {/* Dynamic Filter Navigation Bar */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Filter size={14} strokeWidth={2} color="var(--ink-mute)" />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Filter Category
          </div>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          paddingBottom: 8, 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            className="glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeCategory === 'all' ? 'var(--accent)' : 'var(--glass-bg)',
              color: activeCategory === 'all' ? '#fff' : 'var(--ink)',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Grid2X2 size={13} />
            All Utilities
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className="glass"
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeCategory === cat.name ? 'var(--accent)' : 'var(--glass-bg)',
                color: activeCategory === cat.name ? '#fff' : 'var(--ink)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Tool Grid layout */}
      <motion.div 
        key={activeCategory}
        initial="hidden" 
        animate="show" 
        variants={stagger}
        style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
      >
        {CATEGORIES.map((cat) => {
          if (activeCategory !== 'all' && activeCategory !== cat.name) return null;
          const catTools = tools.filter((t) => cat.slugs.includes(t.slug));
          if (catTools.length === 0) return null;

          return (
            <motion.section key={cat.name} variants={fadeUp} style={{ marginBottom: 16 }}>
              {activeCategory === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {cat.name}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                </div>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                  gap: 16,
                }}
              >
                {catTools.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </div>
  );
}
