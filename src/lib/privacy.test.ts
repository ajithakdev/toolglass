import { describe, it, expect } from 'vitest';
import { countThirdParty } from './privacy';

describe('countThirdParty', () => {
  it('counts only other origins', () => {
    const entries = [
      { name: 'https://toolglass.ajithakdev.com/assets/index.js' },
      { name: 'https://toolglass.ajithakdev.com/fonts/geist.woff2' },
      { name: 'https://fonts.gstatic.com/x.woff2' },
      { name: 'not a url' },
    ];
    expect(countThirdParty(entries, 'https://toolglass.ajithakdev.com')).toBe(1);
  });
});
