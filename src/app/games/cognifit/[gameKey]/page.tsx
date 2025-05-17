
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cognifitSdk, CognifitSdkConfigOptions, CognifitSdkConfig } from '@cognifit/launcher-js-sdk';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
// Removed direct import of registerCognifitUser
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';

const COGNITFIT_CONTENT_ID = 'cognitiveGymContent';

export default function CognifitGamePage() {
  useRequireAuth(); 
  const { user, isAuthenticated, isLoadingAuth: isLoadingAuthContext, updateCognifitUserToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string;
  const { toast } = useToast();

  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState< 'idle' | 'registering' | 'loading_sdk' | 'sdk_error' | 'registration_error' | 'game_ended' | 'game_loaded' >('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const cognifitSdkInstanceRef = useRef<cognifitSdk | null>(null);

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  useEffect(() => {
    if (gameKey) {
      const foundGame = COGNITIVE_GAMES.find(g => g.id.toUpperCase() === gameKey.toUpperCase());
      setGameTitle(foundGame ? foundGame.title : gameKey);
    }
  }, [gameKey]);

  const initializeAndLoadGame = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      setStatusMessage("Cognitive Gym User Token not available.");
      setCurrentStatus('registration_error');
      return;
    }
    
    if (!cognifitClientId) {
      setStatusMessage("Cognitive Gym Client ID is not configured. Please check environment variables.");
      setCurrentStatus('sdk_error');
      return;
    }

    const sdkOptions: CognifitSdkConfigOptions = {
      sandbox: false,
      appType: 'web',
      theme: 'light',
      showResults: false,
      isFullscreenEnabled: true,
      listenEvents: true,
    };

    const cognifitSdkConfig = new CognifitSdkConfig(
      COGNITFIT_CONTENT_ID,
      cognifitClientId!,
      currentToken,
      sdkOptions
    );
    
    if (!cognifitSdkInstanceRef.current) {
      cognifitSdkInstanceRef.current = new cognifitSdk();
    }
    const sdk = cognifitSdkInstanceRef.current;

    console.log(`Initializing Cognitive Gym SDK for gameKey: ${gameKey.toUpperCase()} with token: ${currentToken}`);
    setCurrentStatus('loading_sdk');
    setStatusMessage(`Loading Cognitive Gym game (${gameTitle || gameKey})...`);

    try {
      await sdk.init(cognifitSdkConfig); 
      // If sdk.init() only initializes but doesn't load the game, you might need:
      // await sdk.loadActivity('gameMode', gameKey.toUpperCase());
      // Or similar, depending on the SDK's API.
      console.log('Cognitive Gym SDK initialized successfully for game:', gameKey.toUpperCase());
      sdkInitializedRef.current = true;
      setCurrentStatus('game_loaded');
      setStatusMessage(`Game ${gameTitle || gameKey} initialized. Content should appear below.`);
    } catch (sdkError: any) {
      console.error('Cognitive Gym SDK initialization failed:', sdkError);
      setStatusMessage(`Failed to initialize Cognitive Gym game. ${sdkError.message || String(sdkError)}`);
      setCurrentStatus('sdk_error');
    }
  }, [gameKey, cognifitClientId, gameTitle]);


  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !gameKey || sdkInitializedRef.current) {
      if (!isLoadingAuthContext && !isAuthenticated) {
         setCurrentStatus('sdk_error'); 
         setStatusMessage("User not authenticated. Please log in.");
      }
      return;
    }

    const attemptCognifitRegistrationAndLoad = async () => {
      if (!user) {
        setStatusMessage("User data not available for Cognitive Gym registration.");
        setCurrentStatus('registration_error');
        return;
      }

      if (user.cognifitUserToken) {
        initializeAndLoadGame(user.cognifitUserToken);
      } else {
        if (!user.id || !user.firstName || !user.lastName || !user.birthDate || !user.sex) {
          setStatusMessage("Your profile is missing details required for Cognitive Gym. Please complete your Xillo TruePotential profile information.");
          setCurrentStatus('registration_error');
          toast({
            title: "Profile Incomplete",
            description: "Your profile is missing details required for Cognitive Gym. Please complete your registration information via the Profile page.",
            variant: "destructive",
            duration: 7000,
          });
          return;
        }
        
        setCurrentStatus('registering');
        setStatusMessage("One moment while we set up your Cognitive Gym account...");
        toast({ title: "Connecting to Cognitive Gym", description: "Setting up your Cognitive Gym account..."});
        try {
          const response = await fetch('/api/cognifit/register-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              appUserId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              birthDate: user.birthDate, 
              sex: user.sex === '1' ? 1 : 2,
              locale: 'en', // Or derive from user preferences/browser
            }),
          });

          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error(data.error || `Failed to register with Cognitive Gym (status: ${response.status})`);
          }
          
          const newCognifitToken = data.userToken;
          if (!newCognifitToken) {
            throw new Error("No user token received from Cognitive Gym registration.");
          }
          
          updateCognifitUserToken(newCognifitToken); 
          toast({ title: "Cognitive Gym Account Ready!", description: "Loading your game..."});
          initializeAndLoadGame(newCognifitToken);

        } catch (regError: any) {
          console.error("On-demand Cognitive Gym registration failed:", regError);
          setStatusMessage(`Failed to register with Cognitive Gym: ${regError.message || String(regError)}. Please try again or contact support.`);
          setCurrentStatus('registration_error');
          toast({
            title: "Cognitive Gym Registration Failed",
            description: regError.message || "Could not connect to Cognitive Gym services. Please ensure your API credentials are correct and the service is reachable.",
            variant: "destructive",
            duration: 10000,
          });
        }
      }
    };

    if (isAuthenticated && user && !sdkInitializedRef.current && (currentStatus === 'idle' || currentStatus === 'sdk_error' || currentStatus === 'registration_error')) {
      attemptCognifitRegistrationAndLoad();
    }    

    return () => {
      if (sdkInitializedRef.current && cognifitSdkInstanceRef.current) {
        // cognifitSdkInstanceRef.current.destroy(); // If a destroy method exists. Consult SDK docs.
        console.log('Cognitive Gym game page unmounted, SDK instance might need cleanup.');
        // Resetting ref might be needed if re-entry to this page should always re-init from scratch
        // sdkInitializedRef.current = false; 
        // cognifitSdkInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      gameKey, 
      user, 
      isAuthenticated, 
      isLoadingAuthContext, 
      updateCognifitUserToken, 
      initializeAndLoadGame,
      toast,
      currentStatus // Added currentStatus to re-trigger attempts on certain error states if user remains on page
    ]);


  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data;
        // Log all messages from CogniFit for debugging
        console.log("Message from Cognitive Gym iframe:", event.data);

        // Ensure key, mode, and status are present and of expected types
        if (key && typeof key === 'string' && 
            mode && typeof mode === 'string' && 
            status && typeof status === 'string') {
          
          // Compare gameKey.toUpperCase() with the key from the message
          if (key.toUpperCase() === gameKey.toUpperCase()) {
            if (status === 'completed' || status === 'session_finished') { // 'session_finished' might also be used
              toast({ title: "Game Completed!", description: `${gameTitle || gameKey} session finished.` });
              setStatusMessage(`Game session for ${gameTitle || gameKey} completed successfully!`);
              setCurrentStatus('game_ended');
              // Consider adding activity to your local ActivityContext here if needed
            } else if (status === 'aborted' || status === 'session_cancelled') { // 'session_cancelled' might also be used
              toast({ title: "Game Aborted", description: `${gameTitle || gameKey} session was exited.`, variant: "destructive" });
              setStatusMessage(`Game session for ${gameTitle || gameKey} was aborted.`);
              setCurrentStatus('game_ended');
            }
          }
        }
      }
    };

    window.addEventListener('message', handleCognifitMessage);
    return () => {
      window.removeEventListener('message', handleCognifitMessage);
    };
  }, [gameKey, toast, gameTitle]);


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
  
  const showLoadingIndicator = currentStatus === 'registering' || currentStatus === 'loading_sdk';
  const showErrorState = currentStatus === 'sdk_error' || currentStatus === 'registration_error';
  const showGameEndedMessage = currentStatus === 'game_ended';
  // Game area should be visible if game_loaded or if it was idle but sdk got initialized (e.g. on re-render)
  const showGameArea = currentStatus === 'game_loaded' || (currentStatus === 'idle' && sdkInitializedRef.current); 

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Cognitive Gym Game: {gameTitle || gameKey}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusMessage && (
              <div className={`my-4 p-4 border rounded-md ${
                showErrorState ? 'bg-destructive/10 border-destructive/50 text-destructive' 
                : showGameEndedMessage ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'
                : 'bg-accent/10 border-accent/50 text-accent-foreground' // For 'registering', 'loading_sdk', 'game_loaded', 'idle'
              }`}>
                <div className="flex items-center">
                  {showErrorState && <AlertTriangle className="h-5 w-5 mr-2" />}
                  {showGameEndedMessage && <CheckCircle2 className="h-5 w-5 mr-2" />}
                  <p className="font-semibold">Session Status</p>
                </div>
                <p>{statusMessage}</p>
              </div>
            )}

            {showLoadingIndicator && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground mb-2">{statusMessage || "Processing..."}</p>
              </div>
            )}
            
            <div id={COGNITFIT_CONTENT_ID} className={!showGameArea || showLoadingIndicator || showErrorState || showGameEndedMessage ? 'hidden' : ''}>
              {/* Cognitive Gym content will be injected here by the SDK */}
            </div>
            
            {currentStatus === 'game_loaded' && 
             typeof document !== 'undefined' && // Ensure document is available (client-side)
             !document.getElementById(COGNITFIT_CONTENT_ID)?.hasChildNodes() && (
                 <div className="text-center py-4 text-muted-foreground">
                    <p>SDK initialized. If the game does not appear, it might indicate an issue with this specific game key (`{gameKey.toUpperCase()}`) or SDK configuration for loading this activity. The `init()` method might not be sufficient alone.</p>
                    <p>Consult the Cognitive Gym SDK documentation for `loadActivity(mode, key)` or similar methods that might be required after initialization.</p>
                </div>
            )}

            {!isAuthenticated && !isLoadingAuthContext && (
                 <div className="text-center py-4">
                    <p className="text-muted-foreground">Please log in to play Cognitive Gym games.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
