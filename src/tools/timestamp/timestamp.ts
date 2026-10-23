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

// ── Cron (5-field: minute hour day-of-month month day-of-week) ──
// Returns the sorted values a field allows, or null when it is malformed or out of range.
function parseCronField(pattern: string, min: number, max: number): number[] | null {
  const out = new Set<number>();
  const int = (s: string) => (/^\d+$/.test(s) ? Number(s) : NaN);
  for (const sub of pattern.split(',')) {
    const [range, stepStr] = sub.split('/');
    const step = stepStr === undefined ? 1 : int(stepStr);
    if (!range || !(step > 0) || sub.split('/').length > 2) return null;
    let start: number, end: number;
    if (range === '*') {
      [start, end] = [min, max];
    } else if (range.includes('-')) {
      const [s, e, extra] = range.split('-');
      if (extra !== undefined) return null;
      [start, end] = [int(s!), int(e!)];
    } else {
      start = int(range);
      end = stepStr === undefined ? start : max; // "5/15" means from 5 to max
    }
    if (!(start >= min && end <= max && start <= end)) return null;
    for (let i = start; i <= end; i += step) out.add(i);
  }
  return [...out].sort((a, b) => a - b);
}

export function parseCron(cron: string) {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minPat, hourPat, domPat, monthPat, dowPat] = parts as [string, string, string, string, string];
  const minutes = parseCronField(minPat, 0, 59);
  const hours = parseCronField(hourPat, 0, 23);
  const doms = parseCronField(domPat, 1, 31);
  const months = parseCronField(monthPat, 1, 12);
  const dowsRaw = parseCronField(dowPat, 0, 7);
  if (!minutes || !hours || !doms || !months || !dowsRaw) return null;
  // 7 is Sunday too
  const dows = [...new Set(dowsRaw.map((d) => d % 7))];
  // Standard cron: when both day fields are restricted, a day matches either one
  const domAny = domPat.startsWith('*');
  const dowAny = dowPat.startsWith('*');
  const dayMatches = (d: Date) => {
    const dom = doms.includes(d.getDate());
    const dow = dows.includes(d.getDay());
    return !domAny && !dowAny ? dom || dow : dom && dow;
  };
  return { minutes, hours, months, dayMatches };
}

export function getNextCronRuns(cron: string, count = 5, from = new Date()): Date[] {
  const spec = parseCron(cron);
  if (!spec) return [];
  const runs: Date[] = [];
  const first = new Date(from);
  first.setSeconds(0, 0);
  first.setMinutes(first.getMinutes() + 1);
  const day = new Date(first);
  day.setHours(0, 0, 0, 0);
  // Step a day at a time; 8 years covers Feb 29 across a skipped leap year (e.g. 2100)
  for (let i = 0; i < 366 * 8 && runs.length < count; i++, day.setDate(day.getDate() + 1)) {
    if (!spec.months.includes(day.getMonth() + 1) || !spec.dayMatches(day)) continue;
    for (const h of spec.hours) {
      for (const m of spec.minutes) {
        const run = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
        // Skip times before `from`, and wall-clock times a DST jump moved
        if (run < first || run.getHours() !== h) continue;
        runs.push(run);
        if (runs.length === count) return runs;
      }
    }
  }
  return runs;
}

export function describeCron(cron: string): string {
  if (!parseCron(cron)) return 'Invalid cron expression';
  const [minPat, hourPat, domPat, monthPat, dowPat] = cron.trim().split(/\s+/);
  const describeField = (pat: string | undefined, name: string) => {
    if (!pat || pat === '*') return `every ${name}`;
    if (pat.startsWith('*/')) return `every ${pat.slice(2)} ${name}s`;
    return `at ${name} ${pat}`;
  };
  return `Runs ${describeField(minPat, 'minute')}, ${describeField(hourPat, 'hour')}, on day ${describeField(domPat, 'of month')}, in ${describeField(monthPat, 'month')}, on ${describeField(dowPat, 'day of week')}.`;
}
