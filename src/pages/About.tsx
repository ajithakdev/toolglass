import { m } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivacyMeter } from '../components/PrivacyMeter';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { fadeUp, stagger } from '../lib/motion';
import { STORED } from '../lib/stored';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <m.section variants={fadeUp} aria-labelledby={id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <h2 id={id} style={{ margin: 0, fontSize: 'var(--t-xl)', fontWeight: 620 }}>
        {title}
      </h2>
      {children}
    </m.section>
  );
}

export function About() {
  const toast = useToast();
  const [present, setPresent] = useState(() => STORED.filter(safeHas).map((s) => s.key));

  const clearAll = () => {
    STORED.forEach((s) => {
      try {
        (s.session ? sessionStorage : localStorage).removeItem(s.key);
      } catch {
        // storage blocked: nothing stored either
      }
    });
    setPresent([]);
    toast.push('Cleared. Reload to reset everything on this page.', 'success');
  };

  return (
    <m.article
      initial="hidden"
      animate="show"
      variants={stagger(0.07)}
      className="prose about-grid"
    >
      <m.header variants={fadeUp} className="about-intro">
        <h1 style={{ margin: 0, fontSize: 'clamp(34px, 2.8vw, 44px)', lineHeight: 1.02, letterSpacing: 'var(--track-tight)', fontWeight: 650 }}>
          Small tools, kept on your side of the screen.
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--t-lg)', color: 'var(--ink-soft)' }}>
          Toolglass collects the small utilities people reach for every week, so you don't need an extension, an app, or a sign-up for each one.
        </p>
        <nav aria-label="On this page" className="about-toc">
          <a href="#privacy">How your data stays here</a>
          <a href="#stored">What is saved</a>
          <a href="#open-source">Open source</a>
        </nav>
        <Link to="/tools" className="cta" style={{ alignSelf: 'flex-start' }}>
          Browse the tools
        </Link>
      </m.header>

      <div className="about-body">
      <Section id="privacy" title="How your data stays on your device">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          Every tool runs in your browser with standard Web APIs. There is no Toolglass server that sees your text, files, or passwords, because there is no
          server at all: the site is static files.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>No analytics, no ads, no tracking scripts. Fonts are hosted here too.</li>
          <li>After your first visit the app is cached, so it works offline.</li>
          <li>The API Tester sends only the requests you send, straight from your browser. It never saves passwords or tokens.</li>
          <li>Random values (passwords, IDs) come from your browser's cryptographic generator.</li>
        </ul>
        <div className="glass" style={{ padding: 'var(--s-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', alignItems: 'center', justifyContent: 'space-between' }}>
          <PrivacyMeter />
          <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>Live, measured by your browser.</span>
        </div>
      </Section>

      <Section id="stored" title="What is saved on this device">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>Only these, in this browser's storage. Nothing is synced anywhere.</p>
        <div className="glass" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--t-sm)' }}>
            <tbody>
              {STORED.map((s) => (
                <tr key={s.key} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }}>{s.what}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', color: present.includes(s.key) ? 'var(--ink)' : 'var(--ink-mute)' }}>
                    {present.includes(s.key) ? 'Saved' : 'Nothing saved'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <Button variant="soft" onClick={clearAll} disabled={present.length === 0}>
            <Trash2 size={16} /> Clear everything Toolglass saved
          </Button>
        </div>
      </Section>

      <Section id="open-source" title="Open source">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          The code is on{' '}
          <a href="https://github.com/ajithakdev/toolglass" target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          under the MIT license. Missing a tool you use?{' '}
          <a href="https://github.com/ajithakdev/toolglass/issues/new?template=feature_request.yml&labels=enhancement,new%20tool" target="_blank" rel="noreferrer">
            Request it
          </a>
          , or{' '}
          <a href="https://github.com/ajithakdev/toolglass/blob/main/.github/CONTRIBUTING.md" target="_blank" rel="noreferrer">
            add it yourself
          </a>
          .
        </p>
      </Section>
      </div>
    </m.article>
  );
}

function safeHas({ key, session }: { key: string; session?: true }) {
  try {
    return (session ? sessionStorage : localStorage).getItem(key) !== null;
  } catch {
    return false;
  }
}
