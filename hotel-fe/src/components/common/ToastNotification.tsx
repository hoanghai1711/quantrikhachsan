import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

let toastId = 0;
const listeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (type: ToastMessage['type'], message: string) => {
  const toast = { id: toastId++, type, message };
  listeners.forEach(fn => fn(toast));
};

const ToastNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index !== -1) listeners.splice(index, 1);
    };
  }, []);

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map(toast => (
        <Toast key={toast.id} bg={toast.type} autohide delay={3000}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default ToastNotification;