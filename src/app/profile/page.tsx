
"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User as UserIcon, Mail, CalendarDays, UsersRound, Brain } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ProfilePage() {
  const { user, isLoadingAuth, isAuthenticated } = useRequireAuth();

  if (isLoadingAuth) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Authenticating...</p>
        </div>
      </AppLayout>
    );
  }

  // At this point, isLoadingAuth is false.
  // useRequireAuth hook will handle redirection if !isAuthenticated.
  // This block catches the case where authentication is confirmed (isAuthenticated=true)
  // but the user object might still be null (e.g. an issue in AuthContext logic or localStorage state).
  if (!isAuthenticated || !user) {
    // If !isAuthenticated, useRequireAuth should redirect.
    // If isAuthenticated but !user, this indicates an issue needing investigation,
    // but we show a loading/error state for robustness.
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading user data or redirecting...</p>
        </div>
      </AppLayout>
    );
  }

  // If we reach here, isLoadingAuth is false, isAuthenticated is true, and user is populated.
  const displayItems = [
    { label: "First Name", value: user.firstName, icon: UserIcon },
    { label: "Last Name", value: user.lastName, icon: UserIcon },
    { label: "Email", value: user.email, icon: Mail },
    { 
      label: "Birth Date", 
      value: user.birthDate ? format(parseISO(user.birthDate), "MMMM d, yyyy") : "Not set", 
      icon: CalendarDays 
    },
    { 
      label: "Gender", 
      value: user.sex ? (user.sex === '1' ? "Male" : "Female") : "Not set", 
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
              item.value || item.label === "Birth Date" || item.label === "Gender" ? ( // Ensure "Not set" items are rendered
                <div key={item.label} className="flex items-start space-x-3">
                  <item.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-base text-foreground">{item.value}</p>
                  </div>
                </div>
              ) : null
            ))}
            {/* Placeholder for future edit button */}
            {/* <Button variant="outline" className="mt-4">Edit Profile</Button> */}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">CogniFit Connection</CardTitle>
          </CardHeader>
          <CardContent>
            {user.cognifitUserToken ? (
              <p className="text-green-600 dark:text-green-400">
                Your Xillo TruePotential account is successfully connected to CogniFit.
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400">
                Your account is not yet connected to CogniFit. This will happen automatically when you play your first CogniFit game.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
