import { Link, Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { ToolPage } from './pages/ToolPage';
import { ToastProvider } from './components/ui/Toast';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          padding: '18px 24px',
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
        <a
          href="https://github.com/ajithakdev/password-generator-v1"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}
        >
          GitHub ↗
        </a>
      </nav>
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          padding: '24px 24px 80px',
        }}
      >
        {children}
      </main>
      <footer
        style={{
          textAlign: 'center',
          padding: '24px',
          fontSize: 12,
          color: 'var(--ink-mute)',
        }}
      >
        Built client-side · No tracking · No data leaves your browser
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Shell>
    </ToastProvider>
  );
}
