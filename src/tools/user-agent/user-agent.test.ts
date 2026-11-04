import { describe, expect, it } from 'vitest';
import { parseUserAgent, type UserAgentInfo } from './user-agent';

const fixtures: { name: string; ua: string; expect: Partial<UserAgentInfo> }[] = [
  {
    name: 'empty',
    ua: '   ',
    expect: { browser: 'unknown', version: 'unknown', engine: 'unknown', os: 'unknown', device: 'unknown', bot: false },
  },
  {
    name: 'desktop Chrome on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    expect: { browser: 'Chrome', version: '120.0.0.0', engine: 'Blink', os: 'Windows', device: 'desktop', bot: false },
  },
  {
    name: 'desktop Chrome on Mac',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36',
    expect: { browser: 'Chrome', version: '121.0.6167.85', engine: 'Blink', os: 'macOS 10.15.7', device: 'desktop', bot: false },
  },
  {
    name: 'desktop Edge',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
    expect: { browser: 'Edge', version: '120.0.2210.91', engine: 'Blink', os: 'Windows', device: 'desktop', bot: false },
  },
  {
    name: 'desktop Firefox',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    expect: { browser: 'Firefox', version: '121.0', engine: 'Gecko', os: 'macOS 10.15', device: 'desktop', bot: false },
  },
  {
    name: 'desktop Safari',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    expect: { browser: 'Safari', version: '17.2', engine: 'WebKit', os: 'macOS 10.15.7', device: 'desktop', bot: false },
  },
  {
    name: 'iOS Safari',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    expect: { browser: 'Safari', version: '17.2', engine: 'WebKit', os: 'iOS 17.2', device: 'mobile', bot: false },
  },
  {
    name: 'iPad Safari',
    ua: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    expect: { browser: 'Safari', version: '17.2', engine: 'WebKit', os: 'iOS 17.2', device: 'tablet', bot: false },
  },
  {
    name: 'Android Chrome',
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
    expect: { browser: 'Chrome', version: '120.0.6099.230', engine: 'Blink', os: 'Android 14', device: 'mobile', bot: false },
  },
  {
    name: 'Samsung Internet',
    ua: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    expect: { browser: 'Samsung Internet', version: '23.0', engine: 'Blink', os: 'Android 14', device: 'mobile', bot: false },
  },
  {
    name: 'desktop Opera',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    expect: { browser: 'Opera', version: '106.0.0.0', engine: 'Blink', os: 'Windows', device: 'desktop', bot: false },
  },
  {
    name: 'ChromeOS',
    ua: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.130 Safari/537.36',
    expect: { browser: 'Chrome', version: '120.0.6099.130', engine: 'Blink', os: 'ChromeOS', device: 'desktop', bot: false },
  },
  {
    name: 'Firefox on Linux',
    ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    expect: { browser: 'Firefox', version: '121.0', engine: 'Gecko', os: 'Linux', device: 'desktop', bot: false },
  },
  {
    name: 'iOS Chrome',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
    expect: { browser: 'Chrome', version: '120.0.6099.119', engine: 'WebKit', os: 'iOS 17.2', device: 'mobile', bot: false },
  },
  {
    name: 'iOS Firefox',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/121.0 Mobile/15E148 Safari/605.1.15',
    expect: { browser: 'Firefox', version: '121.0', engine: 'WebKit', os: 'iOS 17.2', device: 'mobile', bot: false },
  },
  {
    name: 'iOS Edge',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0.2210.105 Version/17.0 Mobile/15E148 Safari/604.1',
    expect: { browser: 'Edge', version: '120.0.2210.105', engine: 'WebKit', os: 'iOS 17.2', device: 'mobile', bot: false },
  },
  {
    name: 'Googlebot',
    ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    expect: { browser: 'Googlebot', version: '2.1', engine: 'unknown', device: 'unknown', bot: true },
  },
  {
    name: 'Googlebot Smartphone',
    ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    expect: { browser: 'Googlebot', version: '2.1', engine: 'unknown', os: 'Android 6.0.1', device: 'mobile', bot: true },
  },
  {
    name: 'Android tablet Chrome',
    ua: 'Mozilla/5.0 (Linux; Android 13; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Safari/537.36',
    expect: { browser: 'Chrome', version: '120.0.6099.230', engine: 'Blink', os: 'Android 13', device: 'tablet', bot: false },
  },
  {
    name: 'Android WebView',
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36',
    expect: { browser: 'Android WebView', version: '120.0.6099.230', engine: 'Blink', os: 'Android 14', device: 'mobile', bot: false },
  },
  {
    name: 'Cubot phone is not a bot',
    ua: 'Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36',
    expect: { browser: 'Chrome', version: '87.0.4280.101', os: 'Android 10', device: 'mobile', bot: false },
  },
  {
    name: 'Bingbot',
    ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    expect: { browser: 'Bingbot', version: '2.0', bot: true },
  },
  {
    name: 'curl',
    ua: 'curl/8.5.0',
    expect: { browser: 'curl', version: '8.5.0', engine: 'unknown', os: 'unknown', device: 'unknown', bot: true },
  },
  {
    name: 'unrecognized',
    ua: 'not a user agent',
    expect: { browser: 'unknown', version: 'unknown', bot: false },
  },
];

describe('parseUserAgent', () => {
  it.each(fixtures)('$name', ({ ua, expect: expected }) => {
    expect(parseUserAgent(ua)).toMatchObject(expected);
  });
});
