import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { Segmented } from '../../components/ui/Segmented';
import { ToolLayout } from '../../components/ToolLayout';
import { formatDuration } from './timer';

type Mode = 'stopwatch' | 'timer' | 'pomodoro';
const POMODORO = { focus: 25 * 60_000, break: 5 * 60_000 };

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => void ctx.close();
  } catch {
    /* no audio available */
  }
}

/** Elapsed time that survives tab throttling: measured from timestamps, not tick counts. */
function useClock() {
  const [running, setRunning] = useState(false);
  const [base, setBase] = useState(0); // ms banked before the current run
  const startedAt = useRef(0);
  const [, force] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 50);
    return () => clearInterval(id);
  }, [running]);
  const elapsed = running ? base + performance.now() - startedAt.current : base;
  return {
    running,
    elapsed,
    start: () => {
      startedAt.current = performance.now();
      setRunning(true);
    },
    pause: () => {
      setBase(elapsed);
      setRunning(false);
    },
    reset: () => {
      setBase(0);
      setRunning(false);
    },
  };
}

export default function TimerTool() {
  const [mode, setMode] = useState<Mode>('stopwatch');
  const clock = useClock();
  const [laps, setLaps] = useState<number[]>([]);
  const [minutes, setMinutes] = useState('5');
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [rounds, setRounds] = useState(0);

  const total = mode === 'timer' ? Math.max(0, Number(minutes) || 0) * 60_000 : mode === 'pomodoro' ? POMODORO[phase] : 0;
  const remaining = total - clock.elapsed;
  const done = mode !== 'stopwatch' && clock.running && remaining <= 0;

  useEffect(() => {
    if (!done) return;
    beep();
    if (mode === 'pomodoro') {
      if (phase === 'focus') setRounds((r) => r + 1);
      setPhase((p) => (p === 'focus' ? 'break' : 'focus'));
      clock.reset();
      clock.start();
    } else {
      clock.reset();
    }
    // clock functions are recreated every render; `done` is the only trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const switchMode = (m: Mode) => {
    clock.reset();
    setLaps([]);
    setPhase('focus');
    setMode(m);
  };

  const display = mode === 'stopwatch' ? formatDuration(clock.elapsed) : formatDuration(remaining + 999, false);
  useEffect(() => {
    if (!clock.running) return;
    const prev = document.title;
    document.title = `${display} · Toolglass`;
    return () => void (document.title = prev);
  }, [clock.running, display]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <Segmented<Mode>
          label="Mode"
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'stopwatch', label: 'Stopwatch' },
            { value: 'timer', label: 'Timer' },
            { value: 'pomodoro', label: 'Pomodoro' },
          ]}
        />
        {mode === 'timer' && !clock.running && clock.elapsed === 0 && (
          <Field label="Minutes" style={{ width: 160 }}>
            <TextInput inputMode="decimal" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </Field>
        )}
        {mode === 'pomodoro' && (
          <div style={{ color: 'var(--ink-soft)', fontSize: 'var(--t-sm)' }}>
            {phase === 'focus' ? 'Focus · 25 min' : 'Break · 5 min'} · {rounds} done
          </div>
        )}
        <div role="timer" aria-live="off" className="num" style={{ fontSize: 'clamp(48px, 14vw, 96px)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {display}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {clock.running ? (
            <Button variant="primary" onClick={clock.pause}>Pause</Button>
          ) : (
            <Button variant="primary" onClick={clock.start} disabled={mode === 'timer' && total === 0}>
              {clock.elapsed ? 'Resume' : 'Start'}
            </Button>
          )}
          {mode === 'stopwatch' && clock.running && (
            <Button variant="soft" onClick={() => setLaps([clock.elapsed, ...laps])}>Lap</Button>
          )}
          <Button variant="ghost" onClick={() => { clock.reset(); setLaps([]); setPhase('focus'); }}>Reset</Button>
        </div>
        {laps.length > 0 && (
          <ol reversed className="glass-strong num" style={{ margin: 0, padding: '12px 16px 12px 40px', width: '100%', maxWidth: 360, fontVariantNumeric: 'tabular-nums' }}>
            {laps.map((t, i) => (
              <li key={laps.length - i}>
                {formatDuration(t)} <span style={{ color: 'var(--ink-mute)' }}>(+{formatDuration(t - (laps[i + 1] ?? 0))})</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </ToolLayout>
  );
}
