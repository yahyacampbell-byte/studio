
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace('/dashboard'); // Redirect if already logged in
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  const handleDemoLogin = () => {
    // In a real app, you'd get user details and a real cognifitUserToken
    // from your backend after successful authentication/registration.
    // The cognifitUserToken would typically be obtained by calling `registerCognifitUser`
    // from `cognifitService.ts` as part of a registration flow.
    login({ 
      id: 'demo-user-123', 
      email: 'demo@example.com',
      cognifitUserToken: 'DEMO_COGNIFIT_USER_TOKEN' // IMPORTANT: Replace with a real token for CogniFit games
    });
    router.push('/dashboard');
  };
  
  if (isLoadingAuth || (!isLoadingAuth && isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Brain className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Link href="/" className="flex items-center justify-center mb-8" prefetch={false}>
        <Brain className="h-10 w-10 text-primary" />
        <span className="ml-3 text-3xl font-semibold">{APP_NAME}</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue your cognitive journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Replace with actual form fields for username/password in a real app */}
          <Button onClick={handleDemoLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" /> Login as Demo User
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            This is a demo login. No actual registration is implemented yet.
          </p>
          {/* 
          <Separator />
          <Button variant="outline" className="w-full">
            <Chrome className="mr-2 h-5 w-5" /> Sign in with Google
          </Button>
          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
