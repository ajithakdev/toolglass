import { useState, useMemo } from 'react';
import { Field, Toggle, TextInput, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { useToolAction } from '../../hooks/useToolAction';

export default function RegexTool() {
  const recordAction = useToolAction();
  const [pattern, setPattern] = useState('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Today is 2024-03-12, tomorrow is 2024-03-13.');
  const [error, setError] = useState<string | null>(null);

  const toggleFlag = (flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  };

  const { matches, highlighted } = useMemo(() => {
    setError(null);
    if (!pattern) return { matches: [], highlighted: testString };

    try {
      const regex = new RegExp(pattern, flags);
      const m = [];
      let match;
      
      // If it's global, we can iterate
      if (flags.includes('g')) {
        let max = 1000;
        while ((match = regex.exec(testString)) !== null && max-- > 0) {
          m.push(match);
          if (match[0].length === 0) {
            regex.lastIndex++; // prevent infinite loop on empty matches
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) m.push(match);
      }

      if (m.length > 0) recordAction();

      // Highlight logic
      let hl = [];
      let lastIdx = 0;
      m.forEach((match, i) => {
        const start = match.index;
        const end = start + match[0].length;
        if (start > lastIdx) {
          hl.push(<span key={`text-${lastIdx}`}>{testString.substring(lastIdx, start)}</span>);
        }
        hl.push(
          <mark 
            key={`match-${i}`} 
            style={{ 
              background: 'rgba(167, 139, 250, 0.4)', 
              color: 'var(--ink)', 
              borderRadius: 4, 
              padding: '0 2px' 
            }}
          >
            {match[0]}
          </mark>
        );
        lastIdx = end;
      });
      if (lastIdx < testString.length) {
        hl.push(<span key={`text-${lastIdx}`}>{testString.substring(lastIdx)}</span>);
      }

      return { matches: m, highlighted: hl.length > 0 ? hl : testString };
    } catch (e: any) {
      setError(e.message);
      return { matches: [], highlighted: testString };
    }
  }, [pattern, flags, testString, recordAction]);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Write and test regular expressions in real-time. Matches are highlighted."
      icon="🔍"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Field label="Regular Expression">
              <TextInput
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="\w+"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </Field>
            {error && <div style={{ color: 'var(--status-error)', fontSize: 13, marginTop: 4 }}>{error}</div>}
          </div>
          <Field label="Flags">
            <TextInput
              value={flags}
              onChange={e => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
              placeholder="g"
              style={{ fontFamily: 'var(--font-mono)', width: 80 }}
            />
          </Field>
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Toggle checked={flags.includes('g')} onChange={() => toggleFlag('g')} label="Global (g)" />
            <Toggle checked={flags.includes('i')} onChange={() => toggleFlag('i')} label="Case Insensitive (i)" />
            <Toggle checked={flags.includes('m')} onChange={() => toggleFlag('m')} label="Multiline (m)" />
            <Toggle checked={flags.includes('s')} onChange={() => toggleFlag('s')} label="Dotall (s)" />
          </div>
        </fieldset>

        <Field label="Test String">
          <TextArea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            rows={4}
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
            Highlighted Matches ({matches.length})
          </div>
          <div 
            className="glass" 
            style={{ 
              padding: 16, 
              minHeight: 80, 
              fontFamily: 'var(--font-mono)', 
              fontSize: 14, 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-all' 
            }}
          >
            {highlighted}
          </div>
        </div>

        {matches.length > 0 && (
          <div className="glass" style={{ overflowX: 'auto', padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', color: 'var(--ink-soft)', borderBottom: '1px solid var(--glass-border)' }}>#</th>
                  <th style={{ padding: '8px 12px', color: 'var(--ink-soft)', borderBottom: '1px solid var(--glass-border)' }}>Match</th>
                  <th style={{ padding: '8px 12px', color: 'var(--ink-soft)', borderBottom: '1px solid var(--glass-border)' }}>Index</th>
                  <th style={{ padding: '8px 12px', color: 'var(--ink-soft)', borderBottom: '1px solid var(--glass-border)' }}>Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: i === matches.length - 1 ? 'none' : '1px solid var(--line)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--ink-mute)' }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{m[0]}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>{m.index}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)' }}>
                      {m.length > 1 ? JSON.stringify(m.slice(1).reduce((acc: Record<string, string>, val, idx) => {
                        acc[idx + 1] = val;
                        return acc;
                      }, {})) : '-'}
                      {m.groups && <div style={{ marginTop: 4 }}>{JSON.stringify(m.groups)}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
