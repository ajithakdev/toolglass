import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export interface ToolMeta {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  tint: string;
  Component: LazyExoticComponent<ComponentType>;
}

export const tools: ToolMeta[] = [
  {
    slug: 'password',
    title: 'Password Generator',
    short: 'Strong, secure passwords',
    description: 'Generate cryptographically strong passwords with custom rules.',
    icon: '🔐',
    tint: 'linear-gradient(135deg, #c4b5fd, #f0abfc)',
    Component: lazy(() => import('./password/PasswordTool')),
  },
  {
    slug: 'jwt',
    title: 'JWT Generator',
    short: 'Sign HS256 tokens',
    description: 'Build and sign JSON Web Tokens (HS256) with custom payloads.',
    icon: '🪪',
    tint: 'linear-gradient(135deg, #fda4af, #fcd34d)',
    Component: lazy(() => import('./jwt/JwtTool')),
  },
  {
    slug: 'uuid',
    title: 'UUID v4',
    short: 'Random UUIDs',
    description: 'Generate RFC 4122 v4 UUIDs in bulk.',
    icon: '🆔',
    tint: 'linear-gradient(135deg, #a7f3d0, #93c5fd)',
    Component: lazy(() => import('./uuid/UuidTool')),
  },
  {
    slug: 'objectid',
    title: 'Mongo ObjectId',
    short: '24-char BSON ids',
    description: 'Generate MongoDB ObjectIds — timestamp + machine + counter.',
    icon: '🍃',
    tint: 'linear-gradient(135deg, #bbf7d0, #a7f3d0)',
    Component: lazy(() => import('./objectid/ObjectIdTool')),
  },
  {
    slug: 'nanoid',
    title: 'NanoID',
    short: 'URL-safe small ids',
    description: 'Compact, URL-safe, unique string IDs with custom alphabet/length.',
    icon: '⚡',
    tint: 'linear-gradient(135deg, #fde68a, #fda4af)',
    Component: lazy(() => import('./nanoid/NanoIdTool')),
  },
  {
    slug: 'hash',
    title: 'Hash Generator',
    short: 'SHA-1/256/384/512',
    description: 'Compute cryptographic hashes of text via Web Crypto.',
    icon: '#️⃣',
    tint: 'linear-gradient(135deg, #c4b5fd, #93c5fd)',
    Component: lazy(() => import('./hash/HashTool')),
  },
  {
    slug: 'base64',
    title: 'Base64',
    short: 'Encode & decode',
    description: 'Unicode-safe Base64 encoding and decoding.',
    icon: '🧬',
    tint: 'linear-gradient(135deg, #fbcfe8, #c4b5fd)',
    Component: lazy(() => import('./base64/Base64Tool')),
  },
  {
    slug: 'timestamp',
    title: 'Timestamp',
    short: 'Unix ⇄ human time',
    description: 'Convert between Unix timestamps and human-readable dates.',
    icon: '⏱️',
    tint: 'linear-gradient(135deg, #a7f3d0, #fde68a)',
    Component: lazy(() => import('./timestamp/TimestampTool')),
  },
  {
    slug: 'json',
    title: 'JSON Formatter',
    short: 'Format & minify',
    description: 'Beautify, minify, and validate JSON with error positions.',
    icon: '{ }',
    tint: 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
    Component: lazy(() => import('./json/JsonTool')),
  },
];

export const toolBySlug = (slug: string): ToolMeta | undefined =>
  tools.find((t) => t.slug === slug);
