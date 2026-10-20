import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { Output } from '../../components/ui/Output';
import { ToolLayout } from '../../components/ToolLayout';
import { useToast } from '../../components/ui/Toast';
import { generateKeyPair, signJwt, type JwtAlg } from './jwt';

const DEFAULT_PAYLOAD = JSON.stringify(
  { sub: '1234567890', name: 'Jane Doe', iat: Math.floor(Date.now() / 1000) },
  null,
  2,
);
const DEFAULT_SECRET = 'your-256-bit-secret';
const headerFor = (alg: JwtAlg) => JSON.stringify({ alg, typ: 'JWT' }, null, 2);
const ALGS: JwtAlg[] = ['HS256', 'RS256', 'ES256'];

export default function JwtTool() {
  const [alg, setAlg] = useState<JwtAlg>('HS256');
  const [header, setHeader] = useState(headerFor('HS256'));
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [token, setToken] = useState('');
  const toast = useToast();

  const chooseAlg = (next: JwtAlg) => {
    setAlg(next);
    setToken('');
    // Keep the header's alg in step, but leave a header the user broke alone
    try {
      setHeader(JSON.stringify({ ...JSON.parse(header), alg: next }, null, 2));
    } catch {
      /* invalid JSON: sign() will report it */
    }
    if (next !== alg) {
      setPrivateKey('');
      setPublicKey('');
    }
  };

  const sign = async () => {
    try {
      JSON.parse(header);
      JSON.parse(payload);
    } catch (e) {
      toast.push(`Invalid JSON: ${(e as Error).message}`, 'error');
      return;
    }
    try {
      setToken(await signJwt(alg, payload, alg === 'HS256' ? secret : privateKey, header));
    } catch {
      toast.push(`Could not sign: private key must be a PKCS#8 PEM for ${alg}`, 'error');
    }
  };

  const genKeys = async () => {
    if (alg === 'HS256') return;
    const pair = await generateKeyPair(alg);
    setPrivateKey(pair.privateKey);
    setPublicKey(pair.publicKey);
  };

  const reset = () => {
    setAlg('HS256');
    setHeader(headerFor('HS256'));
    setPayload(DEFAULT_PAYLOAD);
    setSecret(DEFAULT_SECRET);
    setPrivateKey('');
    setPublicKey('');
    setToken('');
  };

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div role="group" aria-label="Algorithm" style={{ display: 'flex', gap: 8 }}>
          {ALGS.map((a) => (
            <Button key={a} size="sm" variant={alg === a ? 'primary' : 'soft'} onClick={() => chooseAlg(a)}>
              {a}
            </Button>
          ))}
        </div>
        <Field label="Header">
          <TextArea value={header} onChange={(e) => setHeader(e.target.value)} rows={4} />
        </Field>
        <Field label="Payload">
          <TextArea value={payload} onChange={(e) => setPayload(e.target.value)} rows={6} />
        </Field>
        {alg === 'HS256' ? (
          <Field label="Secret">
            <TextInput value={secret} onChange={(e) => setSecret(e.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Private key (PKCS#8 PEM)" hint="Stays in this tab. Never stored or sent anywhere.">
              <TextArea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                rows={6}
                placeholder="-----BEGIN PRIVATE KEY-----"
                spellCheck={false}
              />
            </Field>
            <div>
              <Button variant="soft" onClick={genKeys}>
                Generate {alg === 'RS256' ? 'RSA-2048' : 'EC P-256'} key pair
              </Button>
            </div>
            {publicKey && (
              <Field label="Public key (share this to verify)">
                <Output value={publicKey} multiline label="Public key" />
              </Field>
            )}
          </>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={sign} variant="primary">
            Sign token
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
