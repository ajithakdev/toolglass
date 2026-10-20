/** Scale (w, h) down to fit inside maxW x maxH, keeping the aspect ratio. 0 means no limit. Never upscales. */
export function fitSize(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  const scale = Math.min(1, maxW > 0 ? maxW / w : 1, maxH > 0 ? maxH / h : 1);
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

/** "photo.jpeg" + "image/webp" -> "photo.webp" */
export const renameFor = (name: string, mime: string) => `${name.replace(/\.[^.]+$/, '') || 'image'}.${mime.split('/')[1]!.replace('jpeg', 'jpg')}`;
