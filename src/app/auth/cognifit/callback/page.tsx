
"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Child component that uses useSearchParams
function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log all query parameters received
    if (searchParams) {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      if (Object.keys(params).length > 0) {
        console.log('Cognitive Gym Callback Received - URL Parameters:', params);
        // In a real scenario, you would process these parameters here.
        // For example, if a user_token is passed:
        // const userToken = searchParams.get('user_token');
        // if (userToken) {
        //   // Update auth context, redirect user, etc.
        // }
      } else {
        console.log('Cognitive Gym Callback Received - No URL Parameters found.');
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cognitive Gym Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Processing Cognitive Gym redirect...
          </p>
          <CardDescription className="text-xs">
            This page is a handler for redirects from Cognitive Gym.
            If you are a developer, you may need to implement logic here to
            process tokens or data sent by Cognitive Gym in the URL parameters.
            Check the browser console for logged parameters.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

// Fallback component for Suspense
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="h-16 w-16 animate-pulse text-primary" />
      <p className="mt-4 text-muted-foreground">Loading callback information...</p>
    </div>
  );
}

export default function CognifitCallbackPage() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <CallbackContent />
      </Suspense>
    </AppLayout>
  );
}
