export interface SubnetInfo {
  version: 4 | 6;
  address: string;
  prefix: number;
  network: string;
  /** IPv4 only */
  broadcast?: string;
  netmask?: string;
  wildcard?: string;
  firstHost: string;
  lastHost: string;
  /** Usable hosts (IPv4: excludes network and broadcast, except /31 and /32) */
  hosts: bigint;
  total: bigint;
  type: string;
}

function parseV4(s: string): bigint | null {
  const parts = s.split('.');
  if (parts.length !== 4) return null;
  let n = 0n;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255 || (p.length > 1 && p[0] === '0')) return null;
    n = (n << 8n) | BigInt(p);
  }
  return n;
}
const fmtV4 = (n: bigint) => [24n, 16n, 8n, 0n].map((s) => (n >> s) & 255n).join('.');

function parseV6(s: string): bigint | null {
  // Trailing embedded IPv4 (::ffff:1.2.3.4)
  const v4 = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) {
    const n = parseV4(v4[2]!);
    if (n === null) return null;
    s = `${v4[1]}${(n >> 16n).toString(16)}:${(n & 0xffffn).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  let n = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(g)) return null;
    n = (n << 16n) | BigInt(parseInt(g, 16));
  }
  return n;
}

/** RFC 5952 form: lowercase, no leading zeros, longest run of 2+ zero groups as :: */
export function fmtV6(n: bigint): string {
  const g = Array.from({ length: 8 }, (_, i) => Number((n >> BigInt(112 - i * 16)) & 0xffffn));
  let best = -1;
  let len = 0;
  for (let i = 0; i < 8; ) {
    if (g[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && g[j] === 0) j++;
    if (j - i > len && j - i > 1) [best, len] = [i, j - i];
    i = j;
  }
  const hex = g.map((x) => x.toString(16));
  if (best < 0) return hex.join(':');
  return `${hex.slice(0, best).join(':')}::${hex.slice(best + len).join(':')}`;
}

function typeV4(n: bigint): string {
  const a = Number(n >> 24n);
  const b = Number((n >> 16n) & 255n);
  if (a === 10 || (a === 172 && b >= 16 && b < 32) || (a === 192 && b === 168)) return 'Private (RFC 1918)';
  if (a === 127) return 'Loopback';
  if (a === 169 && b === 254) return 'Link-local';
  if (a === 100 && b >= 64 && b < 128) return 'Carrier-grade NAT';
  if (a >= 224 && a < 240) return 'Multicast';
  if (a >= 240) return 'Reserved';
  if (a === 0) return '"This" network';
  return 'Public';
}

function typeV6(n: bigint): string {
  const top = Number(n >> 112n);
  if (n === 1n) return 'Loopback';
  if (n === 0n) return 'Unspecified';
  if ((top & 0xfe00) === 0xfc00) return 'Unique local (private)';
  if ((top & 0xffc0) === 0xfe80) return 'Link-local';
  if ((top & 0xff00) === 0xff00) return 'Multicast';
  if (n >> 32n === 0xffffn) return 'IPv4-mapped';
  if (top === 0x2001 && Number((n >> 96n) & 0xffffn) === 0xdb8) return 'Documentation';
  return 'Global unicast';
}

/** Parse "192.168.1.10/24", "2001:db8::/48", or a bare address (treated as /32 or /128). */
export function subnet(input: string): SubnetInfo | null {
  const [addr = '', p] = input.trim().split('/');
  const v6 = addr.includes(':');
  const bits = v6 ? 128 : 32;
  const n = v6 ? parseV6(addr) : parseV4(addr);
  if (n === null || (p !== undefined && !/^\d{1,3}$/.test(p))) return null;
  const prefix = p === undefined ? bits : Number(p);
  if (prefix > bits) return null;
  const B = BigInt(bits);
  const all = (1n << B) - 1n;
  const mask = (all << (B - BigInt(prefix))) & all;
  const network = n & mask;
  const last = network | (~mask & all);
  const total = 1n << (B - BigInt(prefix));
  const fmt = v6 ? fmtV6 : fmtV4;
  if (v6) return { version: 6, address: fmtV6(n), prefix, network: fmtV6(network), firstHost: fmtV6(network), lastHost: fmtV6(last), hosts: total, total, type: typeV6(n) };
  const small = prefix >= 31;
  return {
    version: 4,
    address: fmt(n),
    prefix,
    network: fmt(network),
    broadcast: fmt(last),
    netmask: fmt(mask),
    wildcard: fmt(~mask & all),
    firstHost: fmt(small ? network : network + 1n),
    lastHost: fmt(small ? last : last - 1n),
    hosts: small ? total : total - 2n,
    total,
    type: typeV4(n),
  };
}

/** Split a block into smaller blocks of `newPrefix`. Lists at most `limit`; `total` is the full count. */
export function splitSubnet(cidr: string, newPrefix: number, limit = 256): { subnets: string[]; total: bigint } | null {
  const info = subnet(cidr);
  if (!info) return null;
  const bits = info.version === 6 ? 128 : 32;
  if (newPrefix <= info.prefix || newPrefix > bits) return null;
  const start = info.version === 6 ? parseV6(info.network)! : parseV4(info.network)!;
  const step = 1n << BigInt(bits - newPrefix);
  const total = 1n << BigInt(newPrefix - info.prefix);
  const fmt = info.version === 6 ? fmtV6 : fmtV4;
  const subnets: string[] = [];
  for (let i = 0n; i < total && i < BigInt(limit); i++) subnets.push(`${fmt(start + i * step)}/${newPrefix}`);
  return { subnets, total };
}
