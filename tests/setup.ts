// Vitest central setup for jsdom environment

import { MotionGlobalConfig } from 'framer-motion';

// 1. Enable React act() environment and instant animations
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
MotionGlobalConfig.skipAnimations = true;

// 2. Mock window.matchMedia for theme and responsive tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// 3. Mock scrollIntoView, scrollTo, and animate for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = window.scrollTo || (() => {});
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  Element.prototype.animate =
    Element.prototype.animate ||
    (() =>
      ({
        onfinish: null,
        cancel: () => {},
        play: () => {},
        pause: () => {},
        finish: () => {},
      }) as unknown as Animation);
}
