import { useEffect, useState } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { CopyButton } from '../../components/ui/CopyButton';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { ALGOS, hashFile, hashText, type Algo } from './hash';

function formatBytes(n: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${i ? n.toFixed(1) : n} ${units[i]}`;
}

function TextMode() {
  const [input, setInput] = useState('hello world');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [out, setOut] = useState('');

  useEffect(() => {
    let alive = true;
    hashText(input, algo).then((h) => {
      if (alive) {
        setOut(h);
      }
    });
    return () => {
      alive = false;
    };
  }, [input, algo]);

  return (
    <>
      <Field label="Input">
        <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
      </Field>
      <Field label="Algorithm">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALGOS.map((a) => (
            <Button key={a} variant={algo === a ? 'primary' : 'soft'} size="sm" onClick={() => setAlgo(a)}>
              {a}
            </Button>
          ))}
        </div>
      </Field>
      <Output value={out} multiline placeholder="Hash will appear here" label={`${algo} hash`} />
    </>
  );
}

function FileMode() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [hashes, setHashes] = useState<Record<Algo, string> | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    let alive = true;
    setHashes(null);
    setError('');
    setProgress(0);
    hashFile(file, (f) => alive && setProgress(f))
      .then((h) => alive && setHashes(h))
      .catch(() => alive && setError('Could not read this file.'));
    return () => {
      alive = false;
    };
  }, [file]);

  return (
    <>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: 6,
          padding: 'var(--s-6) var(--s-4)',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: 'var(--radius)',
          border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          background: dragging ? 'var(--surface-3)' : 'var(--surface-2)',
          color: 'var(--ink-soft)',
        }}
      >
        <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        <strong style={{ color: 'var(--ink)' }}>{file ? file.name : 'Drop a file here, or click to choose one'}</strong>
        <span style={{ fontSize: 'var(--t-sm)' }}>
          {file ? formatBytes(file.size) : 'Any file type. It never leaves your device.'}
        </span>
      </label>

      {file && !hashes && !error && (
        <div role="progressbar" aria-label="Hashing file" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width 120ms linear' }} />
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>Hashing… {Math.round(progress * 100)}%</p>
        </div>
      )}
      {error && <p role="alert" style={{ margin: 0, color: 'var(--status-error)' }}>{error}</p>}

      {hashes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALGOS.map((a) => (
            <div key={a} style={{ display: 'grid', gridTemplateColumns: '96px 1fr auto', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-mute)' }}>{a}</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-sm)', wordBreak: 'break-all' }}>{hashes[a]}</code>
              <CopyButton value={hashes[a]} size="sm" label={`Copy ${a}`} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function HashTool() {
  const [mode, setMode] = useState<'text' | 'file'>('text');

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented
          label="Input type"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'text', label: 'Text' },
            { value: 'file', label: 'File' },
          ]}
        />
        {mode === 'text' ? <TextMode /> : <FileMode />}
      </div>
    </ToolLayout>
  );
}
