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
      console.log('[Firebase] Loaded credentials from file:', filePath);
    } catch (e) {
      console.error('[Firebase] Failed to read key file:', e);
    }
  }

  if (!serviceAccount) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.warn('[Firebase] No credentials found - push notifications disabled');
      return;
    }
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('[Firebase] Loaded credentials from FIREBASE_SERVICE_ACCOUNT env var');
    } catch (e) {
      console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
      return;
    }
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('[Firebase] Admin initialized successfully ✓');
  } catch (error) {
    console.error('[Firebase] Failed to initialize Admin:', error);
  }
}

export function isFirebaseInitialized(): boolean {
  return initialized;
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!initialized) {
    console.warn('[Firebase] Cannot send push - Admin not initialized');
    return false;
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: { title, body },
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
    console.log(`[Firebase] Push sent OK → messageId: ${response}`);
    return true;
  } catch (error: any) {
    console.error(`[Firebase] Push FAILED → code: ${error.code} | message: ${error.message}`);
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      console.warn('[Firebase] Token is invalid/expired — will be removed from DB');
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
  if (!initialized) {
    console.warn('[Firebase] Cannot send push - Admin not initialized');
    return [];
  }

  if (tokens.length === 0) {
    console.warn('[Firebase] No tokens provided for push notification');
    return [];
  }

  console.log(`[Firebase] Sending push to ${tokens.length} token(s) | title: "${title}"`);

  const invalidTokens: string[] = [];

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
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
      if (resp.success) {
        console.log(`[Firebase] Token[${idx}] sent OK → messageId: ${resp.messageId}`);
      } else {
        const err = resp.error;
        console.error(`[Firebase] Token[${idx}] FAILED → code: ${err?.code} | message: ${err?.message}`);
        if (
          err?.code === 'messaging/invalid-registration-token' ||
          err?.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    console.log(`[Firebase] Push result: ${response.successCount} success, ${response.failureCount} failed, ${invalidTokens.length} invalid tokens removed`);
  } catch (error: any) {
    console.error(`[Firebase] Multicast push FAILED → ${error.message}`);
  }

  return invalidTokens;
}
