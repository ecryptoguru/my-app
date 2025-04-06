'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SupabaseDemo from '@/components/SupabaseDemo';

export default function SupabaseDemoPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Integration Demo</h1>
      <p className="text-lg mb-6">
        This page demonstrates the integration with Supabase for database operations and file storage.
        You can test uploading files, saving data to the database, and retrieving information.
      </p>
      
      <SupabaseDemo />
    </div>
  );
}
