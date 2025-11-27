'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkSession } from '@/lib/auth/client';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const isAuthenticated = await checkSession();
        if (isAuthenticated) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="h-12 w-12 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return null; // Don't render anything since we're redirecting
}