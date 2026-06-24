import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitial(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem('toolglass-theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // Fall back to OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toolglass-theme', theme);
  }, [theme]);

  // Listen for OS change only if user has NOT manually set a theme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('toolglass-theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const toggle = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
