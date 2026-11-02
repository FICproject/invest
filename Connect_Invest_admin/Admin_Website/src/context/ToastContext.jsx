import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          const bg = isSuccess ? '#F0FDF4' : isError ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#EFF6FF';
          const border = isSuccess ? '#BBF7D0' : isError ? '#FECACA' : isWarning ? '#FDE68A' : '#BFDBFE';
          const text = isSuccess ? '#166534' : isError ? '#991B1B' : isWarning ? '#92400E' : '#1E40AF';
          const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
          const iconColor = isSuccess ? '#16A34A' : isError ? '#DC2626' : isWarning ? '#D97706' : '#2563EB';

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                minWidth: '300px',
                maxWidth: '480px',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                color: text
              }}
            >
              <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: text,
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: msg => console.log('SUCCESS:', msg),
      error: msg => console.error('ERROR:', msg),
      warning: msg => console.warn('WARN:', msg),
      info: msg => console.log('INFO:', msg)
    };
  }
  return ctx;
}
