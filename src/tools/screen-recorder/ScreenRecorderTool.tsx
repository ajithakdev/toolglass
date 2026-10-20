import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { formatDuration } from '../timer/timer';
import { formatBytes } from '../image-compress/image';
import { extFor, pickMime } from './recorder';

const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined';

export default function ScreenRecorderTool() {
  const [mic, setMic] = useState(false);
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [, tick] = useState(0);
  const [video, setVideo] = useState<{ url: string; size: number; ext: string } | null>(null);
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const streams = useRef<MediaStream[]>([]);

  const stopTracks = () => {
    streams.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    streams.current = [];
  };

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(id);
  }, [recording]);

  // Release the screen and mic if the user leaves mid-recording
  useEffect(() => () => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stopTracks();
  }, []);
  useEffect(() => () => void (video && URL.revokeObjectURL(video.url)), [video]);

  const start = async () => {
    setError('');
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      streams.current = [screen];
      const tracks = [...screen.getTracks()];
      if (mic) {
        try {
          const m = await navigator.mediaDevices.getUserMedia({ audio: true });
          streams.current.push(m);
          // shortcut: with both tab audio and mic, only the first audio track is recorded; mix with Web Audio if people need both
          if (!screen.getAudioTracks().length) tracks.push(...m.getAudioTracks());
          else tracks.splice(tracks.indexOf(screen.getAudioTracks()[0]!), 1, ...m.getAudioTracks());
        } catch {
          setError('Microphone blocked. Recording the screen only.');
        }
      }
      const mimeType = pickMime((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(new MediaStream(tracks), mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stopTracks();
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
        setVideo({ url: URL.createObjectURL(blob), size: blob.size, ext: extFor(rec.mimeType) });
      };
      // The browser's own "Stop sharing" button ends the video track
      screen.getVideoTracks()[0]!.onended = () => rec.state === 'recording' && rec.stop();
      rec.start(1000);
      recorder.current = rec;
      setVideo(null);
      setStartedAt(Date.now());
      setRecording(true);
    } catch (e) {
      stopTracks();
      if ((e as Error).name !== 'NotAllowedError') setError(`Could not start recording: ${(e as Error).message}`);
    }
  };

  const download = () => {
    if (!video) return;
    const a = document.createElement('a');
    a.href = video.url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${video.ext}`;
    a.click();
  };

  if (!supported)
    return (
      <ToolLayout>
        <p>Screen recording needs a desktop browser (Chrome, Edge, Firefox, or Safari). Phones and tablets do not allow it.</p>
      </ToolLayout>
    );

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {recording ? (
            <Button variant="primary" onClick={() => recorder.current?.stop()}>Stop recording</Button>
          ) : (
            <Button variant="primary" onClick={start}>Start recording</Button>
          )}
          {!recording && <Toggle checked={mic} onChange={setMic} label="Include microphone" />}
          {recording && (
            <span role="timer" className="num" style={{ color: 'var(--status-error)', fontWeight: 650 }}>
              ● REC {formatDuration(Date.now() - startedAt, false)}
            </span>
          )}
        </div>
        {error && <p role="alert" style={{ margin: 0, color: 'var(--status-warn)' }}>{error}</p>}
        {video && (
          <div className="glass-strong" style={{ padding: 16, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <video src={video.url} controls style={{ width: '100%', maxHeight: 460, borderRadius: 'var(--radius-sm)', background: '#000' }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button variant="primary" onClick={download}>Download .{video.ext}</Button>
              <span className="num" style={{ color: 'var(--ink-mute)', fontSize: 'var(--t-sm)' }}>{formatBytes(video.size)}</span>
            </div>
          </div>
        )}
        <p style={{ margin: 0, fontSize: 'var(--t-xs)', color: 'var(--ink-mute)' }}>
          Recorded in your browser and kept in memory. Nothing is uploaded. Pick a tab to include its sound.
        </p>
      </div>
    </ToolLayout>
  );
}
