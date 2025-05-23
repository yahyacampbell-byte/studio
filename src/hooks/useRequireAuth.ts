
"use client";

import { useEffect } from 'react';
import { useAuth, type User } from '@/context/AuthContext'; // Import User type
import { useRouter, usePathname } from 'next/navigation';

interface UseRequireAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
}

export function useRequireAuth(redirectTo = '/auth/login'): UseRequireAuthReturn {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoadingAuth, router, redirectTo, pathname]);

  return { user, isAuthenticated, isLoadingAuth };
}

