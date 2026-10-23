import { interpolate, m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, Braces, FileText, Globe2, Heading, Image, KeyRound, NotebookPen, Pipette, QrCode, Ruler, Type, Video } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HeroSearch } from '../components/home/HeroSearch';
import { Logo } from '../components/Logo';
import { Kbd } from '../components/Shell';
import { Segmented } from '../components/ui/Segmented';
import { ToolCard } from '../components/ui/ToolCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useThirdPartyCount } from '../hooks/useThirdPartyCount';
import { EASE_OUT, fadeUp, stagger } from '../lib/motion';
import { shortcut } from '../lib/platform';
import { AUDIENCES, type Audience } from '../tools/catalog';
import { toolBySlug, tools, type ToolMeta } from '../tools/registry';

/**
 * Scroll-linked value computed in JS. Framer would otherwise hand plain
 * scroll-to-opacity maps to the browser's native scroll timeline, which maps
 * pinned sections wrongly (elements faded back out mid-scene).
 */
function useRange<T extends number | string>(p: MotionValue<number>, input: number[], output: T[]) {
  const map = interpolate(input, output);
  return useTransform(() => map(p.get()));
}

const GlassScene = lazy(() => import('../components/home/GlassScene'));

/* ── Act 1: hero ─────────────────────────────────────────────── */

const POPULAR = [
  ['password', 'Password'],
  ['qr', 'QR code'],
  ['json', 'JSON'],
  ['timestamp', 'Timestamp'],
  ['case-converter', 'Text case'],
  ['color', 'Color'],
]
  .map(([slug, label]) => ({ ...toolBySlug(slug!)!, label: label! }))
  .filter((t) => t.slug);

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const progress = useCallback(() => scrollYProgress.get(), [scrollYProgress]);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  // Copy drifts up slower than the page: the glass reads as further away
  const copyY = useRange(scrollYProgress, [0, 1], [0, -60]);
  const copyOpacity = useRange(scrollYProgress, [0.35, 0.9], [1, 0]);

  return (
    <section ref={ref} className="hero container" aria-labelledby="hero-h">
      <m.div style={{ y: copyY, opacity: copyOpacity, position: 'relative', zIndex: 2 }}>
      <m.div className="hero-copy" initial="hidden" animate="show" variants={stagger(0.08, 0.1)}>
        <m.h1 id="hero-h" variants={fadeUp} className="hero-title">
          Every small tool, <span style={{ color: 'var(--accent)' }}>in one tab.</span>
        </m.h1>
        <m.p variants={fadeUp} className="hero-sub">
          Free, private tools that run in your browser. No sign-up, no uploads, no ads.
        </m.p>
        <m.div variants={fadeUp} style={{ width: '100%' }}>
          <HeroSearch />
        </m.div>
        <m.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)', marginRight: 2 }}>Popular</span>
          {POPULAR.map((t) => (
            <Link key={t.slug} to={`/tools/${t.slug}`} className="try-chip">
              <span className="try-chip-icon">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </m.div>
      </m.div>
      </m.div>

      <div className="hero-stage">
        {/* Poster: the logo as flat glass, shown until the 3D scene has drawn a frame */}
        <m.div
          aria-hidden
          animate={{ opacity: ready ? 0 : 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}
        >
          <div style={{ filter: 'drop-shadow(0 30px 60px rgba(22,34,51,0.25))' }}>
            <Logo size={240} />
          </div>
        </m.div>
        <m.div animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE_OUT }} style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <GlassScene progress={progress} onReady={onReady} />
          </Suspense>
        </m.div>
      </div>
    </section>
  );
}

/* ── Acts 2 and 3: the clutter, then one toolbar ─────────────── */

const CLUTTER: { icon: ReactNode; what: string; catch: string; x: number; y: number }[] = [
  { icon: <Image size={18} />, what: 'An image compressor', catch: 'Uploads your photo to its server', x: -36, y: -6 },
  { icon: <Pipette size={18} />, what: 'A color picker extension', catch: 'Can read every site you visit', x: -12, y: -4 },
  { icon: <FileText size={18} />, what: 'A PDF merge site', catch: 'Free until the second file', x: 13, y: -7 },
  { icon: <Braces size={18} />, what: 'A JSON formatter', catch: 'Wants you to sign in first', x: 37, y: -3 },
  { icon: <Globe2 size={18} />, what: 'A time zone converter', catch: 'An ad between every step', x: -39, y: 13 },
  { icon: <Type size={18} />, what: 'A word counter', catch: 'Sends your text to its server', x: -16, y: 16 },
  { icon: <Ruler size={18} />, what: 'A unit converter', catch: 'Full-screen ads on mobile', x: 16, y: 12 },
  { icon: <QrCode size={18} />, what: 'A QR code maker', catch: 'Codes stop working without a plan', x: 39, y: 15 },
  { icon: <Video size={18} />, what: 'A screen recorder extension', catch: 'Watermarks unless you upgrade', x: -34, y: 32 },
  { icon: <KeyRound size={18} />, what: 'A password generator', catch: 'You hope it is not logging them', x: -10, y: 35 },
  { icon: <NotebookPen size={18} />, what: 'An online notepad', catch: 'Needs an account to save', x: 13, y: 31 },
  { icon: <Heading size={18} />, what: 'A Markdown editor', catch: 'One more app to install', x: 36, y: 34 },
];

