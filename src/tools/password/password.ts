export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?~',
};

export interface PwdOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

function randInt(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return buf[0]! % max;
  }
}

export function generatePassword(opts: PwdOptions): string {
  const sets: string[] = [];
  if (opts.uppercase) sets.push(CHARSETS.uppercase);
  if (opts.lowercase) sets.push(CHARSETS.lowercase);
  if (opts.numbers) sets.push(CHARSETS.numbers);
  if (opts.symbols) sets.push(CHARSETS.symbols);
  if (sets.length === 0) return '';
  const pool = sets.join('');
  const len = Math.max(4, Math.min(128, opts.length));

  const chars: string[] = [];
  // guarantee at least one from each enabled class
  for (const s of sets.slice(0, len)) chars.push(s.charAt(randInt(s.length)));
  while (chars.length < len) chars.push(pool.charAt(randInt(pool.length)));

  // Fisher–Yates shuffle (CSPRNG)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

export interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  bits: number;
  color: string;
}

export function estimateStrength(pwd: string, opts: PwdOptions): Strength {
  let alphabet = 0;
  if (opts.uppercase) alphabet += 26;
  if (opts.lowercase) alphabet += 26;
  if (opts.numbers) alphabet += 10;
  if (opts.symbols) alphabet += 27;
  if (alphabet === 0) alphabet = 1;
  const bits = pwd.length * Math.log2(alphabet);
  let score: Strength['score'] = 0;
  if (bits >= 28) score = 1;
  if (bits >= 48) score = 2;
  if (bits >= 72) score = 3;
  if (bits >= 100) score = 4;
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#8b5cf6'];
  return { score, label: labels[score]!, bits: Math.round(bits), color: colors[score]! };
}
