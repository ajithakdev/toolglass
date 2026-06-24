import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CommandPalette } from './components/CommandPalette';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { Landing } from './pages/Landing';
import { ToolPage } from './pages/ToolPage';
import { ToastProvider } from './components/ui/Toast';
import { useTheme } from './hooks/useTheme';
import { useToolStats } from './hooks/useToolStats';

function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
      }}
      style={{
        padding: '7px 12px',
        borderRadius: 10,
        background: 'var(--surface-button-off)',
        border: '1px solid var(--glass-border)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--ink)',
        cursor: 'pointer',
      }}
    >
      ↓ Install
    </button>
  );
}

function Shell({ children, onOpenPalette }: { children: React.ReactNode; onOpenPalette: () => void }) {
  const { enabled, toggleTelemetry } = useToolStats();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip to content — clip-based hide avoids horizontal scrollbar */}
      <a
        href="#main"
        className="skip-link"
        style={{
          position: 'absolute',
          top: -100,
          left: 16,
          zIndex: 99999,
          padding: '8px 16px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: 14,
          transition: 'top 0.15s ease',
        }}
        onFocus={(e) => { (e.currentTarget as HTMLAnchorElement).style.top = '16px'; }}
        onBlur={(e) => { (e.currentTarget as HTMLAnchorElement).style.top = '-100px'; }}
      >
        Skip to content
      </a>
      <nav
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1120,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}
          >
            ✦
          </span>
          <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Toolglass</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            id="open-command-palette"
            onClick={onOpenPalette}
            aria-label="Open command palette (Ctrl+K)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 10,
              background: 'var(--surface-nav-item)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--glass-border)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              transition: 'background 0.18s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            🔍
            <span>Search tools</span>
            <kbd
              style={{
                fontSize: 11,
                padding: '2px 5px',
                borderRadius: 5,
                background: 'var(--kbd-bg)',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--kbd-border)',
                color: 'var(--ink-mute)',
              }}
            >
              ⌘K
            </kbd>
          </button>
          <InstallPwaButton />
          <ThemeToggle />
          <a
            href="https://github.com/ajithakdev/toolglass"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}
          >
            GitHub ↗
          </a>
        </div>
      </nav>
      <main
        id="main"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          padding: '16px 24px 32px',
        }}
      >
        {children}
      </main>
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '16px 24px',
          fontSize: 12,
          color: 'var(--ink-mute)',
        }}
      >
        <span>Built client-side · No tracking · No data leaves your browser</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'var(--surface-nav-item)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
          <input type="checkbox" checked={enabled} onChange={toggleTelemetry} style={{ accentColor: '#8b5cf6' }} />
          <span>Local Usage Stats</span>
        </label>
      </footer>
    </div>
  );
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Initialize theme on app mount (reads localStorage / OS pref)
  useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ToastProvider>
      <Shell onOpenPalette={() => setPaletteOpen(true)}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Shell>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </ToastProvider>
  );
}
