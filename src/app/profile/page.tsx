
"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User as UserIcon, Mail, CalendarDays, UsersRound, Brain, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  // useRequireAuth handles redirection if not authenticated and initial loading state.
  // It returns isAuthenticated and isLoadingAuth from the AuthContext.
  const { user, isLoadingAuth: isLoadingAuthFromHook, isAuthenticated: isAuthenticatedFromHook } = useRequireAuth();

  // We can also get user directly from useAuth if we want to handle loading UI more granularly here,
  // but useRequireAuth usually covers the "not authenticated" case by redirecting.
  const { user: authContextUser, isLoadingAuth: isLoadingAuthContext } = useAuth();

  // Consolidate loading state. isLoadingAuthFromHook is generally sufficient after initial mount.
  const isLoading = isLoadingAuthFromHook || isLoadingAuthContext;
  const finalUser = user || authContextUser;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-1/4 mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-1/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader>
               <Skeleton className="h-6 w-1/3 mb-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticatedFromHook || !finalUser) {
    // This case should ideally be handled by useRequireAuth's redirect,
    // but as a fallback, show a message or minimal UI.
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 text-destructive mb-4" />
          <p className="text-xl text-muted-foreground">User data not available or not authenticated.</p>
        </div>
      </AppLayout>
    );
  }

  const displayItems = [
    { label: "First Name", value: finalUser.firstName, icon: UserIcon },
    { label: "Last Name", value: finalUser.lastName, icon: UserIcon },
    { label: "Email", value: finalUser.email, icon: Mail },
    {
      label: "Birth Date",
      value: finalUser.birthDate ? format(parseISO(finalUser.birthDate), "MMMM d, yyyy") : "Not set",
      icon: CalendarDays
    },
    {
      label: "Gender",
      value: finalUser.sex ? (finalUser.sex === '1' ? "Male" : "Female") : "Not set", // '1' is Male, '0' is Female
      icon: UsersRound
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            View and manage your account details.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Account Information</CardTitle>
            <CardDescription>
              This is your personal information as registered with Xillo TruePotential.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {displayItems.map((item) => (
              item.value ? (
                <div key={item.label} className="flex items-start space-x-3">
                  <item.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-base text-foreground">{item.value}</p>
                  </div>
                </div>
              ) : null
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Cognitive Gym Connection</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            {finalUser.cognifitUserToken ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-600 dark:text-green-400">
                  Your Xillo TruePotential account is successfully connected to Cognitive Gym.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-amber-600 dark:text-amber-400">
                  Your account is not yet connected to Cognitive Gym. This will happen automatically when you play your first Cognitive Gym game.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
