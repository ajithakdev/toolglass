export const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Label for the primary shortcut modifier, e.g. "⌘K" or "Ctrl K". */
export const shortcut = (key: string) => (IS_MAC ? `⌘${key}` : `Ctrl ${key}`);
