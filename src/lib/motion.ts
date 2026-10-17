// Shared motion presets. Time-based (framer uses rAF deltas), so speed is the
// same at 60, 120, or 144 Hz. Reduced motion is applied app-wide by MotionConfig.
import type { Transition, Variants } from 'framer-motion';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export const spring: Transition = { type: 'spring', stiffness: 520, damping: 36, mass: 0.7 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } },
};

export const stagger = (gap = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});
