import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './Toast.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
  texto: string;
}

interface ToastContextData {
  mostrarToast: (texto: string, tipo?: Toast['tipo']) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextData | null>(null);

// ─── Componente interno: card individual ──────────────────────────────────────

function ToastCard({ toast, aoRemover }: { toast: Toast; aoRemover: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => aoRemover(toast.id), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, aoRemover]);

  const icones: Record<Toast['tipo'], string> = {
    sucesso: '✓',
    aviso: '⚠',
    erro: '✕',
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.tipo]}`}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.texto}>
        <strong>{icones[toast.tipo]}&nbsp;</strong>
        {toast.texto}
      </span>
      <button
        type="button"
        className={styles.fechar}
        aria-label="Fechar notificação"
        onClick={() => aoRemover(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((anterior) => anterior.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback((texto: string, tipo: Toast['tipo'] = 'sucesso') => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());

    setToasts((anterior) => [...anterior, { id, tipo, texto }]);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {/* Container dos toasts — renderizado uma única vez, no topo da árvore */}
      <div className={styles.container} aria-label="Notificações" aria-live="polite">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} aoRemover={removerToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextData {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  }
  return ctx;
}
