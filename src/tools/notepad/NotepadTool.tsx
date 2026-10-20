import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { textStats } from '../word-counter/wordCount';

const KEY = 'toolglass_notepad';

const load = () => {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};

export default function NotepadTool() {
  const [text, setText] = useState(load);
  const [saved, setSaved] = useState(true);

  // Debounced autosave; storage errors (private mode, quota) leave the note in memory only
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, text);
        setSaved(true);
      } catch {
        /* not saved */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const { words, characters } = textStats(text);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Note" hint={`${words} words · ${characters} chars · ${saved ? 'Saved in this browser' : 'Saving…'}`}>
          <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={18} placeholder="Start typing. It saves in this browser as you go." />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="soft" onClick={download} disabled={!text}>
            Download .txt
          </Button>
          <Button variant="ghost" onClick={() => setText('')} disabled={!text}>
            Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
