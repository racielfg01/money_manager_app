import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/helpers';
import Icon from '../components/common/Icon';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 2500) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 250);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${t.leaving ? 'animate-toast-out' : 'animate-toast-in'} ${
            t.type === 'success' ? 'bg-green-600 text-white' :
            t.type === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          }`}>
            <Icon name={t.type === 'success' ? 'CheckCircle2' : t.type === 'error' ? 'AlertCircle' : 'Info'} size={18} />
            <span className="text-sm font-medium flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
