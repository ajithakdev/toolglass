import { useMemo, useState } from 'react';
import { CopyButton } from '../../components/ui/CopyButton';
import { Field, TextInput } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { detect, search, type MimeEntry } from './mime';

// Enough for every signature in the table, including ISO at byte 32769
const SNIFF_BYTES = 32774;

function Card({ e }: { e: MimeEntry }) {
  return (
    <div className="glass-strong" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 650, color: 'var(--ink)' }}>
          {e.name} <span style={{ fontWeight: 400, color: 'var(--ink-mute)' }}>.{e.ext.join(', .')}</span>
        </div>
        <div className="num" style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-soft)', overflowWrap: 'anywhere' }}>{e.mime}</div>
        {e.magic && (
          <div className="num" style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
            Magic: {e.magic.hex.match(/../g)!.join(' ')}
            {e.magic.offset ? ` at byte ${e.magic.offset}` : ''}
          </div>
        )}
      </div>
      <CopyButton size="sm" value={e.mime} />
    </div>
  );
}

export default function MimeTypesTool() {
  const [q, setQ] = useState('');
  const [file, setFile] = useState<{ name: string; type: string; matches: MimeEntry[] } | null>(null);
  const list = useMemo(() => search(q), [q]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const bytes = new Uint8Array(await f.slice(0, SNIFF_BYTES).arrayBuffer());
    setFile({ name: f.name, type: f.type, matches: detect(bytes) });
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'end' }}>
          <Field label="Search" hint={`${list.length} types`}>
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder=".webp, application/json, font…" />
          </Field>
          <Field label="Or check a file's real type">
            <input type="file" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} style={{ color: 'var(--ink-soft)', fontSize: 'var(--t-sm)' }} />
          </Field>
        </div>
        {file && (
          <section role="status" className="glass" style={{ padding: 16, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <strong>{file.name}</strong> · the browser says <span className="num">{file.type || 'unknown'}</span>
            </div>
            {file.matches.length ? (
              <>
                <div style={{ color: 'var(--ink-soft)', fontSize: 'var(--t-sm)' }}>File signature matches:</div>
                {file.matches.map((e) => <Card key={e.mime + e.ext[0]} e={e} />)}
              </>
            ) : (
              <div style={{ color: 'var(--ink-soft)' }}>No known signature. Likely a text format, or a type without magic bytes.</div>
            )}
          </section>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
          {list.map((e) => <Card key={e.mime + e.ext[0]} e={e} />)}
        </div>
      </div>
    </ToolLayout>
  );
}
