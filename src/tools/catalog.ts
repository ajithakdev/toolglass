// Plain tool metadata, shared by the app and the build (prerendered pages, sitemap).
// Keep it free of React so vite.config.ts can import it.

export type CategoryId =
  | 'images'
  | 'pdf'
  | 'text'
  | 'calculators'
  | 'time'
  | 'media'
  | 'security'
  | 'developers'
  | 'design';

export type Audience = 'everyone' | 'developers' | 'designers' | 'writers' | 'students';

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: 'images', name: 'Images', blurb: 'Compress, convert, resize, and clean photos.' },
  { id: 'pdf', name: 'PDF & Documents', blurb: 'Merge, split, and convert PDFs.' },
  { id: 'text', name: 'Text & Writing', blurb: 'Count, convert, compare, and format text.' },
  { id: 'calculators', name: 'Everyday Calculators', blurb: 'Units, percentages, dates, and money.' },
  { id: 'time', name: 'Time', blurb: 'Time zones, timers, and timestamps.' },
  { id: 'media', name: 'Media & Device', blurb: 'QR codes, recording, and device checks.' },
  { id: 'security', name: 'Security & Privacy', blurb: 'Passwords, hashes, and encryption.' },
  { id: 'developers', name: 'Developers', blurb: 'Formatters, encoders, generators, and API tools.' },
  { id: 'design', name: 'Design', blurb: 'Color, contrast, and CSS helpers.' },
];

export const AUDIENCES: { id: Audience; name: string }[] = [
  { id: 'everyone', name: 'Everyone' },
  { id: 'developers', name: 'Developers' },
  { id: 'designers', name: 'Designers' },
  { id: 'writers', name: 'Writers' },
  { id: 'students', name: 'Students' },
];

export interface ToolInfo {
  slug: string;
  title: string;
  short: string;
  description: string;
  category: CategoryId;
  audience: Audience[];
  /** Extra search terms, also used for page meta. */
  keywords: string[];
  /** What this saves you from, shown on the tool page. */
  replaces?: string;
}

