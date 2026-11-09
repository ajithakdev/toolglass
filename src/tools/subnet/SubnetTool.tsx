import { useMemo } from 'react';
import { CopyButton } from '../../components/ui/CopyButton';
import { Dropdown, Field, TextInput } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';
import { splitSubnet, subnet } from './subnet';

const fmtCount = (n: bigint) => (n < 10n ** 15n ? Number(n).toLocaleString() : `2^${n.toString(2).length - 1}`);

export default function SubnetTool() {
  const [input, setInput] = useUrlState('ip', '192.168.1.10/24', (v) => v, (v) => v);
  const info = useMemo(() => subnet(input), [input]);
  const [splitTo, setSplitTo] = useUrlState('split', '', (v) => v, (v) => v);
  const bits = info?.version === 6 ? 128 : 32;
  const split = useMemo(() => (info && splitTo ? splitSubnet(`${info.network}/${info.prefix}`, Number(splitTo)) : null), [info, splitTo]);

  const rows: [string, string][] = info
    ? [
        ['Address', info.address],
        ['Network', `${info.network}/${info.prefix}`],
        ...(info.version === 4
          ? ([
              ['Netmask', info.netmask!],
              ['Wildcard', info.wildcard!],
              ['Broadcast', info.broadcast!],
            ] as [string, string][])
          : []),
        ['First usable', info.firstHost],
        ['Last usable', info.lastHost],
        ['Usable addresses', fmtCount(info.hosts)],
        ['Total addresses', fmtCount(info.total)],
        ['Type', info.type],
      ]
    : [];

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="IP address with prefix" hint={input.trim() && !info ? <span style={{ color: 'var(--status-error)' }}>Not a valid IPv4 or IPv6 address</span> : 'IPv4 or IPv6, e.g. 10.0.0.0/8 or 2001:db8::/32'}>
          <TextInput value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className="num" />
        </Field>
        {info && (
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, margin: 0 }}>
            {rows.map(([label, value]) => (
              <div key={label} className="glass-strong" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <dt style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>{label}</dt>
                  <dd className="num" style={{ margin: 0, fontWeight: 650, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{value}</dd>
                </div>
                <CopyButton value={value} label={`Copy ${label}`} compact />
              </div>
            ))}
          </dl>
        )}
        {info && info.prefix < bits && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Split into smaller subnets" style={{ maxWidth: 320 }}>
              <Dropdown
                value={splitTo}
                onChange={setSplitTo}
                options={[{ value: '', label: 'Choose a size…' }, ...Array.from({ length: Math.min(bits - info.prefix, 16) }, (_, i) => {
                  const p = info.prefix + i + 1;
                  return { value: String(p), label: `/${p} (${(2n ** BigInt(i + 1)).toLocaleString()} subnets)` };
                })]}
              />
            </Field>
            {split && (
              <>
                <ol className="num glass-strong" style={{ margin: 0, padding: '12px 16px 12px 48px', columns: '220px', fontSize: 'var(--t-sm)' }}>
                  {split.subnets.map((s) => <li key={s}>{s}</li>)}
                </ol>
                {split.total > BigInt(split.subnets.length) && <p style={{ margin: 0, color: 'var(--ink-mute)', fontSize: 'var(--t-sm)' }}>Showing the first {split.subnets.length} of {split.total.toLocaleString()}.</p>}
              </>
            )}
          </section>
        )}
      </div>
    </ToolLayout>
  );
}
