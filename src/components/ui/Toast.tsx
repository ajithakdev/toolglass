import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  push: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="glass-strong"
              style={{
                padding: '10px 18px',
                fontWeight: 500,
                fontSize: 14,
                color:
                  t.kind === 'error'
                    ? '#b91c1c'
                    : t.kind === 'info'
                      ? '#1e3a8a'
                      : '#166534',
                pointerEvents: 'auto',
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used within ToastProvider');
  return v;
}
