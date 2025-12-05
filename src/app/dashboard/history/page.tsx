
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/layout/loader';

/**
 * This page has been removed and now redirects to the dashboard.
 */
export default function HistoryPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return <Loader />;
}
