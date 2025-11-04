
"use client";

// Import necessary hooks from React and Next.js, and local components.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/layout/loader';

/**
 * RootPage component that handles initial routing.
 * It now redirects all users to the signup page.
 */
export default function RootPage() {
  const router = useRouter();

  // useEffect hook to perform redirection.
  useEffect(() => {
    router.push('/signup');
  }, [router]);

  // Display a loader while redirecting.
  return <Loader />;
}
