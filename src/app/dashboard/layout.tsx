
"use client"

// Import necessary hooks and components from React, Next.js, and local files.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from "@/components/layout/header";
import { Loader } from '@/components/layout/loader';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

/**
 * DashboardLayout component that serves as the layout for the dashboard pages.
 * It handles user authentication and provides a consistent header and main content area.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useUser hook to get the current user and their loading status.
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Memoize the document reference to prevent re-creation on every render.
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);


  // useEffect hook to check user authentication status and redirect if necessary.
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const pageIsLoading = isUserLoading || isUserDataLoading || !user;

  // If the user is loading or not authenticated, display a loader.
  if (pageIsLoading) {
    return <Loader />;
  }

  // Check if the user is a doctor or receptionist and if they are verified.
  if (
    userData &&
    (userData.role === 'doctor' || userData.role === 'receptionist') &&
    !userData.verified
  ) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-lg text-center">
            <CardContent className="p-8">
              <ShieldAlert className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Account Pending Verification</h1>
              <p className="text-muted-foreground">
                Your account is currently awaiting verification by a system administrator.
                You will not be able to access the dashboard until your account has been approved.
                Please contact your clinic's administrator for more information.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render the dashboard layout with header and children.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
    </div>
  );
}

    