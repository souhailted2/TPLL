import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onForegroundMessage, getFirebaseMessaging } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        typeof window !== 'undefined' && 
        'serviceWorker' in navigator && 
        'Notification' in window &&
        'PushManager' in window;
      setIsSupported(supported);
      
      if (supported && Notification.permission === 'granted') {
        setIsEnabled(true);
      }
    };
    
    checkSupport();
  }, []);

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

      const response = await fetch('/api/push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to save token');
      }

      setIsEnabled(true);
      toast({
        title: 'تم التفعيل',
        description: 'ستتلقى إشعارات عند وصول طلبات جديدة',
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تفعيل الإشعارات',
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
