import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.scss';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className={styles.toastContainer}>
                    {toasts.map(toast => (
                        <div 
                            key={toast.id} 
                            className={`${styles.toast} ${styles[toast.type]}`}
                            onClick={() => removeToast(toast.id)}
                        >
                            {toast.message}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
