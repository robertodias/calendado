import React from 'react';
import { createContext, useContext } from 'react';
import Toast from './ui/Toast';
import { useToast } from '../hooks/useToast';

interface ToastContextType {
  toast: (options: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
  }) => {
    id: string;
    dismiss: () => void;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toast, dismiss, dismissAll, toasts } = useToast();

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
