import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tools } from '../tools/registry';

export function Landing() {
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
            background: 'rgba(255,255,255,0.6)',
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
          <motion.div
            key={t.slug}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Link
              to={`/tools/${t.slug}`}
              className="glass"
              style={{
                display: 'block',
                padding: 22,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: t.tint,
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
                    background: 'rgba(255,255,255,0.75)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                  }}
                >
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {t.short}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
