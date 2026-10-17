import { Monitor, Moon, Sun } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTheme, type ThemeMode } from '../../hooks/useTheme';
import { Segmented } from './Segmented';

const OPTIONS = [
  { value: 'auto' as const, label: 'Auto (follow system)', icon: <Monitor size={15} strokeWidth={1.8} /> },
  { value: 'light' as const, label: 'Light', icon: <Sun size={15} strokeWidth={1.8} /> },
  { value: 'dark' as const, label: 'Dark', icon: <Moon size={15} strokeWidth={1.8} /> },
];

const osTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/** Auto / Light / Dark. When the visible theme changes, it spreads from the clicked button. */
export function ThemeToggle({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { mode, theme, setMode } = useTheme();

  const change = (next: ThemeMode, e?: MouseEvent<HTMLButtonElement>) => {
    const visibleChange = (next === 'auto' ? osTheme() : next) !== theme;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!visibleChange || !document.startViewTransition || reduce) {
      setMode(next);
      return;
    }
    const rect = e?.currentTarget.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 30;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.startViewTransition(() => setMode(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return <Segmented label="Theme" value={mode} options={OPTIONS} onChange={change} iconOnly size={size} />;
}
