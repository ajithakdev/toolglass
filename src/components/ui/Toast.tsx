import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  push: (message: string, kind?: ToastKind, id?: number) => number;
}

const Ctx = createContext<ToastCtx | null>(null);

import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = 'success', existingId?: number) => {
    const id = existingId ?? (Date.now() + Math.random());
    setItems((prev) => {
      const exists = prev.some((t) => t.id === id);
      if (exists) {
        return prev.map((t) => (t.id === id ? { ...t, message, kind } : t));
      }
      return [...prev, { id, kind, message }];
    });
    
    // Set auto-dismiss timeout
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
    
    return id;
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 80,
          right: 16,
          left: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          pointerEvents: 'none',
          zIndex: 10000,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="glass"
              style={{
                padding: '12px 18px',
                borderRadius: '14px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), 0 2px 8px var(--glass-border)',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                maxWidth: '340px',
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>
                {t.kind === 'success' && <CheckCircle size={16} color="#10b981" />}
                {t.kind === 'error' && <AlertCircle size={16} color="#ef4444" />}
                {t.kind === 'info' && <InfoIcon size={16} color="#8b5cf6" />}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used within ToastProvider');
  return v;
}
