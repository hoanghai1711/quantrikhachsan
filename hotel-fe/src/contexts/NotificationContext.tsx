import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { signalrService } from '../services/signalrService';
import { NotificationItem } from '../types/notification';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'isRead'>) => void;
}

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
  addNotification: () => {},
};

export const NotificationContext = createContext<NotificationContextType>(defaultContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'isRead'>) => {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp || new Date().toISOString(),
        type: notification.type ?? 'info',
        relatedId: notification.relatedId,
        isRead: false,
      },
      ...current,
    ]);
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const handleIncomingNotification = (payload: Omit<NotificationItem, 'id' | 'isRead'>) => {
      addNotification({
        title: payload.title,
        message: payload.message,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: payload.type,
        relatedId: payload.relatedId,
      });
    };

    let isCancelled = false;

    const connect = async () => {
      try {
        await signalrService.start();
        if (!isCancelled) {
          signalrService.onNotification(handleIncomingNotification);
        }
      } catch (error) {
        console.error('SignalR connection failed', error);
      }
    };

    connect();

    return () => {
      isCancelled = true;
      signalrService.offNotification(handleIncomingNotification);
      signalrService.stop().catch(() => undefined);
    };
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
