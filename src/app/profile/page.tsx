
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

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading user data or redirecting...</p>
        </div>
      </AppLayout>
    );
  }

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
      value: user.sex ? (user.sex === '1' ? "Male" : "Female") : "Not set", // '1' is Male, '0' is Female
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
              item.value || item.label === "Birth Date" || item.label === "Gender" ? ( 
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
          <CardContent>
            {user.cognifitUserToken ? (
              <p className="text-green-600 dark:text-green-400">
                Your Xillo TruePotential account is successfully connected to Cognitive Gym.
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400">
                Your account is not yet connected to Cognitive Gym. This will happen automatically when you play your first Cognitive Gym game.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
