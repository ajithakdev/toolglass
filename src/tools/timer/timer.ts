/** 83_456 ms -> "01:23.45"; with hours -> "1:02:03.45". Negative values clamp to zero. */
export function formatDuration(ms: number, showCentis = true): string {
  const total = Math.max(0, Math.floor(ms / 10));
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return showCentis ? `${base}.${pad(cs)}` : base;
}
