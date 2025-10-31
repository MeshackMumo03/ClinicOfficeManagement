'use client';

// Import React hooks and the FirebaseProvider.
import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

// Define props for the FirebaseClientProvider.
interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * FirebaseClientProvider component that ensures Firebase is initialized once on the client side.
 * It wraps the FirebaseProvider to provide Firebase services to the application.
 * @param {FirebaseClientProviderProps} props - The properties for the component.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo hook to initialize Firebase only once per component mount.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once.

  // Render the FirebaseProvider with the initialized Firebase services.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
