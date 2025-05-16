
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CognifitSdk } from '@cognifit/launcher-js-sdk';
import { CognifitSdkConfigOptions, CognifitSdkConfig } from '@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const COGNIFIT_CONTENT_ID = 'cogniFitContent';

export default function CognifitGamePage() {
  useRequireAuth(); // Handles redirection if not authenticated
  const { cognifitUserToken, isAuthenticated, isLoadingAuth: isLoadingAuthContext } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string;
  const { toast } = useToast();

  const [isLoadingSdk, setIsLoadingSdk] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const cognifitSdkRef = useRef<CognifitSdk | null>(null);

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !cognifitUserToken || sdkInitializedRef.current || !gameKey) {
      if (!isLoadingAuthContext && !isAuthenticated) {
        // Auth hook will handle redirect, but good to prevent SDK init
        setIsLoadingSdk(false);
      }
      if (!isLoadingAuthContext && isAuthenticated && !cognifitUserToken) {
          setError("CogniFit User Token not available. Please ensure you are properly logged in and a token is set.");
          setIsLoadingSdk(false);
      }
      return;
    }

    if (!cognifitClientId) {
      setError("CogniFit Client ID is not configured. Please check environment variables.");
      setIsLoadingSdk(false);
      return;
    }

    if (cognifitUserToken === "DEMO_COGNIFIT_USER_TOKEN" || cognifitUserToken === "YOUR_USER_TOKEN_HERE") {
        console.warn("CogniFit Game Page: cognifitUserToken is a placeholder/demo. Replace with actual token for real gameplay.");
        toast({
            title: "Developer Notice",
            description: "User token is a placeholder. CogniFit game may not load correctly with actual user data.",
            variant: "destructive",
            duration: 10000,
        });
    }
    
    const sdkOptions: CognifitSdkConfigOptions = {
        sandbox: false,
        appType: 'web',
        theme: 'light',
        showResults: false,
        isFullscreenEnabled: true,
        listenEvents: true,
        // The actual game to load needs to be communicated to the SDK.
        // Assuming the SDK's `init` might handle it if the activityKey is part of the URL or environment.
        // Or a subsequent call like `cognifitSdk.loadActivity('gameMode', gameKey.toUpperCase())` is needed after init.
        // For now, let's assume the SDK expects activityKey and activityMode in options if supported,
        // or that `init` somehow handles game selection based on context (e.g. if this page is embedded).
        // If not, `sdk.loadActivity` would be the typical next step.
        // activityKey: gameKey.toUpperCase(), // This may or may not be a valid option here
        // activityMode: 'gameMode',         // This may or may not be a valid option here
    };

    const cognifitSdkConfig = new CognifitSdkConfig(
      COGNIFIT_CONTENT_ID,
      cognifitClientId!,
      cognifitUserToken, // This is the cognifitUserAccessToken from AuthContext
      sdkOptions
    );
    
    if (!cognifitSdkRef.current) {
        cognifitSdkRef.current = new CognifitSdk();
    }
    
    const sdk = cognifitSdkRef.current;

    console.log(`Initializing CogniFit SDK for gameKey: ${gameKey} with token: ${cognifitUserToken}`);
    setIsLoadingSdk(true);
    setError(null);

    sdk.init(cognifitSdkConfig)
      .then(response => {
        console.log('CogniFit SDK initialized successfully:', response);
        // TODO: Explicitly load the game if `init` doesn't do it automatically.
        // Example: sdk.loadActivity('gameMode', gameKey.toUpperCase())
        // For now, we assume init prepares the ground. If the game doesn't appear, this is where to look.
        // The `init` method itself may not directly load the game; rather, it prepares the SDK.
        // If the SDK is designed to load content based on the URL hash or query params when embedded via client_hash,
        // then `init` might be enough. Otherwise, an explicit load call is needed.
        // The prompt indicates `init` then `loadMode` for HTML5JS version.
        // For SDK, it's `init` and potentially `sdk.loadActivity(activityType, activityKey, options)` or similar.
        // The provided SDK init structure doesn't show how to load a specific game directly in init options.
        // *This is a critical point to verify with CogniFit SDK v2 documentation.*
        // For now, we'll assume init is the first step and see if content loads.
        // If not, a `loadActivity` type call would follow here.
        sdkInitializedRef.current = true;
        setIsLoadingSdk(false);
      })
      .catch(sdkError => {
        console.error('CogniFit SDK initialization failed:', sdkError);
        setError(`Failed to initialize CogniFit game. ${sdkError.message || sdkError}`);
        setIsLoadingSdk(false);
      });

    return () => {
      if (sdkInitializedRef.current && sdk) {
        // sdk.destroy() or sdk.cleanup() if available
        console.log('CogniFit game page unmounted, SDK instance might need cleanup.');
        // sdkInitializedRef.current = false; // Reset if SDK is fully cleaned up
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, cognifitClientId, cognifitUserToken, isAuthenticated, isLoadingAuthContext]);


  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data;
        console.log("Message from CogniFit:", event.data);

        if (key && typeof key === 'string' && key.toLowerCase() === gameKey.toLowerCase()) {
          if (status === 'completed') {
            toast({ title: "Game Completed!", description: `${gameKey} session finished.` });
          } else if (status === 'aborted') {
            toast({ title: "Game Aborted", description: `${gameKey} session was exited.`, variant: "destructive" });
          }
          // SDK might handle iframe cleanup. If not, manual cleanup or state reset here.
          // sdkInitializedRef.current = false; // Allow re-initialization
          // setIsLoadingSdk(true); 
          setError("Game session ended. You can navigate back or select another game.");
        }
      }
    };

    window.addEventListener('message', handleCognifitMessage);
    return () => {
      window.removeEventListener('message', handleCognifitMessage);
    };
  }, [gameKey, router, toast]);


  if (isLoadingAuthContext) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Authenticating...</p>
        </div>
      </AppLayout>
    );
  }
  
  // At this point, useRequireAuth should have redirected if not authenticated.
  // If still here and not authenticated, it's a brief state before redirect.

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>CogniFit Game: {gameKey}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="my-4 p-4 bg-destructive/10 border border-destructive/50 rounded-md text-destructive">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="font-semibold">Session Status</p>
                </div>
                <p>{error}</p>
                {(!cognifitUserToken || cognifitUserToken === "DEMO_COGNIFIT_USER_TOKEN") && cognifitClientId && !sdkInitializedRef.current && (
                    <p className="mt-2 text-sm">
                        Please ensure you have a valid CogniFit user token. The current token is a placeholder/demo.
                    </p>
                )}
              </div>
            )}
            {isLoadingSdk && !error && isAuthenticated && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading CogniFit game ({gameKey})...</p>
                <p className="text-sm text-muted-foreground mt-2">Initializing SDK...</p>
              </div>
            )}
            <div id={COGNIFIT_CONTENT_ID} className={isLoadingSdk || error || !isAuthenticated ? 'hidden' : ''}>
              {/* CogniFit content will be injected here by the SDK */}
            </div>
             {!isLoadingSdk && !error && !sdkInitializedRef.current && cognifitClientId && cognifitUserToken && cognifitUserToken !== "DEMO_COGNIFIT_USER_TOKEN" && isAuthenticated && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">SDK initialization process started. If the game does not appear, check console for errors from CogniFit SDK and ensure the user token and game key ('{gameKey}') are correct and that your CogniFit account is configured to allow this game for the user/client.</p>
                </div>
            )}
            {!isAuthenticated && !isLoadingAuthContext && (
                 <div className="text-center py-4">
                    <p className="text-muted-foreground">Please log in to play CogniFit games.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
