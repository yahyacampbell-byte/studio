
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoadingAuth, router, redirectTo, pathname]);

  return { isAuthenticated, isLoadingAuth };
}
