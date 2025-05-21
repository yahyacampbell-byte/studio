
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth, User } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Basic validation, real app needs more
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // **VERY IMPORTANT SECURITY NOTE:**
      // This is a simplified login for UI demonstration.
      // It DOES NOT perform secure password verification.
      // In a real application, you MUST verify passwords against a securely stored hash
      // on a backend server or use a dedicated authentication service (e.g., Firebase Auth).
      // DO NOT USE THIS AUTHENTICATION LOGIC IN PRODUCTION.

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Login Failed",
          description: "User not found or incorrect credentials.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Assuming one user per email. If multiple, this would take the first.
      const userDoc = querySnapshot.docs[0];
      const userDataFromFirestore = { id: userDoc.id, ...userDoc.data() } as User;

      // HERE: Actual password verification would happen.
      // For now, we assume if email exists, login is "successful".

      await login(userDataFromFirestore); // login function now handles the full User object
      
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
      router.push('/dashboard');

    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          className="h-12 w-12 animate-pulse"
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
          <CardDescription>Sign in to continue your cognitive journey with {APP_NAME}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="john.doe@example.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground">
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
