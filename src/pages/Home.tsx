import { interpolate, m, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, Braces, Calculator, Clock, Image, Palette, QrCode, ShieldCheck, Type, FileText, type LucideIcon } from 'lucide-react';
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSearch } from '../components/home/HeroSearch';
import { FavoritesRail, RecentRail } from '../components/ToolRails';
import { Logo } from '../components/Logo';
import { Kbd } from '../components/Shell';
import { ToolCard } from '../components/ui/ToolCard';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { useThirdPartyCount } from '../hooks/useThirdPartyCount';
import { EASE_OUT, fadeUp, stagger } from '../lib/motion';
import { shortcut } from '../lib/platform';
import { CATEGORIES } from '../tools/catalog';
import { toolBySlug, toolsInCategory, type ToolMeta } from '../tools/registry';

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
// The scene is kept between visits: once it has drawn, coming back to Home skips the poster and the fade
let sceneShown = false;

/* ── Act 1: hero ─────────────────────────────────────────────── */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const progress = useCallback(() => scrollYProgress.get(), [scrollYProgress]);
  const [ready, setReady] = useState(sceneShown);
  const onReady = useCallback(() => {
    sceneShown = true;
    setReady(true);
  }, []);
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
      </m.div>
      </m.div>

      <div className="hero-stage">
        {/* Poster: the logo as flat glass, shown until the 3D scene has drawn a frame */}
        <m.div
          aria-hidden
          initial={false}
          animate={{ opacity: ready ? 0 : 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}
        >
          <div style={{ filter: 'drop-shadow(0 30px 60px rgba(22,34,51,0.25))' }}>
            <Logo size={200} />
          </div>
        </m.div>
        <m.div initial={false} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE_OUT }} style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <GlassScene progress={progress} onReady={onReady} />
          </Suspense>
        </m.div>
      </div>
    </section>
  );
}

/* Right under the hero: your own tools if you have any, otherwise the popular ones */
const POPULAR_GRID = ['password', 'qr', 'json', 'timestamp', 'case-converter', 'color', 'hash', 'markdown']
  .map(toolBySlug)
  .filter((t): t is ToolMeta => !!t);

