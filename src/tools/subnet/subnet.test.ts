import { describe, expect, it } from 'vitest';
import { fmtV6, splitSubnet, subnet } from './subnet';

describe('subnet', () => {
  it('works out an IPv4 /24', () => {
    expect(subnet('192.168.1.130/24')).toMatchObject({
      network: '192.168.1.0', broadcast: '192.168.1.255', netmask: '255.255.255.0', wildcard: '0.0.0.255',
      firstHost: '192.168.1.1', lastHost: '192.168.1.254', hosts: 254n, type: 'Private (RFC 1918)',
    });
  });
  it('handles /31, /32, and /0', () => {
    expect(subnet('10.0.0.0/31')).toMatchObject({ hosts: 2n, firstHost: '10.0.0.0', lastHost: '10.0.0.1' });
    expect(subnet('8.8.8.8')).toMatchObject({ prefix: 32, hosts: 1n, type: 'Public' });
    expect(subnet('0.0.0.0/0')!.total).toBe(4294967296n);
  });
  it('rejects bad input', () => {
    for (const bad of ['256.1.1.1', '1.2.3', '1.2.3.4/33', '01.2.3.4', '1.2.3.4/x', '1::2::3', 'gggg::', '1:2:3:4:5:6:7:8:9']) expect(subnet(bad), bad).toBeNull();
  });
  it('works out an IPv6 /48', () => {
    expect(subnet('2001:0db8:abcd:0012::1/48')).toMatchObject({
      address: '2001:db8:abcd:12::1', network: '2001:db8:abcd::', lastHost: '2001:db8:abcd:ffff:ffff:ffff:ffff:ffff', type: 'Documentation',
      total: 1n << 80n,
    });
  });
  it('reads embedded IPv4 and names special ranges', () => {
    expect(subnet('::ffff:192.168.0.1')).toMatchObject({ address: '::ffff:c0a8:1', type: 'IPv4-mapped' });
    expect(subnet('fe80::1/64')!.type).toBe('Link-local');
    expect(subnet('::1')!.type).toBe('Loopback');
  });
  it('compresses only the longest zero run, and not a single zero', () => {
    expect(fmtV6(0x20010db8000000010000000000000001n)).toBe('2001:db8:0:1::1');
    expect(fmtV6(0x20010db8000100010001000100010001n)).toBe('2001:db8:1:1:1:1:1:1');
    expect(fmtV6(0n)).toBe('::');
  });

  it('splits a block into smaller ones', () => {
    expect(splitSubnet('192.168.0.0/24', 26)).toEqual({ subnets: ['192.168.0.0/26', '192.168.0.64/26', '192.168.0.128/26', '192.168.0.192/26'], total: 4n });
    expect(splitSubnet('2001:db8::/32', 48, 2)).toEqual({ subnets: ['2001:db8::/48', '2001:db8:1::/48'], total: 65536n });
    expect(splitSubnet('10.0.0.0/24', 24)).toBeNull();
  });
});
