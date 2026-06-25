import { motion } from 'framer-motion';
import { cloneElement } from 'react';
import { tools, toolBySlug } from '../tools/registry';
import { useRecentTools } from '../hooks/useRecentTools';
import { ToolCard } from '../components/ui/ToolCard';
import { Link } from 'react-router-dom';

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
        gap: 10,
        padding: '8px 16px',
        borderRadius: 999,
        textDecoration: 'none',
        background: 'var(--surface-button-off)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cloneElement(tool.icon as React.ReactElement, { size: 16, strokeWidth: 2 } as any)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{tool.title}</div>
    </Link>
  );
}

export function Landing() {
  const { recents } = useRecentTools();
  const recentTools = recents.map(toolBySlug).filter(Boolean);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 64 }}>
      {/* Minimal grid background */}
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

      <motion.header
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', paddingTop: '3vh' }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'inline-flex',
            padding: '8px 20px',
            borderRadius: 999,
            background: 'var(--surface-palette)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--accent)',
            marginBottom: 24,
            cursor: 'default'
          }}
        >
          ✨ All client-side · No data leaves your browser
        </motion.div>
        
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(36px, 8vw, 84px)',
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            position: 'relative',
          }}
        >
          <span className="gradient-text" style={{ filter: 'drop-shadow(0 0 24px rgba(139, 92, 246, 0.4))' }}>
            Toolglass
          </span>
        </h1>
        
        <p
          style={{
            margin: '24px auto 0',
            maxWidth: 640,
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--ink-soft)',
            lineHeight: 1.6,
            fontWeight: 500
          }}
        >
          Frosted developer utilities. Generate, encode, format — beautifully, instantly,
          entirely in your browser.
        </p>
      </motion.header>

      {recentTools.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '0 8px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Jump Back In
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '0 8px' }}>
            {recentTools.map((t) => (
              t && (
                <motion.div key={`recent-${t.slug}`} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <RecentPill tool={t} />
                </motion.div>
              )
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
        }}
      >
        {CATEGORIES.map((cat) => {
          const catTools = tools.filter((t) => cat.slugs.includes(t.slug));
          if (catTools.length === 0) return null;
          
          return (
            <motion.div 
              key={cat.name} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
              }}
              style={{ marginBottom: 40 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '0 8px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {cat.name}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: 20,
                  padding: '0 8px'
                }}
              >
                {catTools.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.section>
    </div>
  );
}
