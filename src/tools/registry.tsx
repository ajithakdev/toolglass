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
  Sheet,
  ArrowLeftRight,
  Database,
  Signal,
  Calculator,
  Ampersand,
  ListFilter,
  Keyboard,
  ScanText,
  Network,
  FileType,
  ShieldCheck,
} from 'lucide-react';

export interface ToolMeta extends ToolInfo {
  icon: ReactNode;
  Component: LazyExoticComponent<ComponentType>;
  /** Starts downloading the tool's chunk so opening it is instant. Safe to call repeatedly. */
  preload: () => void;
}

const lazyTool = (load: () => Promise<{ default: ComponentType }>) => ({
  Component: lazy(load),
  // A failed preload is ignored: the real navigation retries and shows the error boundary
  preload: () => void load().catch(() => {}),
});

const visuals: Record<string, Pick<ToolMeta, 'icon' | 'Component' | 'preload'>> = {
  'password': {
    icon: <KeyRound size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./password/PasswordTool')),
  },
  'jwt': {
    icon: <FileBadge2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./jwt/JwtTool')),
  },
  'uuid': {
    icon: <Fingerprint size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./uuid/UuidTool')),
  },
  'objectid': {
    icon: <Leaf size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./objectid/ObjectIdTool')),
  },
  'nanoid': {
    icon: <Zap size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./nanoid/NanoIdTool')),
  },
  'hash': {
    icon: <Hash size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./hash/HashTool')),
  },
  'base64': {
    icon: <Binary size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./base64/Base64Tool')),
  },
  'timestamp': {
    icon: <Clock size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./timestamp/TimestampTool')),
  },
  'json': {
    icon: <Braces size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./json/JsonTool')),
  },
  'jwt-decode': {
    icon: <ScanEye size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./jwt-decode/JwtDecodeTool')),
  },
  'url': {
    icon: <Link size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./url/UrlTool')),
  },
  'color': {
    icon: <Palette size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./color/ColorTool')),
  },
  'regex': {
    icon: <Regex size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./regex/RegexTool')),
  },
  'json-to-ts': {
    icon: <Code2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./json-to-ts/JsonToTsTool')),
  },
  'api-tester': {
    icon: <Globe2 size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./curl-to-fetch/CurlTool')),
  },
  'qr': {
    icon: <QrCode size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./qr/QrTool')),
  },
  'markdown': {
    icon: <FileText size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./markdown/MarkdownTool')),
  },
  'chmod': {
    icon: <Terminal size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./chmod/ChmodTool')),
  },
  'case-converter': {
    icon: <Type size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./case-converter/CaseConverterTool')),
  },
  'word-counter': {
    icon: <WholeWord size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./word-counter/WordCounterTool')),
  },
  'text-diff': {
    icon: <GitCompare size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./text-diff/TextDiffTool')),
  },
  'notepad': {
    icon: <StickyNote size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./notepad/NotepadTool')),
  },
  'unit-converter': {
    icon: <Ruler size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./unit-converter/UnitConverterTool')),
  },
  'percentage': {
    icon: <Percent size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./percentage/PercentageTool')),
  },
  'world-clock': {
    icon: <Earth size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./world-clock/WorldClockTool')),
  },
  'timer': {
    icon: <Timer size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./timer/TimerTool')),
  },
  'image-compress': {
    icon: <ImageDown size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./image-compress/ImageCompressTool')),
  },
  'screen-recorder': {
    icon: <Video size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./screen-recorder/ScreenRecorderTool')),
  },
  'csv-json': {
    icon: <Sheet size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./csv-json/CsvJsonTool')),
  },
  'yaml-toml': {
    icon: <ArrowLeftRight size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./yaml-toml/YamlTomlTool')),
  },
  'sql-format': {
    icon: <Database size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./sql-format/SqlFormatTool')),
  },
  'http-status': {
    icon: <Signal size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./http-status/HttpStatusTool')),
  },
  'number-base': {
    icon: <Calculator size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./number-base/NumberBaseTool')),
  },
  'html-entities': {
    icon: <Ampersand size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./html-entities/HtmlEntitiesTool')),
  },
  'list-transform': {
    icon: <ListFilter size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./list-transform/ListTransformTool')),
  },
  'keycode': {
    icon: <Keyboard size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./keycode/KeycodeTool')),
  },
  'unicode': {
    icon: <ScanText size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./unicode/UnicodeTool')),
  },
  'subnet': {
    icon: <Network size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./subnet/SubnetTool')),
  },
  'mime-types': {
    icon: <FileType size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./mime-types/MimeTypesTool')),
  },
  'json-to-zod': {
    icon: <ShieldCheck size={22} strokeWidth={1.5} color="var(--ink)" />,
    ...lazyTool(() => import('./json-to-zod/JsonToZodTool')),
  },
};

export const tools: ToolMeta[] = catalog.map((info) => ({ ...info, ...visuals[info.slug]! }));

/** Sorts tools A to Z by title. The one place category lists get their order. */
export const byTitle = <T extends { title: string }>(list: T[]): T[] => [...list].sort((a, b) => a.title.localeCompare(b.title));

export const toolsInCategory = (category: string): ToolMeta[] => byTitle(tools.filter((t) => t.category === category));

export const toolBySlug = (slug: string): ToolMeta | undefined =>
  tools.find((t) => t.slug === slug);

export const preloadTool = (slug: string) => toolBySlug(slug)?.preload();

/** Preloads the given tools once the browser is idle, unless the user asked to save data. */
export function preloadWhenIdle(slugs: string[]) {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const run = () => slugs.forEach(preloadTool);
  if ('requestIdleCallback' in window) window.requestIdleCallback(run);
  else setTimeout(run, 1500);
}
