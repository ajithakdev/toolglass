import { useState, useMemo } from 'react';
import { Field, TextArea } from '../../components/ui/Field';
import { ToolLayout } from '../../components/ToolLayout';
import { Output } from '../../components/ui/Output';

export default function JwtDecodeTool() {
  const [input, setInput] = useState('');
  
  const { decoded, isExpired } = useMemo(() => {
    if (!input.trim()) return { decoded: null, isExpired: false };
    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts separated by dots)');
      
      const decodeB64 = (str: string) => {
        const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
        return decodeURIComponent(atob(padded).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      };

      const header = JSON.parse(decodeB64(parts[0]));
      const payload = JSON.parse(decodeB64(parts[1]));
      const expired = payload && typeof payload.exp === 'number'
        ? (payload.exp * 1000 < Date.now())
        : false;
      return { decoded: { header, payload, error: null }, isExpired: expired };
    } catch (e) {
      return { decoded: { error: (e as Error).message }, isExpired: false };
    }
  }, [input]);

  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="JWT String">
          <TextArea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            rows={4} 
            placeholder="eyJhbGci..." 
          />
        </Field>
        
        {decoded?.error ? (
          <div style={{ color: 'var(--status-error)', fontSize: 14 }}>{decoded.error}</div>
        ) : decoded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Header">
              <Output value={JSON.stringify(decoded.header, null, 2)} multiline />
            </Field>
            <Field label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Payload
                {decoded.payload?.exp && (
                  <span style={{ 
                    fontSize: 11, 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: isExpired ? '#ef4444' : '#10b981',
                    border: isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    {isExpired ? 'EXPIRED' : 'VALID'}
                  </span>
                )}
              </div>
            }>
              <Output value={JSON.stringify(decoded.payload, null, 2)} multiline />
            </Field>
          </div>
        ) : null}
      </div>
    </ToolLayout>
  );
}
