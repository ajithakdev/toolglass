import { m } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivacyMeter } from '../components/PrivacyMeter';
import { Kbd } from '../components/Shell';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { fadeUp, stagger } from '../lib/motion';
import { shortcut } from '../lib/platform';
import { STORED, type StoredGroup } from '../lib/stored';

const REPO = 'https://github.com/ajithakdev/toolglass';
const GROUPS: StoredGroup[] = ['Preferences', 'Tool data', 'API Tester'];
const SECTIONS = [
  ['privacy', 'How your data stays here'],
  ['stored', 'What is saved'],
  ['install', 'Install and use offline'],
  ['shortcuts', 'Keyboard shortcuts'],
  ['open-source', 'Open source'],
  ['version', 'Version'],
] as const;
const SHORTCUTS: [string, string][] = [
  [shortcut('K'), 'Open the command palette from any page'],
  ['/', 'Jump to search on the All tools page'],
  ['Backspace', 'Back to All tools from a tool, when you are not typing'],
  ['Alt Z', 'API Tester shortcut'],
];

// The section nearest the top of the screen is the active one
function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0][0]);
  useEffect(() => {
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)));
        // Last section that has started inside the upper band wins, so short final sections can become active
        const last = SECTIONS.filter(([id]) => inBand.has(id)).pop();
        if (last) setActive(last[0]);
      },
      { rootMargin: '-10% 0px -50% 0px' },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    // Footer on screen means the end of the page, where the last short sections never reach the band
    const footer = document.querySelector('footer');
    const end = new IntersectionObserver(([e]) => e?.isIntersecting && setActive(SECTIONS[SECTIONS.length - 1]![0]));
    if (footer) end.observe(footer);
    return () => {
      io.disconnect();
      end.disconnect();
    };
  }, []);
  return active;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <m.section id={id} variants={fadeUp} aria-labelledby={`${id}-h`} className="about-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <h2 id={`${id}-h`} style={{ margin: 0, fontSize: 'var(--t-xl)', fontWeight: 620 }}>
        {title}
      </h2>
      {children}
    </m.section>
  );
}

export function About() {
  const toast = useToast();
  const active = useActiveSection();
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
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <Link to="/tools" className="cta" style={{ alignSelf: 'flex-start' }}>
          Browse the tools
        </Link>
      </m.header>

      <div className="about-body">
      <Section id="privacy" title="How your data stays here">
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

      <Section id="stored" title="What is saved">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>Only these, in this browser's storage. Nothing is synced anywhere.</p>
        {GROUPS.map((g) => (
          <div key={g} className="glass" style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, padding: '10px 14px', fontSize: 'var(--t-xs)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{g}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--t-sm)' }}>
              <tbody>
                {STORED.filter((s) => s.group === g).map((s) => (
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
        ))}
        <div>
          <Button variant="soft" onClick={clearAll} disabled={present.length === 0}>
            <Trash2 size={16} /> Clear everything Toolglass saved
          </Button>
        </div>
      </Section>

      <Section id="install" title="Install and use offline">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          When your browser supports it, an Install button appears in the header. It adds Toolglass as an app with its own window. Either way, the whole site is cached
          after your first visit, so every tool still opens with no connection.
        </p>
      </Section>

      <Section id="shortcuts" title="Keyboard shortcuts">
        <div className="glass" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--t-sm)' }}>
            <tbody>
              {SHORTCUTS.map(([keys, what], i) => (
                <tr key={keys} style={{ borderTop: i ? '1px solid var(--border)' : undefined }}>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <Kbd>{keys}</Kbd>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }}>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="open-source" title="Open source">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          The code is on{' '}
          <a href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          under the MIT license. Missing a tool you use?{' '}
          <a href={`${REPO}/issues/new/choose`} target="_blank" rel="noreferrer">
            Request it
          </a>
          , or{' '}
          <a href={`${REPO}/blob/main/.github/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
            add it yourself
          </a>
          .
        </p>
      </Section>

      <Section id="version" title="Version">
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          You are running Toolglass <span className="num">{__APP_VERSION__}</span>. See{' '}
          <a href={`${REPO}/releases`} target="_blank" rel="noreferrer">
            what changed in each release
          </a>{' '}
          or read the{' '}
          <a href={`${REPO}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
            changelog
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
