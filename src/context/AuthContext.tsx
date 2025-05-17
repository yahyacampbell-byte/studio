
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LOCAL_STORAGE_AUTH_KEY } from '@/lib/constants';
import { db } from '@/lib/firebase'; // Firebase instance
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface User {
  id: string; // This is our app's internal user ID (and Firestore document ID)
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string; // Stored as YYYY-MM-DD
  sex: '0' | '1'; // '0' for Female, '1' for Male
  cognifitUserToken: string | null;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (userData: Omit<User, 'createdAt' | 'updatedAt' | 'cognifitUserToken'> & { cognifitUserToken?: string | null }) => Promise<void>;
  logout: () => void;
  updateCognifitUserToken: (token: string) => Promise<void>;
  cognifitUserToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LocalAuthState {
  userId: string | null;
  isAuthenticated: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage and then fetch full user data from Firestore
  useEffect(() => {
    const attemptLoadUser = async () => {
      setIsLoadingAuth(true);
      try {
        const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (storedAuth) {
          const parsedLocalAuth: LocalAuthState = JSON.parse(storedAuth);
          if (parsedLocalAuth.isAuthenticated && parsedLocalAuth.userId) {
            const userDocRef = doc(db, "users", parsedLocalAuth.userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userDataFromFirestore = userDocSnap.data() as User;
              setUser(userDataFromFirestore);
              setIsAuthenticated(true);
            } else {
              // User data not found in Firestore, clear local auth
              console.warn(`User data for ${parsedLocalAuth.userId} not found in Firestore. Clearing local session.`);
              localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    attemptLoadUser();
  }, []);

  const login = useCallback(async (userData: Omit<User, 'createdAt' | 'updatedAt' | 'cognifitUserToken'> & { cognifitUserToken?: string | null }) => {
    setIsLoadingAuth(true);
    const fullUser: User = {
      ...userData,
      cognifitUserToken: userData.cognifitUserToken || null,
      createdAt: serverTimestamp(), // Will be set by Firestore on first write
      updatedAt: serverTimestamp(),
    };

    try {
      const userDocRef = doc(db, "users", fullUser.id);
      await setDoc(userDocRef, fullUser, { merge: true }); // Use merge to update if exists, or create
      
      setUser(fullUser); // Set local user state
      setIsAuthenticated(true);
      
      const localAuthState: LocalAuthState = { userId: fullUser.id, isAuthenticated: true };
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(localAuthState));
      
    } catch (error) {
      console.error("Error during login (saving user to Firestore):", error);
      // Potentially revert local state or show error to user
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    // Note: If using Firebase Auth, you would also call signOut(auth) here.
    router.push('/auth/login');
  }, [router]);

  const updateCognifitUserToken = useCallback(async (token: string) => {
    if (user) {
      const updatedUser = { ...user, cognifitUserToken: token, updatedAt: serverTimestamp() };
      setUser(updatedUser); // Update local state immediately

      try {
        const userDocRef = doc(db, "users", user.id);
        await updateDoc(userDocRef, { 
          cognifitUserToken: token,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating Cognifit user token in Firestore:", error);
        // Optionally revert local state or handle error
      }
    } else {
      console.warn("Cannot update Cognifit token: no user logged in.");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        updateCognifitUserToken,
        cognifitUserToken: user?.cognifitUserToken || null
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
