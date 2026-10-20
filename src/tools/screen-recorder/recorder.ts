const CANDIDATES = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

/** First recording format the browser supports, preferring MP4 (plays everywhere), or '' for the browser default. */
export function pickMime(isSupported: (t: string) => boolean): string {
  return CANDIDATES.find((t) => isSupported(t)) ?? '';
}

export const extFor = (mime: string) => (mime.startsWith('video/mp4') ? 'mp4' : 'webm');
