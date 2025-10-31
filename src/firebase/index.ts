'use client';

// This file serves as a barrel file for Firebase functionality.
// It initializes Firebase and exports various hooks and providers for use throughout the app.

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
/**
 * Initializes the Firebase app.
 * It ensures that Firebase is initialized only once.
 * It attempts to initialize via Firebase App Hosting environment variables first,
 * and falls back to the local firebaseConfig object if that fails.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables.
      firebaseApp = initializeApp();
    } catch (e) {
      // Warn in production if automatic initialization fails.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      // Fallback to using the local firebaseConfig object.
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App.
  return getSdks(getApp());
}

/**
 * Returns the initialized Firebase SDKs.
 * @param firebaseApp The initialized FirebaseApp instance.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Export all providers and hooks for easy import elsewhere.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
