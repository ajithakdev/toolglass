import { Monitor, Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import { useTheme, type ThemeMode } from '../../hooks/useTheme';

const NEXT: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' };
const LABEL: Record<ThemeMode, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };
const ICON = { auto: Monitor, light: Sun, dark: Moon };

export function ThemeToggle() {
  const { mode, theme, setMode } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);
  const next = NEXT[mode];
  const toggle = () => setMode(next);
  const Icon = ICON[mode];

  const handleClick = () => {
    const btn = btnRef.current;
    // Only animate when the visible theme actually changes
    const willChange = (next === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next) !== theme;
    if (!btn || !willChange) { toggle(); return; }

    // Get button center coordinates for the circle origin
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Max radius: distance from button center to the farthest corner
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Use View Transitions API if available
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        toggle();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      // Fallback for browsers without View Transitions API
      toggle();
    }
  };

  return (
    <button
      ref={btnRef}
      id="theme-toggle"
      onClick={handleClick}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}`}
      title={`Theme: ${LABEL[mode]}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'var(--surface-nav-item)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        fontSize: 17,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s ease, transform 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(20deg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(0deg)';
      }}
    >
      <Icon size={17} strokeWidth={1.8} color="var(--ink)" />
    </button>
  );
}
