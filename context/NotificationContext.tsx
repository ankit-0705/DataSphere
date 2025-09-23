'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

type Notification = {
  id: string;
  type: string;       // Label for the notification (e.g., "like", "comment")
  content: string;    // Message content of the notification
  createdAt: string;
  isRead: boolean;
};


type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async (token: string) => {
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const notifData = await notifRes.json();
      const countData = await countRes.json();

      if (notifRes.ok && countRes.ok) {
        setNotifications(notifData.notifications);
        setUnreadCount(countData.unreadCount);
      } else {
        console.error('Failed to load notifications:', notifData.error || countData.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Optimistically update the UI
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        const data = await res.json();
        console.error('Failed to mark as read:', data.error);
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    await fetchNotifications(token);
  }, [fetchNotifications]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      await fetchNotifications(token);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
