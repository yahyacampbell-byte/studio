
"use client";

import React, { useEffect } from 'react';
import { useAuth, User } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react'; // Removed Brain
import { APP_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const { login, isAuthenticated, isLoadingAuth, user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace('/dashboard'); 
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  const handleDemoLogin = () => {
    const demoUser: User = { 
      id: 'demo-user-123', 
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      birthDate: '1990-01-01', // Mock birth date
      sex: '1', // Mock sex (Male - '1')
      cognifitUserToken: null, // Set to null to test on-demand Cognitive Gym registration
    };
    login(demoUser);
    router.push('/dashboard');
  };
  
  if (isLoadingAuth || (!isLoadingAuth && isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
         <Image 
            src="https://www.xillo.io/wp-content/uploads/2023/07/Xillo.svg" 
            alt={`${APP_NAME} Logo`}
            data-ai-hint="logo"
            width={48} 
            height={48}
            className="h-12 w-12 animate-pulse text-primary"
        />
        <p className="ml-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Link href="/" className="flex items-center justify-center mb-8" prefetch={false}>
        <Image 
            src="https://www.xillo.io/wp-content/uploads/2023/07/Xillo.svg" 
            alt={`${APP_NAME} Logo`}
            data-ai-hint="logo"
            width={133} 
            height={32}
            className="h-8" 
        />
        <span className="ml-3 text-3xl font-semibold sr-only">{APP_NAME}</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue your cognitive journey with ${APP_NAME}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 
            This is where a full login form (email/password) would go.
            For now, we only have the demo login.
          */}
           <p className="text-center text-sm text-muted-foreground">
            Actual login form coming soon. Use Demo Login for now.
          </p>
          <Button onClick={handleDemoLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" /> Login as Demo User
          </Button>
          <Separator />
          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
