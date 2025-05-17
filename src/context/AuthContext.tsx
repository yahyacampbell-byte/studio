
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LOCAL_STORAGE_AUTH_KEY } from '@/lib/constants';

export interface User {
  id: string; // This is our app's internal user ID
  email: string; // User's email for app login
  firstName: string;
  lastName: string;
  birthDate: string; // Stored as YYYY-MM-DD
  sex: '1' | '2'; // '1' for Male, '2' for Female as per CogniFit
  cognifitUserToken: string | null; // Token from Cognitive Gym
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateCognifitUserToken: (token: string) => void;
  cognifitUserToken: string | null; 
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
          // Basic validation to ensure user object has essential fields
          if (parsedAuth.user.id && parsedAuth.user.email && parsedAuth.user.firstName && parsedAuth.user.lastName && parsedAuth.user.birthDate && parsedAuth.user.sex) {
            setAuthState(parsedAuth);
          } else {
            console.warn("Stored auth user data is incomplete. Clearing auth state.");
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          }
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

  const login = useCallback((userData: User) => {
    const newAuthState: AuthState = { user: userData, isAuthenticated: true };
    setAuthState(newAuthState);
    updateLocalStorageAuth(newAuthState);
  }, [updateLocalStorageAuth]);

  const logout = useCallback(() => {
    const newAuthState: AuthState = { user: null, isAuthenticated: false };
    setAuthState(newAuthState);
    updateLocalStorageAuth(newAuthState);
    router.push('/auth/login'); 
  }, [updateLocalStorageAuth, router]);

  const updateCognifitUserToken = useCallback((token: string) => {
    setAuthState(prevAuthState => {
      if (prevAuthState.user) {
        const updatedUser = { ...prevAuthState.user, cognifitUserToken: token };
        const newAuthState = { ...prevAuthState, user: updatedUser };
        updateLocalStorageAuth(newAuthState);
        return newAuthState;
      }
      return prevAuthState; // Should not happen if user is logged in
    });
  }, [updateLocalStorageAuth]);

  return (
    <AuthContext.Provider value={{ 
        user: authState.user, 
        isAuthenticated: authState.isAuthenticated, 
        isLoadingAuth, 
        login, 
        logout,
        updateCognifitUserToken,
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
