
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader } from '@/components/layout/loader';
import { Header } from '@/components/layout/header';

/**
 * AdminLayout component that serves as the layout for the admin pages.
 * It handles admin authentication and provides a consistent header and main content area.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Memoize the document reference to prevent re-creation on every render.
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }
    // If user data is done loading and the user is not an admin, redirect away.
    if (!isUserDataLoading && userData && userData.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router]);

  // Show a loader while authentication or user data fetching is in progress.
  // Also wait if we have a user but haven't confirmed their role yet.
  if (isUserLoading || isUserDataLoading || !user) {
    return <Loader />;
  }

  // If the user is confirmed not to be an admin, show a loader while redirecting.
  if (userData?.role !== 'admin') {
    return <Loader />;
  }

  // Once confirmed as an admin, render the layout.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
    </div>
  );
}
