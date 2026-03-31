import { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useAuth, authHeaders } from './use-auth';

async function saveTokenToServer(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const refreshed = useRef(false);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window &&
      'PushManager' in window;
    setIsSupported(supported);

    if (supported && Notification.permission === 'granted') {
      setIsEnabled(true);
    }
  }, []);

  // Auto-refresh token every time user logs in or page loads (if permission already granted)
  useEffect(() => {
    if (!isEnabled || !user || refreshed.current) return;
    refreshed.current = true;

    const refreshToken = async () => {
      try {
        console.log('[Push] Auto-refreshing FCM token for user:', user.id);
        const token = await requestNotificationPermission();
        if (token) {
          const saved = await saveTokenToServer(token);
          if (saved) {
            console.log('[Push] FCM token refreshed and saved successfully');
          } else {
            console.warn('[Push] FCM token refresh: server save failed');
          }
        } else {
          console.warn('[Push] FCM token refresh: no token returned');
        }
      } catch (error) {
        console.error('[Push] Error refreshing FCM token:', error);
      }
    };

    refreshToken();
  }, [isEnabled, user]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isEnabled || !user) return;

    const unsubscribe = onForegroundMessage((payload) => {
      toast({
        title: payload.notification?.title || 'إشعار جديد',
        description: payload.notification?.body || '',
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isEnabled, user, toast]);

  const enableNotifications = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'غير مدعوم',
        description: 'متصفحك لا يدعم الإشعارات',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      const token = await requestNotificationPermission();

      if (!token) {
        toast({
          title: 'تم الرفض',
          description: 'يرجى السماح بالإشعارات من إعدادات المتصفح',
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }

      const saved = await saveTokenToServer(token);

      if (!saved) {
        throw new Error('Failed to save token');
      }

      setIsEnabled(true);
      refreshed.current = true;
      toast({
        title: 'تم التفعيل',
        description: 'ستتلقى إشعارات عند وصول طلبات جديدة',
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[Push] Error enabling notifications:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تفعيل الإشعارات - تحقق من اتصال الإنترنت',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [isSupported, toast]);

  return {
    isSupported,
    isEnabled,
    isLoading,
    enableNotifications,
  };
}
