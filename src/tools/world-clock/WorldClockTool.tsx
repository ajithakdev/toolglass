import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dropdown, Field, TextInput } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { ToolLayout } from '../../components/ToolLayout';
import { createListStore } from '../../lib/listStore';
import { isoWithOffset } from '../timestamp/timestamp';

const LOCAL = Intl.DateTimeFormat().resolvedOptions().timeZone;
const ALL_ZONES: string[] = Intl.supportedValuesOf?.('timeZone') ?? ['UTC', 'Europe/London', 'America/New_York', 'Asia/Kolkata', 'Asia/Tokyo'];
const zones = createListStore('toolglass_world_clock', 20);
if (!zones.get().length) zones.set(['UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo']);

/** datetime-local value for a Date, in the browser's zone */
const toInput = (d: Date) => isoWithOffset(d, LOCAL).slice(0, 16);

export default function WorldClockTool() {
  const list = zones.use();
  const [now, setNow] = useState(() => new Date());
  const [at, setAt] = useState(''); // empty = live
  useEffect(() => {
    if (at) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [at]);

  const when = at ? new Date(at) : now;
  const fmt = (tz: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(undefined, { timeZone: tz, ...opts }).format(when);
  const offset = (tz: string) => isoWithOffset(when, tz).slice(19);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'end' }}>
          <Field label="Add a time zone">
            <Dropdown value="" options={[{ value: '', label: 'Choose a zone…' }, ...ALL_ZONES.filter((z) => !list.includes(z)).map((z) => ({ value: z, label: z.replace(/_/g, ' ') }))]} onChange={(z) => z && zones.set([...list, z])} />
          </Field>
          <Field label="Compare a moment (your time)" hint={at ? undefined : 'Live'}>
            <TextInput type="datetime-local" value={at || toInput(now)} onChange={(e) => setAt(e.target.value)} />
          </Field>
          {at && (
            <div>
              <Button variant="soft" onClick={() => setAt('')}>
                Back to now
              </Button>
            </div>
          )}
        </div>
        <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {[LOCAL, ...list.filter((z) => z !== LOCAL)].map((tz) => (
            <li key={tz} className="glass-strong" style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 650, color: 'var(--ink)' }}>
                  {tz.replace(/_/g, ' ')} {tz === LOCAL && <span style={{ fontWeight: 400, color: 'var(--ink-mute)' }}>· you</span>}
                </div>
                <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
                  {fmt(tz, { weekday: 'short', day: 'numeric', month: 'short' })} · UTC{offset(tz) === '+00:00' ? '' : offset(tz)}
                </div>
              </div>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(tz, { hour: '2-digit', minute: '2-digit', second: at ? undefined : '2-digit' })}
              </div>
              {tz !== LOCAL && (
                <button type="button" className="nav-btn" aria-label={`Remove ${tz}`} onClick={() => zones.set(list.filter((z) => z !== tz))}>
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </ToolLayout>
  );
}
