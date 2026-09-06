import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, Search, Compass, AlertCircle } from 'lucide-react';
import { tools, type ToolMeta } from '../tools/registry';
import { ToolCard } from '../components/ui/ToolCard';

interface NotFoundProps {
  attemptedSlug?: string;
  isToolNotFound?: boolean;
}

// Lightweight similarity score for fuzzy suggestions
function scoreToolMatch(query: string, tool: ToolMeta): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const slug = tool.slug.toLowerCase();
  const title = tool.title.toLowerCase();
  const shortDesc = tool.short.toLowerCase();

  // Exact matches or prefix matches
  if (slug === q) return 100;
  if (slug.startsWith(q) || q.startsWith(slug)) return 80;
  if (title.includes(q)) return 60;
  if (slug.includes(q) || q.includes(slug)) return 50;
  if (shortDesc.includes(q)) return 40;

  // Character overlap score
  const qChars = new Set(q.split(''));
  let matchCount = 0;
  for (const c of qChars) {
    if (slug.includes(c)) matchCount++;
  }
  return (matchCount / Math.max(q.length, slug.length)) * 30;
}

export function NotFound({ attemptedSlug, isToolNotFound }: NotFoundProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Determine attempted route or slug
  const cleanPath = location.pathname || '';
  const detectedSlug = attemptedSlug || (cleanPath.startsWith('/tools/') ? cleanPath.replace('/tools/', '') : '');
  const isTool = isToolNotFound || Boolean(detectedSlug);

  // Compute suggestions based on attempted slug or fallback to popular tools
  const suggestedTools = useMemo(() => {
    if (detectedSlug) {
      const scored = tools
        .map((t) => ({ tool: t, score: scoreToolMatch(detectedSlug, t) }))
        .sort((a, b) => b.score - a.score);

      const matches = scored.filter((item) => item.score > 20).map((item) => item.tool);
      if (matches.length > 0) {
        return matches.slice(0, 3);
      }
    }

    // Default top utilities when no close match is found
    const defaultSlugs = ['timestamp', 'jwt', 'password'];
    return tools.filter((t) => defaultSlugs.includes(t.slug));
  }, [detectedSlug]);

  // Live filter if user types in the inline search box
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div
      data-testid="not-found-page"
      style={{
        maxWidth: 960,
        margin: '20px auto 48px',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* 404 Hero Card */}
      <div
        className="glass"
        style={{
          width: '100%',
          padding: '48px 32px',
          borderRadius: 'var(--radius)',
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 36,
        }}
      >
        {/* Glowing atmospheric gradient */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 320,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 80%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }}
        />

        {/* 404 Visual Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--surface-nav-item)',
            border: '1px solid var(--glass-border)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--accent)',
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.12)',
          }}
        >
          <Sparkles size={14} />
          <span>404 · ERROR</span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          {isTool ? (
            <>
              Tool Not Found:{' '}
              <span
                style={{
                  background: 'var(--grad)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {detectedSlug || 'Unknown'}
              </span>
            </>
          ) : (
            'Page Not Found'
          )}
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: 16,
            color: 'var(--ink-soft)',
            maxWidth: 540,
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}
        >
          {isTool
            ? `The requested tool "${detectedSlug}" does not exist or may have been renamed.`
            : `The path "${cleanPath}" does not exist in Toolglass.`}
        </p>

        {/* Inline Search Bar */}
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto 28px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-input)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Search size={16} color="var(--ink-mute)" />
            <input
              type="text"
              placeholder="Search tools directly (e.g. base64, jwt, cron)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tools directly"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: 'var(--ink)',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-mute)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              borderRadius: 12,
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Explore All Tools
          </Link>
        </div>
      </div>

      {/* Search Results (if user is actively typing) */}
      {searchQuery.trim() && (
        <div style={{ width: '100%', textAlign: 'left', marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Search size={18} color="var(--accent)" />
            Search Results for "{searchQuery}" ({searchResults.length})
          </h2>

          {searchResults.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {searchResults.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div
              className="glass"
              style={{
                padding: 24,
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--ink-soft)',
                fontSize: 14,
              }}
            >
              <AlertCircle size={24} color="var(--ink-mute)" style={{ margin: '0 auto 8px' }} />
              No tools matching "{searchQuery}". Try browsing all tools on the home page.
            </div>
          )}
        </div>
      )}

      {/* Suggested Tools Section (Shown when not actively searching) */}
      {!searchQuery.trim() && suggestedTools.length > 0 && (
        <div style={{ width: '100%', textAlign: 'left' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Compass size={18} color="var(--accent)" />
              {detectedSlug ? 'Did you mean one of these tools?' : 'Popular Utilities'}
            </h2>
            <Link
              to="/"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              View all 17 tools →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {suggestedTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default NotFound;
