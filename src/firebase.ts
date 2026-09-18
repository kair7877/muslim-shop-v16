import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Filter out benign Firestore offline status messages from triggering fatal console.error traps
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('Could not reach Cloud Firestore backend') ||
      firstArg.includes('operate in offline mode') ||
      firstArg.includes('code=unavailable')
    ) {
      console.warn('ℹ️ Firestore offline mode active (using local storage & IndexedDB cache):', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Real authentication, used to gate admin writes in firestore.rules
export const auth = getAuth(app);

// Suppress debug chatter from Firestore
setLogLevel('error');

// Initialize Firestore with forced long-polling to prevent WebSocket/WebChannel
// connection drops in iframes and proxies ("Could not reach Cloud Firestore backend")
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

export { app };

