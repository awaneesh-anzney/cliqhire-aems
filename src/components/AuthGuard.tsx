"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { AuthLoading } from './auth-loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      if (pathname && pathname !== '/login' && pathname !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <AuthLoading />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <AuthLoading />
      </div>
    );
  }

  return <>{children}</>;
}
