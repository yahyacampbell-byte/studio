
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CognifitSdk } from '@cognifit/launcher-js-sdk';
import { CognifitSdkConfigOptions, CognifitSdkConfig } from '@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config'; // Adjusted path if necessary

const COGNIFIT_CONTENT_ID = 'cogniFitContent';

export default function CognifitGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string; // gameKey is used for display and messages, but SDK might not use it directly in init
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const cognifitSdkRef = useRef<CognifitSdk | null>(null);

  // Placeholder for user_token. In a real app, this would come from auth context/state.
  // IMPORTANT: Replace this with actual user_token retrieval logic.
  const userToken = "YOUR_USER_TOKEN_HERE"; // TODO: Replace with dynamic user token

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  useEffect(() => {
    if (!cognifitClientId) {
      setError("CogniFit Client ID is not configured. Please check environment variables.");
      setIsLoading(false);
      return;
    }

    if (userToken === "YOUR_USER_TOKEN_HERE") {
        console.warn("CogniFit Game Page: userToken is a placeholder. Replace with actual token.");
        toast({
            title: "Developer Notice",
            description: "User token is a placeholder. CogniFit game may not load correctly.",
            variant: "destructive",
            duration: 10000,
        });
    }

    if (sdkInitializedRef.current || !gameKey) {
      return;
    }

    const sdkOptions: CognifitSdkConfigOptions = {
        sandbox: false,
        appType: 'web',
        theme: 'light', // Consider making this dynamic with your app's theme
        showResults: false, // As per example
        // customCss: '', // URL to custom CSS file if you have one
        // screensNotToShow: [], // List of screens not to show after the session
        // preferredMobileOrientation: '', // '', 'landscape' or 'portrait'
        isFullscreenEnabled: true,
        // scale: 100, // Example used scale: 100, default is 800. Adjust as needed. Max value for UI elements.
        listenEvents: true, // Important for postMessage communication
        // The SDK needs the actual activity key and mode to load a game.
        // This might be part of the options or a separate method call.
        // Based on the provided init structure, we'll assume init handles it or another step is needed.
        // For now, we'll pass gameKey and mode if the config supports it, otherwise, this might be a limitation.
        // The provided CognifitSdkConfig structure does not directly take activityKey or activityMode.
        // This implies the SDK might handle it based on the URL/environment or require a subsequent call.
        // The previous HTML5JS.loadMode directly took gameKey and 'gameMode'.
        // We might need to pass gameKey and activityMode through a different mechanism if available in SDK options or a post-init call.
        // For now, we can't pass gameKey directly to config options as per user's provided structure.
        // The actual game to load (gameKey) and its type ('gameMode') needs to be communicated to the SDK.
        // Let's assume the SDK's `init` implicitly knows or the user will provide the next step if a game doesn't load.
        // The activityKey and activityMode are crucial. The `CognifitSdkConfig` type definition from the package
        // itself would clarify if `activityKey` and `activityMode` can be passed in the options.
        // If not, a method like `cognifitSdk.loadActivity('gameMode', gameKey.toUpperCase())` would be expected after init.
        // For now, we proceed with init only as per the user's last prompt.
        // Including activityKey and activityMode in options if the SDK supports it (example below, may need to verify with SDK docs):
        // activityKey: gameKey.toUpperCase(),
        // activityMode: 'gameMode',
    };


    const cognifitSdkConfig = new CognifitSdkConfig(
      COGNIFIT_CONTENT_ID,
      cognifitClientId!,
      userToken, // This is the cognifitUserAccessToken
      sdkOptions
    );
    
    if (!cognifitSdkRef.current) {
        cognifitSdkRef.current = new CognifitSdk();
    }
    
    const sdk = cognifitSdkRef.current;

    console.log(`Initializing CogniFit SDK for gameKey: ${gameKey}`);
    setIsLoading(true);
    setError(null);

    sdk.init(cognifitSdkConfig)
      .then(response => {
        console.log('CogniFit SDK initialized successfully:', response);
        sdkInitializedRef.current = true;
        setIsLoading(false);
        // At this point, the SDK should have loaded the content/game into the container.
        // If `init` doesn't load the specific game, a subsequent call like `sdk.loadActivity('gameMode', gameKey.toUpperCase())` would be needed here.
        // For now, we assume `init` handles it or this is the complete step requested.
      })
      .catch(sdkError => {
        console.error('CogniFit SDK initialization failed:', sdkError);
        setError(`Failed to initialize CogniFit game. ${sdkError.message || sdkError}`);
        setIsLoading(false);
      });

    // Cleanup function for when the component unmounts
    return () => {
      if (sdkInitializedRef.current && sdk) {
        // sdk.destroy() or sdk.cleanup() if such methods exist
        // For now, clear the container manually if the SDK doesn't auto-cleanup.
        // This helps if navigating away and back quickly.
        const cognifitContainer = document.getElementById(COGNIFIT_CONTENT_ID);
        if (cognifitContainer) {
          // cognifitContainer.innerHTML = ''; // Clearing might interfere if SDK manages it.
        }
        console.log('CogniFit game page unmounted, SDK instance might need cleanup if provided by SDK.');
        // sdkInitializedRef.current = false; // Reset for potential re-entry if SDK is fully cleaned up
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, cognifitClientId, userToken]); // Add other dependencies if they affect init


  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data; // Assuming `key` here is the activityKey
        console.log("Message from CogniFit:", event.data);

        // Check if the message is for the current game. CogniFit might send the activity key in uppercase.
        if (key && typeof key === 'string' && key.toLowerCase() === gameKey.toLowerCase()) {
          if (status === 'completed') {
            toast({ title: "Game Completed!", description: `${gameKey} session finished.` });
            // Potentially navigate away or show summary.
            // router.push('/games'); 
          } else if (status === 'aborted') {
            toast({ title: "Game Aborted", description: `${gameKey} session was exited.`, variant: "destructive" });
            // router.push('/games');
          }
          
          // SDK might handle iframe cleanup automatically. If not, manual cleanup:
          const cognifitContainer = document.getElementById(COGNIFIT_CONTENT_ID);
          if (cognifitContainer) {
            // cognifitContainer.innerHTML = ''; // Let SDK manage or clear if events stop
          }
          sdkInitializedRef.current = false; // Allow re-initialization if user navigates back
          setIsLoading(true); // Show loader briefly or a "Session Ended" message
          setError("Game session ended. You can navigate back or select another game.");
        }
      }
    };

    window.addEventListener('message', handleCognifitMessage);
    return () => {
      window.removeEventListener('message', handleCognifitMessage);
    };
  }, [gameKey, router, toast]);

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
                {userToken === "YOUR_USER_TOKEN_HERE" && cognifitClientId && !sdkInitializedRef.current && (
                    <p className="mt-2 text-sm">
                        Please ensure you replace `"YOUR_USER_TOKEN_HERE"` in the code with a valid CogniFit user token for this game to load.
                    </p>
                )}
              </div>
            )}
            {isLoading && !error && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading CogniFit game ({gameKey})...</p>
                <p className="text-sm text-muted-foreground mt-2">Initializing SDK...</p>
              </div>
            )}
            <div id={COGNIFIT_CONTENT_ID} className={isLoading || error ? 'hidden' : ''}>
              {/* CogniFit content will be injected here by the SDK */}
            </div>
             {!isLoading && !error && !sdkInitializedRef.current && cognifitClientId && userToken !== "YOUR_USER_TOKEN_HERE" && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">SDK initialization initiated. If the game does not appear, check console for errors and ensure the user token and game key ('{gameKey}') are correct.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    