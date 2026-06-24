import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useToast } from '../../components/ui/Toast';
import { signHS256 } from './jwt';

const DEFAULT_PAYLOAD = JSON.stringify(
  { sub: '1234567890', name: 'Jane Doe', iat: Math.floor(Date.now() / 1000) },
  null,
  2,
);
const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);

export default function JwtTool() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const toast = useToast();

  const sign = async () => {
    try {
      JSON.parse(header);
      JSON.parse(payload);
      const t = await signHS256(payload, secret, header);
      setToken(t);
    } catch (e) {
      toast.push(`Invalid JSON: ${(e as Error).message}`, 'error');
    }
  };

  const reset = () => {
    setHeader(DEFAULT_HEADER);
    setPayload(DEFAULT_PAYLOAD);
    setSecret('your-256-bit-secret');
    setToken('');
  };

  return (
    <ToolLayout
      title="JWT Generator"
      description="Sign JSON Web Tokens with HS256 — all in-browser."
      icon="🪪"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Header">
          <TextArea value={header} onChange={(e) => setHeader(e.target.value)} rows={4} />
        </Field>
        <Field label="Payload">
          <TextArea value={payload} onChange={(e) => setPayload(e.target.value)} rows={6} />
        </Field>
        <Field label="Secret">
          <TextInput value={secret} onChange={(e) => setSecret(e.target.value)} />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={sign} variant="primary">
            ✦ Sign Token
          </Button>
          <Button onClick={reset} variant="soft">
            Reset
          </Button>
        </div>
        <Output value={token} multiline placeholder="Signed JWT will appear here" />
      </div>
    </ToolLayout>
  );
}
