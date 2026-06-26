import { useTheme } from '../../hooks/useTheme';
import { useRef } from 'react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const btn = btnRef.current;
    if (!btn) { toggle(); return; }

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
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
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
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
