import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Dropdown, Field, Slider, TextInput } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { fitSize, formatBytes, renameFor } from './image';

const FORMATS = [
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG (lossless)' },
  { value: 'image/avif', label: 'AVIF' },
];

type Result = { blob: Blob; url: string; width: number; height: number };

async function encode(file: File, type: string, quality: number, maxW: number, maxH: number): Promise<Result> {
  // createImageBitmap applies EXIF orientation, so rotated phone photos stay upright
  const bmp = await createImageBitmap(file);
  const { width, height } = fitSize(bmp.width, bmp.height, maxW, maxH);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (type === 'image/jpeg') {
    // JPEG has no alpha: flatten onto white instead of black
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  if (!blob) throw new Error('encode failed');
  // Browsers that can't encode a format silently return PNG
  if (blob.type !== type) throw new Error(`This browser cannot save ${type.split('/')[1]!.toUpperCase()}. Pick another format.`);
  return { blob, url: URL.createObjectURL(blob), width, height };
}

export default function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [type, setType] = useState('image/webp');
  const [quality, setQuality] = useState(80);
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let made: Result | null = null;
    setError('');
    const t = setTimeout(() => {
      encode(file, type, quality / 100, Number(maxW) || 0, Number(maxH) || 0)
        .then((r) => {
          made = r;
          if (cancelled) URL.revokeObjectURL(r.url);
          else setResult(r);
        })
        .catch((e: Error) => {
          if (cancelled) return;
          setResult(null);
          setError(e.message === 'encode failed' ? 'Could not read this image.' : e.message);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (made) URL.revokeObjectURL(made.url);
    };
  }, [file, type, quality, maxW, maxH]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('That is not an image file.');
    setResult(null);
    setFile(f);
  };

  const saved = file && result ? Math.round((1 - result.blob.size / file.size) * 100) : 0;

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files[0]);
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
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              pick(f);
            }}
          />
          <strong style={{ color: 'var(--ink)' }}>{file ? file.name : 'Drop an image here, or click to choose one'}</strong>
          <span style={{ fontSize: 'var(--t-sm)' }}>{file ? formatBytes(file.size) : 'JPEG, PNG, WebP, AVIF, GIF. It never leaves your device.'}</span>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
          <Field label="Format">
            <Dropdown value={type} options={FORMATS} onChange={setType} />
          </Field>
          <Field label="Max width (px)">
            <TextInput inputMode="numeric" placeholder="Original" value={maxW} onChange={(e) => setMaxW(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Max height (px)">
            <TextInput inputMode="numeric" placeholder="Original" value={maxH} onChange={(e) => setMaxH(e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>
        {type !== 'image/png' && (
          <Field label="Quality" hint={`${quality}%`}>
            <Slider value={quality} onChange={setQuality} min={10} max={100} />
          </Field>
        )}

        {error && <p role="alert" style={{ margin: 0, color: 'var(--status-error)' }}>{error}</p>}

        {file && result && (
          <div className="glass-strong" style={{ padding: 16, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div role="status" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="num">
                {formatBytes(file.size)} → <strong>{formatBytes(result.blob.size)}</strong>{' '}
                <span style={{ color: saved > 0 ? 'var(--status-success)' : 'var(--status-warn)' }}>
                  ({saved > 0 ? `${saved}% smaller` : `${-saved}% larger`})
                </span>{' '}
                · {result.width}×{result.height}
              </span>
              <Button
                variant="primary"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = result.url;
                  a.download = renameFor(file.name, type);
                  a.click();
                }}
              >
                Download
              </Button>
            </div>
            <img src={result.url} alt="Compressed preview" style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
            <p style={{ margin: 0, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
              Saving re-encodes the image, which removes EXIF metadata such as GPS location and camera details.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
