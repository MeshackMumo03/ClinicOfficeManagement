"use client";

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
}