const TOOLBAR = ['password', 'qr', 'json', 'timestamp', 'color', 'hash', 'markdown', 'case-converter']
  .map(toolBySlug)
  .filter((t): t is ToolMeta => !!t);

function ClutterCard({ item, i, p, narrow }: { item: (typeof CLUTTER)[number]; i: number; p: MotionValue<number>; narrow: boolean }) {
  const start = i * 0.026;
  // Phones get a zigzag down the screen instead of the wide desktop scatter
  const px = narrow ? (i % 2 ? 7 : -7) : item.x;
  const py = narrow ? -4 + i * 4 : item.y;
  const opacity = useRange(p, [start, start + 0.08, 0.5, 0.64], [0, 1, 1, 0]);
  const scale = useRange(p, [start, start + 0.08, 0.5, 0.64], [0.92, 1, 1, 0.4]);
  // Pulled into the glass at the centre
  const x = useRange(p, [0.46, 0.64], [`${px}vw`, '0vw']);
  const y = useRange(p, [0.46, 0.64], [`${py}vh`, '0vh']);
  const rotate = useRange(p, [start, 0.5], [(i % 2 ? 1 : -1) * 4, (i % 2 ? 1 : -1) * 2]);
  return (
    <m.div className="clutter-card glass" style={{ opacity, scale, x, y, rotate }}>
      <span className="clutter-icon">{item.icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.what}</span>
        <span style={{ fontSize: 'var(--t-xs)', color: 'var(--status-error)' }}>{item.catch}</span>
      </span>
    </m.div>
  );
}

function Collapse() {
  const ref = useRef<HTMLElement>(null);
  const narrow = useMediaQuery('(max-width: 640px)');
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Visible while the scene scrolls into place, so there is no dead scroll after the hero
  const beforeOpacity = useRange(p, [0, 0.46, 0.56], [1, 1, 0]);
  const afterOpacity = useRange(p, [0.62, 0.72], [0, 1]);
  const afterY = useRange(p, [0.62, 0.72], [16, 0]);
  const barScale = useRange(p, [0.58, 0.72], [0.6, 1]);
  const barOpacity = useRange(p, [0.58, 0.68], [0, 1]);
  const coreScale = useRange(p, [0.44, 0.62, 0.7], [0.8, 1.15, 0.6]);
  const coreOpacity = useRange(p, [0.42, 0.5, 0.66, 0.72], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="collapse" aria-label="Why one place">
      <div className="collapse-stage">
        <m.div className="collapse-head" style={{ opacity: beforeOpacity }}>
          <h2 className="act-title">Small jobs, scattered across the web.</h2>
          <p className="act-sub">Each one is another tab, another install, or another sign-up.</p>
        </m.div>

        {CLUTTER.map((c, i) => (
          <ClutterCard key={c.what} item={c} i={i} p={p} narrow={narrow} />
        ))}

        {/* The glass that takes it all in */}
        <m.div aria-hidden style={{ position: 'absolute', scale: coreScale, opacity: coreOpacity }}>
          <div style={{ filter: 'drop-shadow(0 20px 50px rgba(37,69,220,0.35))' }}>
            <Logo size={150} />
          </div>
        </m.div>

        <m.div className="collapse-after" style={{ opacity: afterOpacity, y: afterY }}>
          <h2 className="act-title">Now they live in one place.</h2>
          <p className="act-sub">The same jobs, in one bookmark. Nothing gets uploaded.</p>
        </m.div>

        <m.nav aria-label="Popular tools" className="toolbar glass-strong" style={{ scale: barScale, opacity: barOpacity }}>
          {TOOLBAR.map((t) => (
            <Link key={t.slug} to={`/tools/${t.slug}`} className="toolbar-item" title={t.title}>
              <span className="toolbar-icon">{t.icon}</span>
              <span className="toolbar-label">{t.title.split(' ')[0]}</span>
            </Link>
          ))}
        </m.nav>
      </div>
    </section>
  );
}

