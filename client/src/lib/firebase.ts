import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBVjoHOcbg3_yqQrvco_7MMlqOP5J-zipE",
  authDomain: "tpl-factory.firebaseapp.com",
  projectId: "tpl-factory",
  storageBucket: "tpl-factory.firebasestorage.app",
  messagingSenderId: "194150358279",
  appId: "1:194150358279:web:8196f3f50d138d41f1b9a2"
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  if (!('Notification' in window)) return null;
  
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    const token = await getToken(messaging, {
      vapidKey: 'BNqh7y0DWqMg8rC_2kqq0Z-bJ1xq0rDqxY9TmzHw_yFnqeJ0gEQ8Xh4qxVb0k3YzPq6hA7oZkY2lB5wVxNq0gKI',
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}
