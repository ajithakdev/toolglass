export interface PermissionState {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface SpecialBitsState {
  suid: boolean;
  sgid: boolean;
  sticky: boolean;
}

export interface ChmodState {
  user: PermissionState;
  group: PermissionState;
  other: PermissionState;
  special: SpecialBitsState;
}

export interface ChmodPreset {
  name: string;
  octal: string;
  description: string;
}

export const PRESETS: ChmodPreset[] = [
  { name: 'Standard File (644)', octal: '644', description: 'Owner read/write, others read-only' },
  { name: 'Executable / Directory (755)', octal: '755', description: 'Owner full, others read/execute' },
  { name: 'Private Key / Secrets (600)', octal: '600', description: 'Owner read/write only, no access for others' },
  { name: 'Private Directory / Script (700)', octal: '700', description: 'Owner full access only' },
  { name: 'Full Access (777)', octal: '777', description: 'Read, write, execute for everyone' },
  { name: 'Sticky Temp Directory (1777)', octal: '1777', description: 'Shared directory where only owner can delete' },
  { name: 'SUID Executable (4755)', octal: '4755', description: 'Runs with permissions of file owner' },
  { name: 'SGID Directory (2775)', octal: '2775', description: 'New files inherit group ownership' },
];

export function calculateOctalPart(perm: PermissionState): number {
  return (perm.read ? 4 : 0) + (perm.write ? 2 : 0) + (perm.execute ? 1 : 0);
}

export function calculateSpecialPart(special: SpecialBitsState): number {
  return (special.suid ? 4 : 0) + (special.sgid ? 2 : 0) + (special.sticky ? 1 : 0);
}

export function toOctal(state: ChmodState): string {
  const u = calculateOctalPart(state.user);
  const g = calculateOctalPart(state.group);
  const o = calculateOctalPart(state.other);
  const s = calculateSpecialPart(state.special);

  return s > 0 ? `${s}${u}${g}${o}` : `${u}${g}${o}`;
}

export function toSymbolic(state: ChmodState): string {
  const uR = state.user.read ? 'r' : '-';
  const uW = state.user.write ? 'w' : '-';
  let uX = '-';
  if (state.special.suid && state.user.execute) uX = 's';
  else if (state.special.suid && !state.user.execute) uX = 'S';
  else if (state.user.execute) uX = 'x';

  const gR = state.group.read ? 'r' : '-';
  const gW = state.group.write ? 'w' : '-';
  let gX = '-';
  if (state.special.sgid && state.group.execute) gX = 's';
  else if (state.special.sgid && !state.group.execute) gX = 'S';
  else if (state.group.execute) gX = 'x';

  const oR = state.other.read ? 'r' : '-';
  const oW = state.other.write ? 'w' : '-';
  let oX = '-';
  if (state.special.sticky && state.other.execute) oX = 't';
  else if (state.special.sticky && !state.other.execute) oX = 'T';
  else if (state.other.execute) oX = 'x';

  return `${uR}${uW}${uX}${gR}${gW}${gX}${oR}${oW}${oX}`;
}

export function toSymbolicCommand(state: ChmodState): string {
  const getPermStr = (p: PermissionState) => {
    let str = '';
    if (p.read) str += 'r';
    if (p.write) str += 'w';
    if (p.execute) str += 'x';
    return str;
  };

  const u = getPermStr(state.user) + (state.special.suid ? 's' : '');
  const g = getPermStr(state.group) + (state.special.sgid ? 's' : '');
  const o = getPermStr(state.other) + (state.special.sticky ? 't' : '');

  return `u=${u},g=${g},o=${o}`;
}

/**
 * Safely escapes an argument for POSIX shells to prevent command injection.
 */
export function escapeShellArg(arg: string): string {
  if (!arg) return "''";
  if (/^[a-zA-Z0-9._/-]+$/.test(arg)) {
    return arg;
  }
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

export function parseOctal(input: string): ChmodState | null {
  const clean = input.trim();
  if (!/^[0-7]{3,4}$/.test(clean)) return null;

  const padded = clean.length === 3 ? `0${clean}` : clean;
  const s = parseInt(padded[0], 10);
  const u = parseInt(padded[1], 10);
  const g = parseInt(padded[2], 10);
  const o = parseInt(padded[3], 10);

  const parsePart = (val: number): PermissionState => ({
    read: (val & 4) !== 0,
    write: (val & 2) !== 0,
    execute: (val & 1) !== 0,
  });

  return {
    special: {
      suid: (s & 4) !== 0,
      sgid: (s & 2) !== 0,
      sticky: (s & 1) !== 0,
    },
    user: parsePart(u),
    group: parsePart(g),
    other: parsePart(o),
  };
}

export const DEFAULT_CHMOD_STATE: ChmodState = {
  special: { suid: false, sgid: false, sticky: false },
  user: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  other: { read: true, write: false, execute: true },
};
