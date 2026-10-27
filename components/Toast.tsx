'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type Toast = {
  id: number;
  message: string;
  /** label + tujuan tautan opsional, mis. "Lihat keranjang" */
  action?: { label: string; href: string };
};

type ToastContextValue = {
  showToast: (message: string, action?: Toast['action']) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DURATION = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | null>(null);
  const counter = useRef(0);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, action) => {
      clearTimer();
      counter.current += 1;
      setToast({ id: counter.current, message, action });
      timer.current = window.setTimeout(() => setToast(null), DURATION);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast ? (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.action ? (
              <Link
                href={toast.action.href}
                onClick={() => {
                  clearTimer();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                clearTimer();
                setToast(null);
              }}
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return value;
}
