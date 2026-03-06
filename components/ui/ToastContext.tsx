import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextBounds {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextBounds | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up
              ${t.type === 'success' ? 'bg-zinc-900 border border-green-500/20 text-white' : ''}
              ${t.type === 'error' ? 'bg-zinc-900 border border-red-500/20 text-white' : ''}
              ${t.type === 'info' ? 'bg-zinc-900 border border-blue-500/20 text-white' : ''}
            `}
                    >
                        {t.type === 'success' && <CheckCircle size={16} className="text-green-500" />}
                        {t.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                        {t.type === 'info' && <Info size={16} className="text-blue-500" />}
                        <span>{t.message}</span>
                        <button onClick={() => removeToast(t.id)} className="ml-4 text-zinc-500 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