export const catalog: ToolInfo[] = [
  {
    slug: 'password',
    title: 'Password Generator',
    short: 'Strong, secure passwords',
    description: 'Generate cryptographically strong passwords with custom rules, one at a time or up to 100 at once.',
    category: 'security',
    audience: ['everyone', 'developers'],
    keywords: ['password', 'generator', 'strong', 'secure', 'random', 'passphrase', 'bulk', 'multiple passwords'],
    replaces: 'password-generator sites',
  },
  {
    slug: 'jwt',
    title: 'JWT Generator',
    short: 'Sign HS256, RS256, ES256 tokens',
    description: 'Build and sign JSON Web Tokens with HS256, RS256, or ES256, and generate RSA or EC key pairs.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['jwt', 'json web token', 'sign', 'hs256', 'rs256', 'es256', 'key pair', 'auth'],
    replaces: 'jwt.io',
  },
  {
    slug: 'uuid',
    title: 'UUID',
    short: 'v4 and v7 UUIDs',
    description: 'Generate random v4 or time-sorted v7 UUIDs in bulk, and inspect any UUID.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['uuid', 'guid', 'v4', 'v7', 'uuidv7', 'rfc 9562', 'unique id', 'random id', 'decode uuid'],
    replaces: 'uuid generator sites',
  },
  {
    slug: 'objectid',
    title: 'Mongo ObjectId',
    short: '24-char BSON ids',
    description: 'Generate MongoDB ObjectIds — timestamp + machine + counter.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['mongodb', 'objectid', 'bson', 'id'],
  },
  {
    slug: 'nanoid',
    title: 'NanoID',
    short: 'URL-safe small ids',
    description: 'Compact, URL-safe, unique string IDs with custom alphabet/length.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['nanoid', 'short id', 'url safe id', 'unique id'],
  },
  {
    slug: 'hash',
    title: 'Hash Generator',
    short: 'SHA-1, SHA-2, SHA-3, Keccak',
    description: 'Hash text or files with SHA-1, SHA-2, SHA-3, or Keccak-256. Check download checksums without a terminal.',
    category: 'security',
    audience: ['developers', 'everyone'],
    keywords: ['hash', 'sha256', 'sha1', 'sha512', 'sha3', 'keccak', 'checksum', 'digest', 'file hash', 'sha256sum', 'verify download'],
    replaces: 'hash calculator sites',
  },
  {
    slug: 'base64',
    title: 'Base64',
    short: 'Encode & decode',
    description: 'Unicode-safe Base64 encoding and decoding.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['base64', 'encode', 'decode', 'btoa', 'atob'],
    replaces: 'base64 encoder sites',
  },
  {
    slug: 'timestamp',
    title: 'Timestamp',
    short: 'Unix ⇄ human time',
    description: 'Convert between Unix timestamps and human-readable dates.',
    category: 'time',
    audience: ['developers'],
    keywords: ['unix', 'timestamp', 'epoch', 'date', 'time', 'cron', 'convert'],
    replaces: 'epoch converter sites',
  },
  {
    slug: 'json',
    title: 'JSON Formatter',
    short: 'Format & minify',
    description: 'Beautify, minify, and validate JSON with error positions.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty print'],
    replaces: 'JSON formatter sites',
  },
  {
    slug: 'jwt-decode',
    title: 'JWT Decoder',
    short: 'Decode & inspect JWTs',
    description: 'Paste a JWT to see its header, payload, and expiry status pretty-printed.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['jwt', 'decode', 'token', 'inspect', 'claims', 'expiry'],
    replaces: 'jwt.io',
  },
  {
    slug: 'url',
    title: 'URL Encoder',
    short: 'Encode & decode',
    description: 'Safely encode or decode URL components (encodeURIComponent).',
    category: 'developers',
    audience: ['developers'],
    keywords: ['url', 'encode', 'decode', 'percent encoding', 'uri'],
    replaces: 'URL encoder sites',
  },
  {
    slug: 'color',
    title: 'Color Converter',
    short: 'Hex ⇄ RGB ⇄ HSL',
    description: 'Convert colors between Hex, RGB, and HSL formats with a live preview.',
    category: 'design',
    audience: ['designers', 'developers'],
    keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'picker'],
    replaces: 'color picker extensions',
  },
  {
    slug: 'regex',
    title: 'Regex Tester',
    short: 'Test & match patterns',
    description: 'Write and test regular expressions in real-time. Matches are highlighted.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['regex', 'regular expression', 'pattern', 'match', 'test'],
    replaces: 'regex101',
  },
  {
    slug: 'json-to-ts',
    title: 'JSON to TS',
    short: 'JSON to TypeScript',
    description: 'Convert JSON objects into TypeScript interfaces or types automatically.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['json', 'typescript', 'interface', 'type', 'convert'],
    replaces: 'quicktype',
  },
  {
    slug: 'api-tester',
    title: 'API Tester',
    short: 'HTTP client',
    description: 'Mini API client to test HTTP requests directly from the browser. Supports cURL import.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['api', 'http', 'rest', 'request', 'curl', 'postman', 'fetch'],
    replaces: 'Postman',
  },
  {
    slug: 'qr',
    title: 'QR Code Generator',
    short: 'Text to QR Code',
    description: 'Generate QR codes from text or URLs instantly. Export to PNG/SVG.',
    category: 'media',
    audience: ['everyone'],
    keywords: ['qr', 'qr code', 'barcode', 'generator', 'link', 'wifi'],
    replaces: 'QR sites that add watermarks or expire codes',
  },
  {
    slug: 'markdown',
    title: 'Markdown Preview',
    short: 'MD to HTML',
    description: 'Write Markdown and instantly preview the rendered HTML.',
    category: 'text',
    audience: ['writers', 'developers'],
    keywords: ['markdown', 'md', 'preview', 'html', 'readme', 'notes'],
    replaces: 'Markdown editor apps',
  },
  {
    slug: 'chmod',
    title: 'Linux chmod Calculator',
    short: 'File permissions & octal',
    description: 'Calculate numeric octal and symbolic Linux file permissions with special bits.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['chmod', 'permissions', 'octal', 'linux', 'unix', 'file mode', '755', '644'],
    replaces: 'chmod calculator sites',
  },
  {
    slug: 'case-converter',
    title: 'Text Case Converter & Slug',
    short: 'camel, snake, kebab & slugs',
    description: 'Transform text between camelCase, PascalCase, snake_case, kebab-case, and URL slugs.',
    category: 'text',
    audience: ['everyone', 'writers', 'developers'],
    keywords: ['case', 'uppercase', 'lowercase', 'title case', 'camelcase', 'snake case', 'kebab', 'slug'],
    replaces: 'case converter sites full of ads',
  },
  {
    slug: 'word-counter',
    title: 'Word Counter',
    short: 'Words, characters, reading time',
    description: 'Count words, characters, sentences, and paragraphs, with reading and speaking time. Works with any language.',
    category: 'text',
    audience: ['everyone', 'writers', 'students'],
    keywords: ['word count', 'character count', 'letter count', 'reading time', 'essay', 'words'],
    replaces: 'word counter sites full of ads',
  },
  {
    slug: 'text-diff',
    title: 'Text Diff',
    short: 'Compare two texts line by line',
    description: 'Paste two versions of a text and see which lines were added or removed.',
    category: 'text',
    audience: ['everyone', 'developers', 'writers'],
    keywords: ['diff', 'compare', 'difference', 'changes', 'text compare', 'diff checker'],
    replaces: 'diffchecker.com',
  },
  {
    slug: 'notepad',
    title: 'Notepad',
    short: 'Quick notes that save themselves',
    description: 'A plain notepad that saves in your browser as you type. Download as .txt any time.',
    category: 'text',
    audience: ['everyone', 'students', 'writers'],
    keywords: ['notepad', 'notes', 'scratchpad', 'text editor', 'online notepad'],
    replaces: 'online notepad sites',
  },
  {
    slug: 'unit-converter',
    title: 'Unit Converter',
    short: 'Length, weight, temperature & more',
    description: 'Convert length, mass, temperature, volume, area, speed, digital storage, and time.',
    category: 'calculators',
    audience: ['everyone', 'students'],
    keywords: ['unit converter', 'convert', 'km to miles', 'kg to lb', 'celsius to fahrenheit', 'gb', 'metric', 'imperial'],
    replaces: 'unit conversion sites',
  },
  {
    slug: 'percentage',
    title: 'Percentage Calculator',
    short: 'Percent of, change, and more',
    description: 'Work out X% of Y, what percent one number is of another, percent change, and adding or removing a percentage.',
    category: 'calculators',
    audience: ['everyone', 'students'],
    keywords: ['percent', 'percentage', 'percent change', 'discount', 'tax', 'increase', 'decrease'],
    replaces: 'percentage calculator sites',
  },
  {
    slug: 'world-clock',
    title: 'World Clock',
    short: 'Time zones side by side',
    description: 'See the time in several time zones at once, and check what a given moment is everywhere.',
    category: 'time',
    audience: ['everyone', 'developers'],
    keywords: ['world clock', 'time zone', 'timezone converter', 'utc', 'gmt', 'meeting planner'],
    replaces: 'time zone converter sites',
  },
  {
    slug: 'timer',
    title: 'Stopwatch & Timer',
    short: 'Stopwatch, countdown, pomodoro',
    description: 'A stopwatch with laps, a countdown timer with an alarm, and a 25/5 pomodoro timer.',
    category: 'time',
    audience: ['everyone', 'students'],
    keywords: ['stopwatch', 'timer', 'countdown', 'pomodoro', 'alarm', 'focus timer'],
    replaces: 'timer apps',
  },
  {
    slug: 'image-compress',
    title: 'Image Compressor',
    short: 'Compress, convert, resize, strip EXIF',
    description: 'Shrink images, convert to WebP, JPEG, PNG, or AVIF, resize, and remove EXIF metadata. Nothing is uploaded.',
    category: 'images',
    audience: ['everyone', 'designers', 'developers'],
    keywords: ['compress image', 'resize image', 'webp', 'avif', 'jpeg', 'png', 'convert image', 'exif', 'remove metadata', 'gps'],
    replaces: 'TinyPNG and image upload sites',
  },
  {
    slug: 'screen-recorder',
    title: 'Screen Recorder',
    short: 'Record your screen, no install',
    description: 'Record your screen, a window, or a tab, with optional microphone. Stays on your device.',
    category: 'media',
    audience: ['everyone', 'developers'],
    keywords: ['screen recorder', 'record screen', 'screen capture', 'video', 'loom'],
    replaces: 'screen recording apps and extensions',
  },
];
