import { catalog, type ToolInfo } from './catalog';
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

export interface ToolMeta extends ToolInfo {
  icon: ReactNode;
  tint: string;
  Component: LazyExoticComponent<ComponentType>;
}

const visuals: Record<string, Pick<ToolMeta, 'icon' | 'tint' | 'Component'>> = {
  'password': {
    icon: <KeyRound size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #c4b5fd, #f0abfc)',
    Component: lazy(() => import('./password/PasswordTool')),
  },
  'jwt': {
    icon: <FileBadge2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fda4af, #fcd34d)',
    Component: lazy(() => import('./jwt/JwtTool')),
  },
  'uuid': {
    icon: <Fingerprint size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #93c5fd)',
    Component: lazy(() => import('./uuid/UuidTool')),
  },
  'objectid': {
    icon: <Leaf size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bbf7d0, #a7f3d0)',
    Component: lazy(() => import('./objectid/ObjectIdTool')),
  },
  'nanoid': {
    icon: <Zap size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fde68a, #fda4af)',
    Component: lazy(() => import('./nanoid/NanoIdTool')),
  },
  'hash': {
    icon: <Hash size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #c4b5fd, #93c5fd)',
    Component: lazy(() => import('./hash/HashTool')),
  },
  'base64': {
    icon: <Binary size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #c4b5fd)',
    Component: lazy(() => import('./base64/Base64Tool')),
  },
  'timestamp': {
    icon: <Clock size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #fde68a)',
    Component: lazy(() => import('./timestamp/TimestampTool')),
  },
  'json': {
    icon: <Braces size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
    Component: lazy(() => import('./json/JsonTool')),
  },
  'jwt-decode': {
    icon: <ScanEye size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #fda4af)',
    Component: lazy(() => import('./jwt-decode/JwtDecodeTool')),
  },
  'url': {
    icon: <Link size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bfdbfe, #a7f3d0)',
    Component: lazy(() => import('./url/UrlTool')),
  },
  'color': {
    icon: <Palette size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fcd34d, #fca5a5)',
    Component: lazy(() => import('./color/ColorTool')),
  },
  'regex': {
    icon: <Regex size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #bfdbfe)',
    Component: lazy(() => import('./regex/RegexTool')),
  },
  'json-to-ts': {
    icon: <Code2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fef08a, #fca5a5)',
    Component: lazy(() => import('./json-to-ts/JsonToTsTool')),
  },
  'api-tester': {
    icon: <Globe2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #fbcfe8, #a7f3d0)',
    Component: lazy(() => import('./curl-to-fetch/CurlTool')),
  },
  'qr': {
    icon: <QrCode size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #a7f3d0, #fca5a5)',
    Component: lazy(() => import('./qr/QrTool')),
  },
  'markdown': {
    icon: <FileText size={22} strokeWidth={1.5} color="var(--ink)" />,
    tint: 'linear-gradient(135deg, #bfdbfe, #c4b5fd)',
    Component: lazy(() => import('./markdown/MarkdownTool')),
  },
};

export const tools: ToolMeta[] = catalog.map((info) => ({ ...info, ...visuals[info.slug]! }));

export const toolBySlug = (slug: string): ToolMeta | undefined =>
  tools.find((t) => t.slug === slug);
