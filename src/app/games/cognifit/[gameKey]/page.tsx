
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
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';

const COGNITFIT_CONTENT_ID = 'cognitiveGymContent';

export default function CognifitGamePage() {
  useRequireAuth(); 
  const { user, isAuthenticated, isLoadingAuth: isLoadingAuthContext, updateCognifitUserToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string;
  const { toast } = useToast();

  const [game, setGame] = useState<CognitiveGame | null>(null);
  const [currentStatus, setCurrentStatus] = useState< 'idle' | 'registering' | 'fetching_access_token' | 'loading_sdk' | 'sdk_error' | 'registration_error' | 'access_token_error' | 'game_ended' | 'game_loaded' >('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const cognifitSdkInstanceRef = useRef<cognifitSdk | null>(null);

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  useEffect(() => {
    if (gameKey) {
      const foundGame = COGNITIVE_GAMES.find(g => g.id.toUpperCase() === gameKey.toUpperCase());
      setGame(foundGame || null);
    }
  }, [gameKey]);

  const initializeAndLoadGame = useCallback(async (accessToken: string | null) => {
    if (!accessToken) {
      setStatusMessage("Cognitive Gym Access Token not available.");
      setCurrentStatus('access_token_error'); // Or a more general SDK error
      return;
    }
    
    if (!cognifitClientId) {
      setStatusMessage("Cognitive Gym Client ID is not configured. Please check environment variables.");
      setCurrentStatus('sdk_error');
      return;
    }

    if (!game) {
        setStatusMessage("Game details not loaded yet.");
        setCurrentStatus('sdk_error'); // Or a more generic error
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
      accessToken, // Use the access_token here
      sdkOptions
    );
    
    if (!cognifitSdkInstanceRef.current) {
      cognifitSdkInstanceRef.current = new cognifitSdk();
    }
    const sdk = cognifitSdkInstanceRef.current;

    console.log(`Initializing Cognitive Gym SDK for gameKey: ${gameKey.toUpperCase()} with access token.`);
    setCurrentStatus('loading_sdk');
    setStatusMessage(`Loading Cognitive Gym game (${game.title || gameKey})...`);

    try {
      await sdk.init(cognifitSdkConfig); 
      console.log('Cognitive Gym SDK initialized successfully for game:', game.title || gameKey);
      sdkInitializedRef.current = true;
      setCurrentStatus('game_loaded');
      setStatusMessage(`Game ${game.title || gameKey} initialized. Content should appear below.`);
    } catch (sdkError: any) {
      console.error('Cognitive Gym SDK initialization failed:', sdkError);
      setStatusMessage(`Failed to initialize Cognitive Gym game. ${sdkError.message || String(sdkError)}`);
      setCurrentStatus('sdk_error');
    }
  }, [gameKey, cognifitClientId, game]);


  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !gameKey || sdkInitializedRef.current || !user) {
      if (!isLoadingAuthContext && !isAuthenticated) {
         setCurrentStatus('sdk_error'); 
         setStatusMessage("User not authenticated. Please log in.");
      }
      if (!isLoadingAuthContext && isAuthenticated && !user) {
        setCurrentStatus('sdk_error');
        setStatusMessage("User data not available.");
      }
      return;
    }

    const processCognifitTokensAndLoadGame = async (currentUserToken: string) => {
        setCurrentStatus('fetching_access_token');
        setStatusMessage("Preparing your Cognitive Gym session...");
        toast({ title: "Connecting to Cognitive Gym", description: "Fetching session token..."});

        try {
            const accessTokenResponse = await fetch('/api/cognifit/issue-access-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userToken: currentUserToken }),
            });
            const accessTokenData = await accessTokenResponse.json();

            if (!accessTokenResponse.ok || accessTokenData.error) {
                const errorMsg = accessTokenData.error || `Failed to obtain session token (status: ${accessTokenResponse.status})`;
                console.error("Failed to fetch access token:", errorMsg);
                setStatusMessage(`Could not start Cognitive Gym session: ${errorMsg}. Please try again.`);
                setCurrentStatus('access_token_error');
                toast({ title: "Session Start Failed", description: errorMsg, variant: "destructive", duration: 10000 });
                return;
            }
            
            const newAccessToken = accessTokenData.accessToken;
            if (!newAccessToken) {
                console.error("No access token received from API.");
                setStatusMessage("Could not start Cognitive Gym session: No session token received. Please try again.");
                setCurrentStatus('access_token_error');
                toast({ title: "Session Start Failed", description: "No session token received from server.", variant: "destructive", duration: 10000 });
                return;
            }

            initializeAndLoadGame(newAccessToken);

        } catch (tokenError: any) {
            console.error("Error fetching access token:", tokenError);
            setStatusMessage(`An error occurred while preparing your session: ${tokenError.message || String(tokenError)}. Please try again.`);
            setCurrentStatus('access_token_error');
            toast({ title: "Session Connection Error", description: "Could not connect to Cognitive Gym services for session token.", variant: "destructive", duration: 10000 });
        }
    };

    const attemptCognifitRegistrationAndLoad = async () => {
      if (!user) { 
        setStatusMessage("User data not available for Cognitive Gym operations.");
        setCurrentStatus('registration_error'); // Or more generic error
        return;
      }

      if (user.cognifitUserToken) {
        processCognifitTokensAndLoadGame(user.cognifitUserToken);
      } else {
        if (!user.id || !user.firstName || !user.lastName || !user.birthDate || !user.sex) {
          const missingFields = [
            !user.id && "User ID",
            !user.firstName && "First Name",
            !user.lastName && "Last Name",
            !user.birthDate && "Birth Date",
            !user.sex && "Gender"
          ].filter(Boolean).join(', ');

          setStatusMessage(`Your profile is missing details (${missingFields}) required for Cognitive Gym. Please complete your Xillo TruePotential profile information.`);
          setCurrentStatus('registration_error');
          toast({
            title: "Profile Incomplete",
            description: `Your profile is missing details (${missingFields}) required for Cognitive Gym. Please go to your Profile page to ensure all details are filled out.`,
            variant: "destructive",
            duration: 10000,
          });
          return;
        }
        
        setCurrentStatus('registering');
        setStatusMessage("One moment while we set up your Cognitive Gym account...");
        toast({ title: "Connecting to Cognitive Gym", description: "Setting up your Cognitive Gym account..."});
        try {
          const response = await fetch('/api/cognifit/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appUserId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              birthDate: user.birthDate, 
              sex: user.sex,
              locale: 'en', 
            }),
          });

          const data = await response.json();

          if (!response.ok || data.error) {
            const errorMessage = data.error || `Failed to register with Cognitive Gym (status: ${response.status})`;
            console.error("On-demand Cognitive Gym registration failed (from API route):", errorMessage);
            setStatusMessage(`Registration with Cognitive Gym failed: ${errorMessage}. Please try again or contact support.`);
            setCurrentStatus('registration_error');
            toast({ title: "Cognitive Gym Registration Failed", description: errorMessage, variant: "destructive", duration: 10000 });
            return; 
          }
          
          const newCognifitUserToken = data.userToken;
          if (!newCognifitUserToken) {
            console.error("On-demand Cognitive Gym registration failed: No user token received.");
            setStatusMessage(`Registration with Cognitive Gym failed: No user token received. Please try again or contact support.`);
            setCurrentStatus('registration_error');
            toast({ title: "Cognitive Gym Registration Failed", description: "No user token was received after registration. Please contact support.", variant: "destructive", duration: 10000 });
            return;
          }
          
          updateCognifitUserToken(newCognifitUserToken); 
          toast({ title: "Cognitive Gym Account Ready!", description: "Fetching session token..."});
          processCognifitTokensAndLoadGame(newCognifitUserToken);

        } catch (regError: any) {
          console.error("Error during on-demand Cognitive Gym registration process:", regError);
          setStatusMessage(`An unexpected error occurred during Cognitive Gym registration: ${regError.message || String(regError)}. Please try again.`);
          setCurrentStatus('registration_error');
          toast({ title: "Cognitive Gym Connection Error", description: "Could not connect to our registration service. Please check your internet connection and try again.", variant: "destructive", duration: 10000 });
        }
      }
    };

    if (isAuthenticated && user && !sdkInitializedRef.current && (currentStatus === 'idle' || currentStatus === 'sdk_error' || currentStatus === 'registration_error' || currentStatus === 'access_token_error')) {
      attemptCognifitRegistrationAndLoad();
    }    

    return () => {
      // Consider SDK cleanup if needed
      // if (sdkInitializedRef.current && cognifitSdkInstanceRef.current) {
      //   // cognifitSdkInstanceRef.current.destroy(); // If exists
      // }
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
      currentStatus, 
      game 
    ]);


  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data;
        console.log("Message from Cognitive Gym iframe:", event.data);

        if (key && typeof key === 'string' && 
            mode && typeof mode === 'string' && 
            status && typeof status === 'string') {
          
          if (key.toUpperCase() === gameKey.toUpperCase()) {
            if (status === 'completed' || status === 'session_finished') {
              toast({ title: "Game Completed!", description: `${game?.title || gameKey} session finished.` });
              setStatusMessage(`Game session for ${game?.title || gameKey} completed successfully!`);
              setCurrentStatus('game_ended');
            } else if (status === 'aborted' || status === 'session_cancelled') {
              toast({ title: "Game Aborted", description: `${game?.title || gameKey} session was exited.`, variant: "destructive" });
              setStatusMessage(`Game session for ${game?.title || gameKey} was aborted.`);
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
  }, [gameKey, toast, game]);


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
  
  const showLoadingIndicator = currentStatus === 'registering' || currentStatus === 'fetching_access_token' || currentStatus === 'loading_sdk';
  const showErrorState = currentStatus === 'sdk_error' || currentStatus === 'registration_error' || currentStatus === 'access_token_error';
  const showGameEndedMessage = currentStatus === 'game_ended';
  const showGameArea = currentStatus === 'game_loaded' || (currentStatus === 'idle' && sdkInitializedRef.current); 

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Cognitive Gym Game: {game?.title || gameKey}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusMessage && (
              <div className={`my-4 p-4 border rounded-md ${
                showErrorState ? 'bg-destructive/10 border-destructive/50 text-destructive' 
                : showGameEndedMessage ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300'
                : 'bg-accent/10 border-accent/50 text-accent-foreground'
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
             typeof document !== 'undefined' && 
             !document.getElementById(COGNITFIT_CONTENT_ID)?.hasChildNodes() && (
                 <div className="text-center py-4 text-muted-foreground">
                    <p>SDK initialized. If the game does not appear, it might indicate an issue with this specific game key (`{gameKey.toUpperCase()}`) or SDK configuration for loading this activity. The `init()` method might not be sufficient alone and CogniFit may require specific game loading calls after init.</p>
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

    