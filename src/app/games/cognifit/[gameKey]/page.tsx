
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { getCognifitSDKVersion } from '@/services/cognifitService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// If @cognifit/launcher-js-sdk provides types, import them. Otherwise, declare global.
// For now, let's assume HTML5JS is globally available after script load.
declare global {
  interface Window {
    HTML5JS?: {
      loadMode: (
        sdkVersion: string,
        activityMode: 'gameMode' | 'assessmentMode' | 'trainingMode',
        activityKey: string,
        containerId: string,
        options: {
          clientId: string;
          accessToken: string; // This is the user_token
          appType: 'web' | 'app';
          sandbox?: boolean; // Optional: for testing
          language?: string; // Optional: e.g., "en", "es"
          disableFitScore?: boolean; // Optional
        }
      ) => void;
    };
  }
}

const COGNIFIT_CONTENT_ID = 'cogniFitContent';

export default function CognifitGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkVersion, setSdkVersion] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const gameLoadedRef = useRef(false);

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
        // This is a developer reminder, not a user-facing error yet.
        console.warn("CogniFit Game Page: userToken is a placeholder. Replace with actual token.");
        toast({
            title: "Developer Notice",
            description: "User token is a placeholder. CogniFit game may not load correctly.",
            variant: "destructive",
            duration: 10000,
        });
        // Allow proceeding for testing UI, but real game load will fail without a valid token.
    }

    const fetchVersionAndLoadScript = async () => {
      try {
        const version = await getCognifitSDKVersion();
        setSdkVersion(version);
      } catch (e) {
        console.error("Failed to fetch CogniFit SDK version:", e);
        setError("Could not retrieve CogniFit SDK version. Game cannot be loaded.");
        setIsLoading(false);
      }
    };

    fetchVersionAndLoadScript();
  }, [cognifitClientId, toast, userToken]);


  useEffect(() => {
    if (!sdkVersion || scriptLoadedRef.current || !cognifitClientId || !gameKey) {
      return;
    }

    const scriptId = 'cognifit-sdk-script';
    if (document.getElementById(scriptId)) {
      // Script might already be there from a previous attempt or navigation
      scriptLoadedRef.current = true;
      // Proceed to load game if HTML5JS is available
       if (window.HTML5JS && typeof window.HTML5JS.loadMode === 'function' && !gameLoadedRef.current) {
            loadCognifitGame();
       } else if (!window.HTML5JS) {
            console.warn("CogniFit script tag found, but HTML5JS not on window. Re-attempting load may be needed or there's an issue.");
       }
      return;
    }
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://js.cognifit.com/${sdkVersion}/html5Loader.js`;
    script.async = true;
    script.onload = () => {
      console.log('CogniFit SDK script loaded successfully.');
      scriptLoadedRef.current = true;
      loadCognifitGame();
    };
    script.onerror = () => {
      console.error('Failed to load CogniFit SDK script.');
      setError('Failed to load necessary CogniFit components. Please try again later.');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts before it loads or if an error occurs
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        // document.body.removeChild(existingScript); // Careful with removing if it might be shared or reloaded
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkVersion, cognifitClientId, gameKey, userToken]);


  const loadCognifitGame = () => {
    if (gameLoadedRef.current) {
        console.log("CogniFit game already attempted to load or is loaded.");
        return;
    }

    if (window.HTML5JS && typeof window.HTML5JS.loadMode === 'function') {
      console.log(`Loading CogniFit game: ${gameKey} with SDK v${sdkVersion}`);
      try {
        window.HTML5JS.loadMode(
          sdkVersion!,
          'gameMode',
          gameKey.toUpperCase(), // Game keys are often uppercase
          COGNIFIT_CONTENT_ID,
          {
            clientId: cognifitClientId!,
            accessToken: userToken, 
            appType: 'web', // or 'app' based on device detection if needed
            // language: "en", // Optional: set user's language
            // sandbox: true, // Optional: if CogniFit provides a sandbox mode
          }
        );
        gameLoadedRef.current = true; // Mark that loading has been initiated
        // Note: actual game display is handled by the SDK injecting an iframe
        // We set isLoading to false once loadMode is called, assuming iframe will take over.
        // If iframe fails to load, there isn't a direct JS error here usually.
         setTimeout(() => setIsLoading(false), 500); // Give a slight delay for iframe to start
      } catch (e) {
        console.error("Error calling HTML5JS.loadMode:", e);
        setError(`Failed to initialize CogniFit game ${gameKey}.`);
        setIsLoading(false);
      }
    } else {
      console.error('HTML5JS is not available. CogniFit game cannot be loaded.');
      setError('CogniFit components are not available. Game cannot be loaded.');
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      // Basic security check for origin if possible, though CogniFit might use variable origins for its CDN
      // if (event.origin !== "EXPECTED_COGNIFIT_ORIGIN") return;
      
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data;
        console.log("Message from CogniFit:", event.data);

        if (key && key.toLowerCase() === gameKey.toLowerCase()) {
          if (status === 'completed') {
            toast({ title: "Game Completed!", description: `${gameKey} session finished.` });
            // Potentially navigate away or show summary
            // router.push('/games'); 
          } else if (status === 'aborted') {
            toast({ title: "Game Aborted", description: `${gameKey} session was exited.`, variant: "destructive" });
            // router.push('/games');
          }
          
          // Destroy/cleanup the iframe/content as per CogniFit docs
          const cognifitContainer = document.getElementById(COGNIFIT_CONTENT_ID);
          if (cognifitContainer) {
            cognifitContainer.innerHTML = ''; // Clear the container
            // Potentially show a message like "Game session ended. Click back to browse other games."
             setError("Game session ended. You can navigate back or select another game if this page were part of a larger list.");
          }
           gameLoadedRef.current = false; // Allow reloading if user navigates back and forth or tries again.
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
                  <p className="font-semibold">Loading Error</p>
                </div>
                <p>{error}</p>
                {userToken === "YOUR_USER_TOKEN_HERE" && cognifitClientId && (
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
                {!sdkVersion && <p className="text-sm text-muted-foreground mt-2">Fetching SDK version...</p>}
                {sdkVersion && !scriptLoadedRef.current && <p className="text-sm text-muted-foreground mt-2">Loading CogniFit Player...</p>}
              </div>
            )}
            <div id={COGNIFIT_CONTENT_ID} className={isLoading || error ? 'hidden' : ''}>
              {/* CogniFit iframe will be injected here */}
            </div>
             {!isLoading && !error && !gameLoadedRef.current && sdkVersion && window.HTML5JS && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">If the game does not appear, ensure the user token is valid and the game key '{gameKey}' is correct.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Helper to get a specific game's title if we had a list
// const getGameTitle = (gameKey: string): string => {
//   // This would ideally lookup from a constant or fetched list of CogniFit games
//   return gameKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
// };