function QuickAccess() {
  const { favorites } = useFavorites();
  const { recents } = useRecentTools();
  // Decided once on mount: starring a card in the Popular grid must not swap the section under the pointer
  const [mine] = useState(() => favorites.length + recents.length > 0);
  return (
    <section className="container home-section" aria-label="Quick access">
      {mine ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
          <FavoritesRail />
          <RecentRail />
        </div>
      ) : (
        <>
          <h2 className="section-label">Popular</h2>
          <div className="tool-grid">
            {POPULAR_GRID.map((t) => (
              <ToolCard key={t.slug} tool={t} compact />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ── Browse by category ──────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  images: Image,
  pdf: FileText,
  text: Type,
  calculators: Calculator,
  time: Clock,
  media: QrCode,
  security: ShieldCheck,
  developers: Braces,
  design: Palette,
};

const categoryTiles = CATEGORIES.map((c) => ({ ...c, items: toolsInCategory(c.id) })).filter((c) => c.items.length > 0);

function Categories() {
  return (
    <section className="container home-section" aria-labelledby="cats-h">
      <h2 id="cats-h" className="section-label">Browse by category</h2>
      <div className="cat-grid">
        {categoryTiles.map((c) => {
          const Icon = CATEGORY_ICONS[c.id] ?? Braces;
          return (
            <div key={c.id} className="cat-tile glass">
              <Link to={`/tools#cat-${c.id}`} className="cat-tile-main">
                <span className="clutter-icon"><Icon size={18} /></span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{c.items.length} {c.items.length === 1 ? 'tool' : 'tools'}</span>
                </span>
              </Link>
              <ul className="cat-links">
                {c.items.slice(0, 3).map((t) => (
                  <li key={t.slug}>
                    <Link to={`/tools/${t.slug}`} className="pill">{t.title}</Link>
                  </li>
                ))}
                {c.items.length > 3 && (
                  <li>
                    <Link to={`/tools#cat-${c.id}`} className="pill">+{c.items.length - 3} more</Link>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Instead of ──────────────────────────────────────────────── */

const INSTEAD: { what: string; catch: string; slug: string }[] = [
  { what: 'An image compressor', catch: 'Uploads your photo to its server', slug: 'image-compress' },
  { what: 'A color picker extension', catch: 'Can read every site you visit', slug: 'color' },
  { what: 'A JSON formatter', catch: 'Wants you to sign in first', slug: 'json' },
  { what: 'A time zone converter', catch: 'An ad between every step', slug: 'world-clock' },
  { what: 'A word counter', catch: 'Sends your text to its server', slug: 'word-counter' },
  { what: 'A unit converter', catch: 'Full-screen ads on mobile', slug: 'unit-converter' },
  { what: 'A QR code maker', catch: 'Codes stop working without a plan', slug: 'qr' },
  { what: 'A screen recorder extension', catch: 'Watermarks unless you upgrade', slug: 'screen-recorder' },
  { what: 'A password generator', catch: 'You hope it is not logging them', slug: 'password' },
  { what: 'An online notepad', catch: 'Needs an account to save', slug: 'notepad' },
  { what: 'A Markdown editor', catch: 'One more app to install', slug: 'markdown' },
].filter((c) => toolBySlug(c.slug));

function InsteadOf() {
  return (
    <section className="container home-section" aria-labelledby="instead-h">
      <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.3, ease: EASE_OUT }} className="board">
        <div className="board-center">
          <h2 id="instead-h" className="act-title" style={{ fontSize: 'var(--t-2xl)', maxWidth: '18ch' }}>
            Small jobs, scattered across the web. Now in one place.
          </h2>
          <p className="act-sub" style={{ margin: 0, fontSize: 'var(--t-md)' }}>These are the tools they replace.</p>
          <Link to="/tools" className="cta">
            Open the tools <ArrowRight size={18} />
          </Link>
        </div>
        <ul className="board-tags">
          {INSTEAD.map((c) => (
            <li key={c.slug}>
              <Link to={`/tools/${c.slug}`} className="tag">
                <span className="tag-text">
                  <span className="tag-what">{c.what}</span>
                  <span className="tag-catch">{c.catch}</span>
                  <span className="sr-only">Use {toolBySlug(c.slug)!.title} instead</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </m.div>
    </section>
  );
}

/* ── Act 5: proof ────────────────────────────────────────────── */

function Proof() {
  const count = useThirdPartyCount();
  // null: not measured yet or unsupported. Show a dimmed 0, never an invented figure.
  const dot = count === null ? 'var(--ink-mute)' : count === 0 ? 'var(--status-success)' : 'var(--status-warn)';
  return (
    <section className="container home-section" aria-labelledby="proof-h">
      <div className="proof glass">
        <div className="proof-stat">
          <div className={count === null ? 'proof-number proof-number-dim' : 'proof-number'}>
            <span className="num" aria-hidden>{count ?? '-'}</span>
          </div>
          <span className="proof-label" role="status">
            <span aria-hidden className="status-dot" style={{ '--dot': dot } as React.CSSProperties} />
            <span>requests to other servers from this tab</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <h2 id="proof-h" className="act-title" style={{ textAlign: 'left', fontSize: 'var(--t-2xl)' }}>
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
      </div>
    </section>
  );
}

/* ── Act 6: ending ───────────────────────────────────────────── */

function Ending() {
  return (
    <section className="container home-section" style={{ paddingBottom: 'var(--home-gap)' }}>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="glass-strong ending"
      >
        <Logo size={44} />
        <h2 className="act-title" style={{ fontSize: 'var(--t-2xl)' }}>Bookmark it once.</h2>
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
  return (
    <>
      <Hero />
      <QuickAccess />
      <Categories />
      <InsteadOf />
      <Proof />
      <Ending />
    </>
  );
}
