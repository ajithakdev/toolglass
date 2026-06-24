import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
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
