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
    description: 'Generate cryptographically strong passwords with custom rules.',
    category: 'security',
    audience: ['everyone', 'developers'],
    keywords: ['password', 'generator', 'strong', 'secure', 'random', 'passphrase'],
    replaces: 'password-generator sites',
  },
  {
    slug: 'jwt',
    title: 'JWT Generator',
    short: 'Sign HS256 tokens',
    description: 'Build and sign JSON Web Tokens (HS256) with custom payloads.',
    category: 'developers',
    audience: ['developers'],
    keywords: ['jwt', 'json web token', 'sign', 'hs256', 'auth'],
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
    short: 'SHA-1/256/384/512',
    description: 'Compute cryptographic hashes of text via Web Crypto.',
    category: 'security',
    audience: ['developers', 'everyone'],
    keywords: ['hash', 'sha256', 'sha1', 'sha512', 'checksum', 'digest'],
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
];
