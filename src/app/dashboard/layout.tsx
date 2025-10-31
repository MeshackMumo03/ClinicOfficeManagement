"use client"

// Import necessary hooks and components from React, Next.js, and local files.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from "@/components/layout/header";
import { Loader } from '@/components/layout/loader';

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
  const router = useRouter();

  // useEffect hook to check user authentication status and redirect if necessary.
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // If the user is loading or not authenticated, display a loader.
  if (isUserLoading || !user) {
    return <Loader />;
  }

  // Render the dashboard layout with header and children.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
    </div>
  );
}
