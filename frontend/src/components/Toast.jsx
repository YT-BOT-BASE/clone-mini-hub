import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-3 w-[min(360px,90vw)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass animate-slideUp px-4 py-3 flex items-start gap-3 border-l-4 ${
              t.type === 'success' ? 'border-l-emerald-400' : t.type === 'error' ? 'border-l-rose-400' : 'border-l-electric'
            }`}
          >
            <span className="text-lg leading-none">
              {t.type === 'success' ? '✅' : t.type === 'error' ? '⛔' : 'ℹ️'}
            </span>
            <p className="text-sm text-slate-200">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
