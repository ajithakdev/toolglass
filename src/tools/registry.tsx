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
  FileText,
  Terminal,
  Type,
  WholeWord,
  GitCompare,
  StickyNote,
  Ruler,
  Percent,
  Earth,
  Timer,
  ImageDown,
  Video,
} from 'lucide-react';

export interface ToolMeta extends ToolInfo {
  icon: ReactNode;
  Component: LazyExoticComponent<ComponentType>;
}

const visuals: Record<string, Pick<ToolMeta, 'icon' | 'Component'>> = {
  'password': {
    icon: <KeyRound size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./password/PasswordTool')),
  },
  'jwt': {
    icon: <FileBadge2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./jwt/JwtTool')),
  },
  'uuid': {
    icon: <Fingerprint size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./uuid/UuidTool')),
  },
  'objectid': {
    icon: <Leaf size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./objectid/ObjectIdTool')),
  },
  'nanoid': {
    icon: <Zap size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./nanoid/NanoIdTool')),
  },
  'hash': {
    icon: <Hash size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./hash/HashTool')),
  },
  'base64': {
    icon: <Binary size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./base64/Base64Tool')),
  },
  'timestamp': {
    icon: <Clock size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./timestamp/TimestampTool')),
  },
  'json': {
    icon: <Braces size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./json/JsonTool')),
  },
  'jwt-decode': {
    icon: <ScanEye size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./jwt-decode/JwtDecodeTool')),
  },
  'url': {
    icon: <Link size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./url/UrlTool')),
  },
  'color': {
    icon: <Palette size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./color/ColorTool')),
  },
  'regex': {
    icon: <Regex size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./regex/RegexTool')),
  },
  'json-to-ts': {
    icon: <Code2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./json-to-ts/JsonToTsTool')),
  },
  'api-tester': {
    icon: <Globe2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./curl-to-fetch/CurlTool')),
  },
  'qr': {
    icon: <QrCode size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./qr/QrTool')),
  },
  'markdown': {
    icon: <FileText size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./markdown/MarkdownTool')),
  },
  'chmod': {
    icon: <Terminal size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./chmod/ChmodTool')),
  },
  'case-converter': {
    icon: <Type size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./case-converter/CaseConverterTool')),
  },
  'word-counter': {
    icon: <WholeWord size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./word-counter/WordCounterTool')),
  },
  'text-diff': {
    icon: <GitCompare size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./text-diff/TextDiffTool')),
  },
  'notepad': {
    icon: <StickyNote size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./notepad/NotepadTool')),
  },
  'unit-converter': {
    icon: <Ruler size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./unit-converter/UnitConverterTool')),
  },
  'percentage': {
    icon: <Percent size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./percentage/PercentageTool')),
  },
  'world-clock': {
    icon: <Earth size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./world-clock/WorldClockTool')),
  },
  'timer': {
    icon: <Timer size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./timer/TimerTool')),
  },
  'image-compress': {
    icon: <ImageDown size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./image-compress/ImageCompressTool')),
  },
  'screen-recorder': {
    icon: <Video size={22} strokeWidth={1.5} color="var(--ink)" />,
    Component: lazy(() => import('./screen-recorder/ScreenRecorderTool')),
  },
};

export const tools: ToolMeta[] = catalog.map((info) => ({ ...info, ...visuals[info.slug]! }));

export const toolBySlug = (slug: string): ToolMeta | undefined =>
  tools.find((t) => t.slug === slug);
