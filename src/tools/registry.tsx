import { lazy, type LazyExoticComponent, type ComponentType, type ReactNode } from 'react';
import {
  KeyRound,
  FileBadge2,
  Fingerprint,
  Leaf,
  Zap,
  Hash,
  Binary,
  Clock,
  Braces,
  ScanEye,
  Link,
  Palette,
  Regex,
  Code2,
  Globe2,
  QrCode,
  FileText
} from 'lucide-react';

export interface ToolMeta {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: ReactNode;
  tint: string;
  Component: LazyExoticComponent<ComponentType>;
}

export const tools: ToolMeta[] = [
  {
    slug: 'password',
    title: 'Password Generator',
    short: 'Strong, secure passwords',
    description: 'Generate cryptographically strong passwords with custom rules.',
    icon: <KeyRound size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #c4b5fd, #f0abfc)',
    Component: lazy(() => import('./password/PasswordTool')),
  },
  {
    slug: 'jwt',
    title: 'JWT Generator',
    short: 'Sign HS256 tokens',
    description: 'Build and sign JSON Web Tokens (HS256) with custom payloads.',
    icon: <FileBadge2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fda4af, #fcd34d)',
    Component: lazy(() => import('./jwt/JwtTool')),
  },
  {
    slug: 'uuid',
    title: 'UUID v4',
    short: 'Random UUIDs',
    description: 'Generate RFC 4122 v4 UUIDs in bulk.',
    icon: <Fingerprint size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #93c5fd)',
    Component: lazy(() => import('./uuid/UuidTool')),
  },
  {
    slug: 'objectid',
    title: 'Mongo ObjectId',
    short: '24-char BSON ids',
    description: 'Generate MongoDB ObjectIds — timestamp + machine + counter.',
    icon: <Leaf size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bbf7d0, #a7f3d0)',
    Component: lazy(() => import('./objectid/ObjectIdTool')),
  },
  {
    slug: 'nanoid',
    title: 'NanoID',
    short: 'URL-safe small ids',
    description: 'Compact, URL-safe, unique string IDs with custom alphabet/length.',
    icon: <Zap size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fde68a, #fda4af)',
    Component: lazy(() => import('./nanoid/NanoIdTool')),
  },
  {
    slug: 'hash',
    title: 'Hash Generator',
    short: 'SHA-1/256/384/512',
    description: 'Compute cryptographic hashes of text via Web Crypto.',
    icon: <Hash size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #c4b5fd, #93c5fd)',
    Component: lazy(() => import('./hash/HashTool')),
  },
  {
    slug: 'base64',
    title: 'Base64',
    short: 'Encode & decode',
    description: 'Unicode-safe Base64 encoding and decoding.',
    icon: <Binary size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #c4b5fd)',
    Component: lazy(() => import('./base64/Base64Tool')),
  },
  {
    slug: 'timestamp',
    title: 'Timestamp',
    short: 'Unix ⇄ human time',
    description: 'Convert between Unix timestamps and human-readable dates.',
    icon: <Clock size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #fde68a)',
    Component: lazy(() => import('./timestamp/TimestampTool')),
  },
  {
    slug: 'json',
    title: 'JSON Formatter',
    short: 'Format & minify',
    description: 'Beautify, minify, and validate JSON with error positions.',
    icon: <Braces size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
    Component: lazy(() => import('./json/JsonTool')),
  },
  {
    slug: 'jwt-decode',
    title: 'JWT Decoder',
    short: 'Decode & inspect JWTs',
    description: 'Paste a JWT to see its header, payload, and expiry status pretty-printed.',
    icon: <ScanEye size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #fda4af)',
    Component: lazy(() => import('./jwt-decode/JwtDecodeTool')),
  },
  {
    slug: 'url',
    title: 'URL Encoder',
    short: 'Encode & decode',
    description: 'Safely encode or decode URL components (encodeURIComponent).',
    icon: <Link size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bfdbfe, #a7f3d0)',
    Component: lazy(() => import('./url/UrlTool')),
  },
  {
    slug: 'color',
    title: 'Color Converter',
    short: 'Hex ⇄ RGB ⇄ HSL',
    description: 'Convert colors between Hex, RGB, and HSL formats with a live preview.',
    icon: <Palette size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fcd34d, #fca5a5)',
    Component: lazy(() => import('./color/ColorTool')),
  },
  {
    slug: 'regex',
    title: 'Regex Tester',
    short: 'Test & match patterns',
    description: 'Write and test regular expressions in real-time. Matches are highlighted.',
    icon: <Regex size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #bfdbfe)',
    Component: lazy(() => import('./regex/RegexTool')),
  },
  {
    slug: 'json-to-ts',
    title: 'JSON to TS',
    short: 'JSON to TypeScript',
    description: 'Convert JSON objects into TypeScript interfaces or types automatically.',
    icon: <Code2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fef08a, #fca5a5)',
    Component: lazy(() => import('./json-to-ts/JsonToTsTool')),
  },
  {
    slug: 'api-tester',
    title: 'API Tester',
    short: 'HTTP client',
    description: 'Mini API client to test HTTP requests directly from the browser. Supports cURL import.',
    icon: <Globe2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #a7f3d0)',
    Component: lazy(() => import('./curl-to-fetch/CurlTool')),
  },
  {
    slug: 'qr',
    title: 'QR Code Generator',
    short: 'Text to QR Code',
    description: 'Generate QR codes from text or URLs instantly. Export to PNG/SVG.',
    icon: <QrCode size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #fca5a5)',
    Component: lazy(() => import('./qr/QrTool')),
  },
  {
    slug: 'markdown',
    title: 'Markdown Preview',
    short: 'MD to HTML',
    description: 'Write Markdown and instantly preview the rendered HTML.',
    icon: <FileText size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bfdbfe, #c4b5fd)',
    Component: lazy(() => import('./markdown/MarkdownTool')),
  },
];

export const toolBySlug = (slug: string): ToolMeta | undefined =>
  tools.find((t) => t.slug === slug);
