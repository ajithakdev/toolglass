/** ISO 8601 in the given zone with its offset, e.g. 2025-01-01T05:30:00+05:30. */
export function isoWithOffset(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const p = (type: Intl.DateTimeFormatPartTypes) => parts.find((x) => x.type === type)?.value ?? '';
  // longOffset is "GMT+05:30", or plain "GMT" for UTC
  const offset = p('timeZoneName').replace('GMT', '') || '+00:00';
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:${p('second')}${offset}`;
}

/** RFC 2822, as used in email and HTTP headers: Wed, 01 Jan 2025 00:00:00 +0000. */
export function rfc2822(date: Date): string {
  return date.toUTCString().replace('GMT', '+0000');
}
