// Two glass panes; the overlap catches the light. Mirrors public/favicon.svg.
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="tg-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f6cff" />
          <stop offset="1" stopColor="#1d36b8" />
        </linearGradient>
        <linearGradient id="tg-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#cfe3ef" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="38" height="38" rx="11" fill="url(#tg-back)" />
      <rect x="22" y="22" width="38" height="38" rx="11" fill="url(#tg-front)" stroke="var(--ink)" strokeOpacity="0.14" />
      <path d="M22 33a11 11 0 0 1 11-11h9v9a11 11 0 0 1-11 11h-9z" fill="#9fd8ec" />
    </svg>
  );
}
