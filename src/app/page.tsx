"use client";

// Import necessary hooks from React and Next.js, and local components.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader } from '@/components/layout/loader';

/**
 * RootPage component that handles initial routing based on authentication status.
 * It redirects users to the dashboard if logged in, or to the login page if not.
 */
export default function RootPage() {
  // useUser hook to get the current user and their loading status.
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // useEffect hook to perform redirection once user status is determined.
  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  // Display a loader while checking authentication status.
  return <Loader />;
}
