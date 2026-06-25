import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Field } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { useToolAction } from '../../hooks/useToolAction';

export default function QrTool() {
  const recordAction = useToolAction();
  const [text, setText] = useState('https://github.com/ajithakdev/toolglass');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim() || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text, {
      errorCorrectionLevel,
      width: 256,
      margin: 2,
      color: {
        dark: '#1b1140',
        light: '#ffffff'
      }
    }).then(() => {
      recordAction();
    }).catch(console.error);
  }, [text, errorCorrectionLevel, recordAction]);

  const downloadSVG = async () => {
    try {
      const svg = await QRCode.toString(text, {
        type: 'svg',
        errorCorrectionLevel,
        margin: 2,
        color: { dark: '#1b1140', light: '#ffffff' }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout
      title="QR Code"
      description="Generate QR codes from text or URLs instantly."
      icon="▦"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Field label="Text or URL">
            <textarea
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          <Field label="Error Correction Level">
            <select
              className="input"
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
            >
              <option value="L">Low (~7% restored)</option>
              <option value="M">Medium (~15% restored)</option>
              <option value="Q">Quartile (~25% restored)</option>
              <option value="H">High (~30% restored)</option>
            </select>
          </Field>
        </div>

        <div style={{
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: 'var(--icon-highlight)'
        }}>
          <canvas ref={canvasRef} style={{ width: 256, height: 256, display: 'block' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={downloadPNG} variant="primary">
            Download PNG
          </Button>
          <Button onClick={downloadSVG} variant="soft">
            Download SVG
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