/** Reduced motion: the same story without pinning or travel. */
function CollapseStill() {
  return (
    <section className="container" style={{ paddingBlock: 'var(--section)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)', alignItems: 'center', textAlign: 'center' }}>
      <h2 className="act-title">Small jobs, scattered across the web. Now in one place.</h2>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', justifyContent: 'center', padding: 0, margin: 0, listStyle: 'none' }}>
        {CLUTTER.map((c) => (
          <li key={c.what} className="clutter-card glass" style={{ position: 'static' }}>
            <span className="clutter-icon">{c.icon}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{c.what}</span>
              <span style={{ fontSize: 'var(--t-xs)', color: 'var(--status-error)' }}>{c.catch}</span>
            </span>
          </li>
        ))}
      </ul>
      <nav aria-label="Popular tools" className="toolbar glass-strong" style={{ position: 'static' }}>
        {TOOLBAR.map((t) => (
          <Link key={t.slug} to={`/tools/${t.slug}`} className="toolbar-item" title={t.title}>
            <span className="toolbar-icon">{t.icon}</span>
            <span className="toolbar-label">{t.title.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

/* ── Act 4: for everyone ─────────────────────────────────────── */

function ForEveryone() {
  const options = AUDIENCES.filter((a) => tools.some((t) => t.audience.includes(a.id))).map((a) => ({
    value: a.id,
    label: a.id === 'everyone' ? 'Everyday' : a.name,
  }));
  const [aud, setAud] = useState<Audience>('everyone');
  const picks = useMemo(() => tools.filter((t) => t.audience.includes(aud)).slice(0, 6), [aud]);

  return (
    <section className="container" aria-labelledby="who-h" style={{ paddingBlock: 'var(--section)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <m.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15%' }} variants={stagger(0.08)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 680 }}>
        <m.h2 id="who-h" variants={fadeUp} className="act-title" style={{ textAlign: 'left' }}>
          Built for whoever has a browser open.
        </m.h2>
        <m.p variants={fadeUp} className="act-sub" style={{ textAlign: 'left', margin: 0 }}>
          Writers fixing text, designers checking colors, developers formatting JSON, anyone making a QR code for a menu.
        </m.p>
        <m.div variants={fadeUp} className="rail">
          <Segmented label="Show tools for" value={aud} options={options} onChange={setAud} />
        </m.div>
      </m.div>
      <m.div key={aud} className="tool-grid" initial="hidden" animate="show" variants={stagger(0.05)}>
        {picks.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </m.div>
      <Link to={`/tools?for=${aud}`} className="link" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 550 }}>
        See every tool for {options.find((o) => o.value === aud)?.label.toLowerCase()} <ArrowRight size={16} />
      </Link>
    </section>
  );
}

/* ── Act 5: proof ────────────────────────────────────────────── */

function Proof() {
  const count = useThirdPartyCount();
  return (
    <section className="container proof" aria-labelledby="proof-h">
      <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-20%' }} transition={{ duration: 0.3, ease: EASE_OUT }} className="proof-number">
        <span className="num" aria-hidden>{count ?? '?'}</span>
      </m.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <h2 id="proof-h" className="act-title" style={{ textAlign: 'left' }}>
          {count === null ? 'Your browser can\'t report requests to other servers.' : `${count === 1 ? 'Request' : 'Requests'} this page has sent to other servers.`}
        </h2>
        <p className="act-sub" style={{ textAlign: 'left', margin: 0 }}>
          Counted live by your own browser, not claimed by us. Open your developer tools and check.
        </p>
        <ul className="proof-list">
          <li>Works offline after your first visit.</li>
          <li>No account, no tracking, no analytics.</li>
          <li>
            Open source under the MIT license.{' '}
            <a className="link" href="https://github.com/ajithakdev/toolglass" target="_blank" rel="noreferrer">
              Read the code
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ── Act 6: ending ───────────────────────────────────────────── */

function Ending() {
  return (
    <section className="container" style={{ paddingBottom: 'var(--section)' }}>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="glass-strong ending"
      >
        <Logo size={56} />
        <h2 className="act-title">Bookmark it once.</h2>
        <p className="act-sub">
          Press <Kbd>{shortcut('D')}</Kbd> and the next small job is one click away.
        </p>
        <Link to="/tools" className="cta">
          Open the tools <ArrowRight size={18} />
        </Link>
      </m.div>
    </section>
  );
}

export function Home() {
  const reduce = useReducedMotion();
  return (
    <>
      <Hero />
      {reduce ? <CollapseStill /> : <Collapse />}
      <ForEveryone />
      <Proof />
      <Ending />
    </>
  );
}
