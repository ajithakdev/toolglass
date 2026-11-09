export interface UserAgentInfo {
  browser: string;
  version: string;
  engine: string;
  os: string;
  device: string;
  bot: boolean;
}

const unknown: UserAgentInfo = {
  browser: 'unknown',
  version: 'unknown',
  engine: 'unknown',
  os: 'unknown',
  device: 'unknown',
  bot: false,
};

interface BrowserRule {
  name: string;
  re: RegExp;
  engine: string;
}

// First match wins. Bots and WebView sit above browsers because their strings also contain Chrome or Edge.
// Edge, Opera, and Samsung Internet also contain "Chrome". Safari is only the Version/…Safari form.
const browserRules: BrowserRule[] = [
  { name: 'Googlebot', re: /Googlebot\/([\d.]+)/, engine: 'unknown' },
  { name: 'Bingbot', re: /bingbot\/([\d.]+)/, engine: 'unknown' },
  { name: 'curl', re: /curl\/([\d.]+)/, engine: 'unknown' },
  { name: 'Android WebView', re: /; wv\).*Chrome\/([\d.]+)/, engine: 'Blink' },
  { name: 'Samsung Internet', re: /SamsungBrowser\/([\d.]+)/, engine: 'Blink' },
  { name: 'Edge', re: /Edg(?:e|A|iOS)?\/([\d.]+)/, engine: 'Blink' },
  { name: 'Opera', re: /(?:OPR|Opera)\/([\d.]+)/, engine: 'Blink' },
  { name: 'Chrome', re: /(?:Chrome|CriOS)\/([\d.]+)/, engine: 'Blink' },
  { name: 'Firefox', re: /(?:Firefox|FxiOS)\/([\d.]+)/, engine: 'Gecko' },
  { name: 'Safari', re: /Version\/([\d.]+).*Safari\//, engine: 'WebKit' },
];

function firstMatch(ua: string, re: RegExp): string | null {
  return re.exec(ua)?.[1] ?? null;
}

function readOs(ua: string): string {
  const ios = firstMatch(ua, /(?:CPU (?:iPhone )?OS |CPU OS )([\d_]+)/);
  if (ios) return `iOS ${ios.replace(/_/g, '.')}`;
  const android = firstMatch(ua, /Android ([\d.]+)/);
  if (android) return `Android ${android}`;
  if (/Android/.test(ua)) return 'Android';
  if (/Windows NT/.test(ua)) return 'Windows';
  const mac = firstMatch(ua, /Mac OS X ([\d._]+)/);
  if (mac) return `macOS ${mac.replace(/_/g, '.')}`;
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'unknown';
}

function readDevice(ua: string, os: string): string {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/iPhone|iPod|Mobile/i.test(ua)) return 'mobile';
  // Phone Chrome includes "Mobile". Tablet Chrome does not, so Android without it is a tablet.
  if (os.startsWith('Android')) return 'tablet';
  if (os === 'Windows' || os.startsWith('macOS') || os === 'Linux' || os === 'ChromeOS') return 'desktop';
  return 'unknown';
}

/** Read browser, version, engine, OS, device, and whether the client looks like a bot. */
export function parseUserAgent(input: string): UserAgentInfo {
  const ua = input.trim();
  if (!ua) return { ...unknown };

  const info: UserAgentInfo = { ...unknown };
  for (const rule of browserRules) {
    const version = firstMatch(ua, rule.re);
    if (!version) continue;
    info.browser = rule.name;
    info.version = version;
    info.engine = rule.engine;
    break;
  }

  info.os = readOs(ua);
  // Every browser on iOS uses WebKit, including Chrome, Firefox, and Edge.
  if (info.os.startsWith('iOS')) info.engine = 'WebKit';
  info.device = readDevice(ua, info.os);
  // "bot" as its own word, or bot followed by / ; ). Avoids device names like Cubot.
  info.bot = /\bbot\b|bot[/;)]|spider|crawl|slurp|externalhit|\bcurl\/|wget/i.test(ua);
  return info;
}
