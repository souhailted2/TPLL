import admin from 'firebase-admin';
import fs from 'fs';

let initialized = false;

export function initializeFirebaseAdmin() {
  if (initialized) return;
  
  let serviceAccount: any = null;
  
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
  if (filePath && fs.existsSync(filePath)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error('Failed to read Firebase key file:', e);
    }
  }
  
  if (!serviceAccount) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.warn('Firebase credentials not found - push notifications disabled');
      return;
    }
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
      return;
    }
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    initialized = true;
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!initialized) {
    console.warn('Firebase Admin not initialized - cannot send push notification');
    return false;
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: '/favicon.png',
          badge: '/favicon.png',
          dir: 'rtl',
          lang: 'ar',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return true;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      return false;
    }
    return false;
  }
}

export async function sendPushToMultipleTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string[]> {
  if (!initialized || tokens.length === 0) {
    return [];
  }

  const invalidTokens: string[] = [];

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: '/favicon.png',
          badge: '/favicon.png',
          dir: 'rtl',
          lang: 'ar',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        if (error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    console.log(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
  } catch (error) {
    console.error('Error sending multicast push notification:', error);
  }

  return invalidTokens;
}
