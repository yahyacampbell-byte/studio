
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LOCAL_STORAGE_AUTH_KEY } from '@/lib/constants';


interface User {
  id: string;
  email?: string; // Optional for demo
  cognifitUserToken: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (userData: Pick<User, 'id' | 'cognifitUserToken'> & { email?: string }) => void;
  logout: () => void;
  cognifitUserToken: string | null; // Convenience accessor
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        if (parsedAuth.isAuthenticated && parsedAuth.user) {
          setAuthState(parsedAuth);
        }
      }
    } catch (error) {
      console.error("Error loading auth data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const updateLocalStorageAuth = useCallback((newAuthState: AuthState) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newAuthState));
    } catch (error) {
      console.error("Error saving auth data to localStorage:", error);
    }
  }, []);

  const login = useCallback((userData: Pick<User, 'id' | 'cognifitUserToken'> & { email?: string }) => {
    const newUser: User = {
        id: userData.id,
        email: userData.email,
        cognifitUserToken: userData.cognifitUserToken,
    };
    const newAuthState: AuthState = { user: newUser, isAuthenticated: true };
    setAuthState(newAuthState);
    updateLocalStorageAuth(newAuthState);
    // router.push('/dashboard'); // Redirect after login
  }, [updateLocalStorageAuth]);

  const logout = useCallback(() => {
    const newAuthState: AuthState = { user: null, isAuthenticated: false };
    setAuthState(newAuthState);
    updateLocalStorageAuth(newAuthState);
    router.push('/auth/login'); // Redirect to login after logout
  }, [updateLocalStorageAuth, router]);

  return (
    <AuthContext.Provider value={{ 
        user: authState.user, 
        isAuthenticated: authState.isAuthenticated, 
        isLoadingAuth, 
        login, 
        logout,
        cognifitUserToken: authState.user?.cognifitUserToken || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
