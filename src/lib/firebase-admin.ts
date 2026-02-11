import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

let app: App;

// Initialize Firebase Admin (singleton)
if (!getApps().length) {
  // Handle private key formatting (newlines are escaped in env vars)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else {
  app = getApps()[0];
}

const adminAuth = getAuth(app);

/**
 * Verify a Firebase ID token
 * @param token - The ID token from the client
 * @returns Decoded token with user info, or null if invalid
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken | null> {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get user by UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error) {
    console.error('Get user failed:', error);
    return null;
  }
}

export { adminAuth };
export type { DecodedIdToken };
