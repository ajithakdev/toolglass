/** Each returns NaN when the answer is undefined (for example dividing by zero). */
export const percentOf = (pct: number, of: number) => (pct / 100) * of;
export const whatPercent = (part: number, whole: number) => (whole === 0 ? NaN : (part / whole) * 100);
export const percentChange = (from: number, to: number) => (from === 0 ? NaN : ((to - from) / Math.abs(from)) * 100);
export const addPercent = (value: number, pct: number) => value * (1 + pct / 100);
