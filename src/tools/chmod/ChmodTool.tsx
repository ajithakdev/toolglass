import { useState, useMemo, useEffect } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { useUrlState } from '../../hooks/useUrlState';
import {
  toOctal,
  toSymbolic,
  toSymbolicCommand,
  parseOctal,
  escapeShellArg,
  DEFAULT_CHMOD_STATE,
  PRESETS,
  type ChmodState,
  type PermissionState,
  type SpecialBitsState,
} from './chmod';

export default function ChmodTool() {
  const [octalParam, setOctalParam] = useUrlState('v', '755', String, String);
  const [filename, setFilename] = useState('script.sh');
  const [fileType, setFileType] = useState<'file' | 'dir'>('file');

  const [state, setState] = useState<ChmodState>(() => {
    return parseOctal(octalParam) || DEFAULT_CHMOD_STATE;
  });

  const octal = useMemo(() => toOctal(state), [state]);
  const [octalInput, setOctalInput] = useState(octal);

  useEffect(() => {
    setOctalInput(octal);
  }, [octal]);

  useEffect(() => {
    const parsed = parseOctal(octalParam);
    if (parsed) {
      setState(parsed);
    }
  }, [octalParam]);

  const symbolic = useMemo(() => toSymbolic(state), [state]);
  const symbolicCmd = useMemo(() => toSymbolicCommand(state), [state]);

  const updateState = (updater: (prev: ChmodState) => ChmodState) => {
    setState((prev) => {
      const next = updater(prev);
      setOctalParam(toOctal(next));
      return next;
    });
  };

  const handleOctalInput = (val: string) => {
    const filtered = val.replace(/[^0-7]/g, '').slice(0, 4);
    setOctalInput(filtered);
    const parsed = parseOctal(filtered);
    if (parsed) {
      setState(parsed);
      setOctalParam(toOctal(parsed));
    }
  };

  const handleOctalBlur = () => {
    setOctalInput(octal);
  };

  const setPerm = (role: 'user' | 'group' | 'other', perm: keyof PermissionState, val: boolean) => {
    updateState((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: val,
      },
    }));
  };

  const setSpecial = (bit: keyof SpecialBitsState, val: boolean) => {
    updateState((prev) => ({
      ...prev,
      special: {
        ...prev.special,
        [bit]: val,
      },
    }));
  };

  const applyPreset = (octalValue: string) => {
    const parsed = parseOctal(octalValue);
    if (parsed) {
      setState(parsed);
      setOctalParam(octalValue);
    }
  };

  const reset = () => {
    setState(DEFAULT_CHMOD_STATE);
    setOctalParam('755');
  };

  const isDirectory = fileType === 'dir';
  const targetName = filename || (isDirectory ? 'directory' : 'script.sh');
  const safeFilename = escapeShellArg(targetName);
  const chmodCmd = `chmod ${octal} ${safeFilename}`;
  const chmodSymCmd = `chmod ${symbolicCmd} ${safeFilename}`;
  const lsStyle = `${isDirectory ? 'd' : '-'}${symbolic} 1 user staff 4096 Sep 7 12:00 ${targetName}`;

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Quick Presets */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--ink)' }}>
            Common Security Presets
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map((p) => {
              const active = octal === p.octal;
              return (
                <button
                  key={p.octal}
                  type="button"
                  onClick={() => applyPreset(p.octal)}
                  title={p.description}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: active ? 'rgba(139, 92, 246, 0.18)' : 'var(--surface-button-off)',
                    border: `1px solid ${active ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Output Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {/* Octal */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: 'var(--surface-nav-item)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
              Octal Notation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <input
                type="text"
                value={octalInput}
                onChange={(e) => handleOctalInput(e.target.value)}
                onBlur={handleOctalBlur}
                maxLength={4}
                aria-label="Octal permission value"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '90px',
                }}
              />
              <CopyButton value={octal} label="Copy" size="sm" />
            </div>
          </div>

          {/* Symbolic */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: 'var(--surface-nav-item)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
              Symbolic Notation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>
                {symbolic}
              </span>
              <CopyButton value={symbolic} label="Copy" size="sm" />
            </div>
          </div>
        </div>

        {/* Permission Matrix */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid var(--glass-border)',
            background: 'var(--surface-nav-item)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--glass-border)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Permission Matrix
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 12 }}>
                  <th style={{ padding: '12px 18px' }}>Entity</th>
                  <th style={{ padding: '12px 18px' }}>Read (4)</th>
                  <th style={{ padding: '12px 18px' }}>Write (2)</th>
                  <th style={{ padding: '12px 18px' }}>Execute (1)</th>
                </tr>
              </thead>
              <tbody>
                {(['user', 'group', 'other'] as const).map((role) => {
                  const label = role === 'user' ? 'Owner / User (u)' : role === 'group' ? 'Group (g)' : 'Others / Public (o)';
                  return (
                    <tr key={role} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: 13 }}>{label}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={state[role].read}
                            onChange={(e) => setPerm(role, 'read', e.target.checked)}
                            style={{ accentColor: '#8b5cf6', width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13 }}>Read</span>
                        </label>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={state[role].write}
                            onChange={(e) => setPerm(role, 'write', e.target.checked)}
                            style={{ accentColor: '#8b5cf6', width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13 }}>Write</span>
                        </label>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={state[role].execute}
                            onChange={(e) => setPerm(role, 'execute', e.target.checked)}
                            style={{ accentColor: '#8b5cf6', width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13 }}>Execute</span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Special Flags */}
        <div
          style={{
            padding: '16px 18px',
            borderRadius: 16,
            border: '1px solid var(--glass-border)',
            background: 'var(--surface-nav-item)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Special Bits</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={state.special.suid}
                onChange={(e) => setSpecial('suid', e.target.checked)}
                style={{ accentColor: '#8b5cf6', marginTop: 3 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Setuid (SUID · 4000)</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Executes with file owner privileges</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={state.special.sgid}
                onChange={(e) => setSpecial('sgid', e.target.checked)}
                style={{ accentColor: '#8b5cf6', marginTop: 3 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Setgid (SGID · 2000)</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Inherits group permissions</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={state.special.sticky}
                onChange={(e) => setSpecial('sticky', e.target.checked)}
                style={{ accentColor: '#8b5cf6', marginTop: 3 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Sticky Bit (1000)</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Only owner can delete file in directory</div>
              </div>
            </label>
          </div>
        </div>

        {/* Commands & File Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Target name:</span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder={isDirectory ? 'directory' : 'script.sh'}
                aria-label="Target file name"
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: 'var(--surface-input)',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 500 }}>Type:</span>
              <button
                type="button"
                onClick={() => setFileType('file')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: !isDirectory ? 'rgba(139, 92, 246, 0.18)' : 'var(--surface-button-off)',
                  border: `1px solid ${!isDirectory ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                  color: 'var(--ink)',
                }}
              >
                File (-)
              </button>
              <button
                type="button"
                onClick={() => setFileType('dir')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: isDirectory ? 'rgba(139, 92, 246, 0.18)' : 'var(--surface-button-off)',
                  border: `1px solid ${isDirectory ? 'rgba(139, 92, 246, 0.4)' : 'var(--line)'}`,
                  color: 'var(--ink)',
                }}
              >
                Directory (d)
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--surface-input)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
              {chmodCmd}
            </code>
            <CopyButton value={chmodCmd} label="Copy" size="sm" />
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--surface-input)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-soft)' }}>
              {chmodSymCmd}
            </code>
            <CopyButton value={chmodSymCmd} label="Copy" size="sm" />
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--surface-input)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
              {lsStyle}
            </code>
            <CopyButton value={lsStyle} label="Copy" size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={reset} variant="soft">
            Reset to 755
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
