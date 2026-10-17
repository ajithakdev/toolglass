import { motion } from 'framer-motion';
import { Download, Search } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useToolStats } from '../hooks/useToolStats';
import { spring } from '../lib/motion';
import { IS_MAC, shortcut } from '../lib/platform';
import { Logo } from './Logo';
import { PrivacyMeter } from './PrivacyMeter';
import { ThemeToggle } from './ui/ThemeToggle';


export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        lineHeight: '16px',
        padding: '0 5px',
        borderRadius: 5,
        background: 'var(--kbd-bg)',
        border: '1px solid var(--kbd-border)',
        color: 'var(--ink-mute)',
      }}
    >
      {children}
    </kbd>
  );
}

function GithubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function InstallButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prompt, setPrompt] = useState<any>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!prompt) return null;
  return (
    <button
      className="hide-sm nav-btn"
      onClick={async () => {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') setPrompt(null);
      }}
    >
      <Download size={15} strokeWidth={1.9} />
      Install
    </button>
  );
}

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/tools', label: 'Tools', end: false },
  { to: '/about', label: 'About', end: false },
];

function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        paddingBottom: 10,
        transition: 'background-color var(--dur-3) var(--ease-out), box-shadow var(--dur-3) var(--ease-out)',
        background: scrolled ? 'color-mix(in srgb, var(--canvas) 72%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'var(--blur)' : 'none',
        WebkitBackdropFilter: scrolled ? 'var(--blur)' : 'none',
        boxShadow: scrolled ? '0 1px 0 var(--border)' : 'none',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
        <Link to="/" aria-label="Toolglass home" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <span className="hide-sm" style={{ fontWeight: 650, fontSize: 'var(--t-md)', letterSpacing: '-0.02em' }}>
            Toolglass
          </span>
        </Link>

        <nav aria-label="Main" style={{ display: 'flex', gap: 2, marginLeft: 'var(--s-3)' }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav-link">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      transition={spring}
                      aria-hidden
                      style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--surface-2)', boxShadow: 'var(--edge)' }}
                    />
                  )}
                  <span style={{ position: 'relative', color: isActive ? 'var(--ink)' : undefined }}>{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
          <button id="open-command-palette" className="nav-btn search-btn" onClick={onOpenPalette} aria-label={`Search tools (${IS_MAC ? 'Command' : 'Control'} K)`}>
            <Search size={15} strokeWidth={1.9} />
            <span className="hide-sm">Search tools</span>
            <span className="hide-sm" style={{ marginLeft: 6 }}>
              <Kbd>{shortcut('K')}</Kbd>
            </span>
          </button>
          <InstallButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { enabled, toggleTelemetry } = useToolStats();
  return (
    <footer className="container" style={{ paddingBlock: 'var(--s-8) var(--s-6)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--s-4)',
          paddingTop: 'var(--s-5)',
          borderTop: '1px solid var(--border)',
          fontSize: 'var(--t-xs)',
          color: 'var(--ink-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={18} />
          <span>Free tools that run in your browser. Open source, MIT.</span>
        </div>
        <PrivacyMeter />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={enabled} onChange={toggleTelemetry} style={{ accentColor: 'var(--accent)' }} />
            Count my usage (stays on this device)
          </label>
          <a href="https://github.com/ajithakdev/toolglass" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <GithubMark /> GitHub
          </a>
          <a href="https://ajithakdev.com" target="_blank" rel="noreferrer author">
            by ajithakdev
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children, onOpenPalette }: { children: ReactNode; onOpenPalette: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header onOpenPalette={onOpenPalette} />
      <main id="main" style={{ flex: 1, width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
