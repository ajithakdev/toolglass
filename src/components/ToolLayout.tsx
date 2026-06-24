import { motion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          navigate('/');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

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
            gap: 8,
            padding: '6px 10px 6px 12px',
            borderRadius: 10,
            background: 'var(--surface-nav-item)',
            border: '1px solid var(--divider)',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.background = 'var(--surface-button-off)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ink-soft)';
            e.currentTarget.style.background = 'var(--surface-nav-item)';
          }}
        >
          Back
          <kbd
            style={{
              fontSize: 10,
              padding: '2px 5px',
              borderRadius: 5,
              background: 'var(--kbd-bg)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--kbd-border)',
              color: 'var(--ink-mute)',
            }}
          >
            backspace
          </kbd>
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
            boxShadow: 'var(--icon-highlight)',
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
