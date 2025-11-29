
// This file is for SERVER-SIDE use only.
// It initializes the Firebase Admin SDK, which provides privileged access.

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from './config'; // We can reuse the client-side config project details

// IMPORTANT: In a real production environment, you would use environment variables
// or a secret manager to securely provide these credentials.
// For this prototype, we will check for a service account key from an env variable.
// Make sure to create a serviceAccount.json file for local development.

let app: App;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // For production/deployed environments
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: firebaseConfig.storageBucket,
    });
  } else {
    // For local development, try to use a local service account file
    try {
      const serviceAccount = require('../../serviceAccount.json');
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: firebaseConfig.storageBucket,
      });
    } catch (e) {
      console.error(
        "Server-side Firebase Admin SDK initialization failed. " +
        "For local development, ensure 'serviceAccount.json' exists in the root. " +
        "For production, ensure FIREBASE_SERVICE_ACCOUNT env var is set."
      );
      // As a last resort, initialize without credentials for limited functionality
      // This will NOT work for authenticated operations.
      app = initializeApp({
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
      });
    }
  }
} else {
  app = getApps()[0];
}

export const adminApp = app;
export const db = getFirestore(adminApp);
export const storage = getStorage(adminApp);
