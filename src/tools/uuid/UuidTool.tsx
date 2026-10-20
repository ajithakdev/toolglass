import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Slider, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { useUrlState } from '../../hooks/useUrlState';
import { inspectUuid, uuidv4, uuidv7 } from './uuid';

type Version = '4' | '7';

export default function UuidTool() {
  const [version, setVersion] = useUrlState<Version>('v', '4', (v) => (v === '7' ? '7' : '4'), String);
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);
  const [probe, setProbe] = useState('');

  const gen = () => {
    setIds(Array.from({ length: count }, () => (version === '7' ? uuidv7() : uuidv4())));
  };

  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, version]);

  const info = probe.trim() ? inspectUuid(probe) : undefined;

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented
          label="UUID version"
          value={version}
          onChange={setVersion}
          options={[
            { value: '4', label: 'v4 random' },
            { value: '7', label: 'v7 time-sorted' },
          ]}
        />
        <Field label="Count" hint={`${count}`}>
          <Slider value={count} min={1} max={50} onChange={setCount} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={gen} variant="primary">
            ↻ Regenerate
          </Button>
          <Button onClick={() => setCount(5)} variant="soft">
            Reset
          </Button>
        </div>
        <Output value={ids.join('\n')} multiline placeholder="UUIDs will appear here" />

        <Field label="Inspect a UUID" hint="Version, variant, and the timestamp inside a v7">
          <TextInput value={probe} onChange={(e) => setProbe(e.target.value)} placeholder="Paste any UUID" spellCheck={false} aria-label="UUID to inspect" />
        </Field>
        {info === null && <p role="status" style={{ margin: 0, color: 'var(--status-error)', fontSize: 'var(--t-sm)' }}>Not a valid UUID.</p>}
        {info && (
          <dl role="status" style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', fontSize: 'var(--t-sm)' }}>
            <dt style={{ color: 'var(--ink-mute)' }}>Version</dt>
            <dd style={{ margin: 0 }}>v{info.version}</dd>
            <dt style={{ color: 'var(--ink-mute)' }}>Variant</dt>
            <dd style={{ margin: 0 }}>{info.variant}</dd>
            {info.date && (
              <>
                <dt style={{ color: 'var(--ink-mute)' }}>Created (UTC)</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>{info.date.toISOString()}</dd>
                <dt style={{ color: 'var(--ink-mute)' }}>Created (local)</dt>
                <dd style={{ margin: 0 }}>{info.date.toLocaleString()}</dd>
              </>
            )}
          </dl>
        )}
      </div>
    </ToolLayout>
  );
}
