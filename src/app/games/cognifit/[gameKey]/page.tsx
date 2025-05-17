
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cognifitSdk } from '@cognifit/launcher-js-sdk';
import { CognifitSdkConfig } from '@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config';
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
  // cognifitSdkInstanceRef is removed as cognifitSdk is not a class/constructor.

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  useEffect(() => {
    if (gameKey) {
      const foundGame = COGNITIVE_GAMES.find(g => g.id.toUpperCase() === gameKey.toUpperCase());
      setGame(foundGame || null);
      if (!foundGame && currentStatus === 'idle') {
        setStatusMessage(`Game with key "${gameKey}" not found in our library.`);
        setCurrentStatus('sdk_error');
      }
    }
  }, [gameKey, currentStatus]);

  const initializeAndLoadGame = useCallback(async (accessToken: string | null) => {
    if (sdkInitializedRef.current) {
        console.log("SDK init process already started or completed.");
        return;
    }

    if (!accessToken) {
      setStatusMessage("Cognitive Gym Access Token not available.");
      setCurrentStatus('access_token_error');
      return;
    }

    if (!cognifitClientId) {
      setStatusMessage("Cognitive Gym Client ID is not configured. Please check environment variables.");
      setCurrentStatus('sdk_error');
      return;
    }

    if (!game) {
        setStatusMessage("Game details could not be loaded. Cannot initialize Cognitive Gym session.");
        setCurrentStatus('sdk_error');
        return;
    }

    // Type for sdkOptions using ConstructorParameters for CognifitSdkConfig
    const sdkOptions: ConstructorParameters<typeof CognifitSdkConfig>[3] = {
      sandbox: false,
      appType: 'web',
      theme: 'light',
      showResults: false,
      isFullscreenEnabled: true,
      listenEvents: true,
    };

    const cognifitConfig = new CognifitSdkConfig(
      COGNITFIT_CONTENT_ID,
      cognifitClientId,
      accessToken,
      sdkOptions
    );

    console.log(`Initializing Cognitive Gym SDK for gameKey: ${game.id.toUpperCase()} with access token.`);
    setCurrentStatus('loading_sdk');
    setStatusMessage(`Loading Cognitive Gym game (${game.title || game.id})...`);

    try {
      // Directly use the imported cognifitSdk object
      await cognifitSdk.init(cognifitConfig);
      console.log('Cognitive Gym SDK initialized successfully for game:', game.title || game.id);
      sdkInitializedRef.current = true;
      setCurrentStatus('game_loaded');
      setStatusMessage(`Game ${game.title || game.id} initialized. Content should appear below.`);
    } catch (sdkError: any) {
      console.error('Cognitive Gym SDK initialization failed:', sdkError);
      setStatusMessage(`Failed to initialize Cognitive Gym game. ${sdkError.message || String(sdkError)}`);
      setCurrentStatus('sdk_error');
      sdkInitializedRef.current = false; 
    }
  }, [cognifitClientId, game]);


  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !gameKey || sdkInitializedRef.current || !user) {
      if (!isLoadingAuthContext && !isAuthenticated) {
         setCurrentStatus('sdk_error');
         setStatusMessage("User not authenticated. Please log in.");
      } else if (!isLoadingAuthContext && isAuthenticated && !user) {
        setCurrentStatus('sdk_error');
        setStatusMessage("User data not available.");
      } else if (!isLoadingAuthContext && isAuthenticated && user && !game && gameKey && currentStatus !== 'sdk_error') {
        setStatusMessage("Loading game details...");
      }
      return;
    }

    if (!game) {
        if (currentStatus !== 'sdk_error') { // Avoid overwriting more specific errors
            setStatusMessage(`Game with key "${gameKey}" could not be found or loaded.`);
            setCurrentStatus('sdk_error');
        }
        return;
    }

    const attemptCognifitRegistrationAndLoad = async () => {
      let currentCognifitUserToken = user?.cognifitUserToken;

      if (!currentCognifitUserToken) {
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

          const newCognifitToken = data.userToken;
          if (!newCognifitToken) {
            console.error("On-demand Cognitive Gym registration failed: No user token received.");
            setStatusMessage(`Registration with Cognitive Gym failed: No user token received. Please try again or contact support.`);
            setCurrentStatus('registration_error');
            toast({ title: "Cognitive Gym Registration Failed", description: "No user token was received after registration. Please contact support.", variant: "destructive", duration: 10000 });
            return;
          }

          updateCognifitUserToken(newCognifitToken);
          currentCognifitUserToken = newCognifitToken;
          toast({ title: "Cognitive Gym Account Ready!", description: "Fetching session token..."});

        } catch (regError: any) {
          console.error("Error during on-demand Cognitive Gym registration process:", regError);
          setStatusMessage(`An unexpected error occurred during Cognitive Gym registration: ${regError.message || String(regError)}. Please try again.`);
          setCurrentStatus('registration_error');
          toast({ title: "Cognitive Gym Connection Error", description: "Could not connect to our registration service. Please check your internet connection and try again.", variant: "destructive", duration: 10000 });
          return;
        }
      }

      if (currentCognifitUserToken) {
        setCurrentStatus('fetching_access_token');
        setStatusMessage("Preparing your Cognitive Gym session...");
        
        try {
            const accessTokenResponse = await fetch('/api/cognifit/issue-access-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userToken: currentCognifitUserToken }),
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
      }
    };

    if (game && !sdkInitializedRef.current && ['idle', 'sdk_error', 'registration_error', 'access_token_error'].includes(currentStatus)) {
      attemptCognifitRegistrationAndLoad();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      gameKey, 
      user, 
      isAuthenticated,
      isLoadingAuthContext,
      game, 
      currentStatus, 
      initializeAndLoadGame, // Added initializeAndLoadGame here
      updateCognifitUserToken, 
      toast
    ]);


  useEffect(() => {
    const handleCognifitMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { status, mode, key } = event.data;
        console.log("Message from Cognitive Gym iframe:", event.data);

        if (game && key && typeof key === 'string' &&
            mode && typeof mode === 'string' &&
            status && typeof status === 'string') {

          if (key.toUpperCase() === game.id.toUpperCase()) {
            if (status === 'completed' || status === 'session_finished') {
              toast({ title: "Game Completed!", description: `${game.title} session finished.` });
              setStatusMessage(`Game session for ${game.title} completed successfully!`);
              setCurrentStatus('game_ended');
            } else if (status === 'aborted' || status === 'session_cancelled') {
              toast({ title: "Game Aborted", description: `${game.title} session was exited.`, variant: "destructive" });
              setStatusMessage(`Game session for ${game.title} was aborted.`);
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
  const showGameArea = currentStatus === 'game_loaded' && game !== null && sdkInitializedRef.current;


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
                  {(showLoadingIndicator && !showErrorState && !showGameEndedMessage) && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  <p className="font-semibold">Session Status</p>
                </div>
                <p>{statusMessage}</p>
              </div>
            )}

            {showLoadingIndicator && !statusMessage && ( 
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground mb-2">Processing...</p>
              </div>
            )}
            
            <div id={COGNITFIT_CONTENT_ID} className={!showGameArea ? 'hidden' : ''}>
              {/* Cognitive Gym content will be injected here by the SDK */}
            </div>

            {currentStatus === 'game_loaded' && sdkInitializedRef.current && game &&
             typeof document !== 'undefined' &&
             document.getElementById(COGNITFIT_CONTENT_ID) &&
             !document.getElementById(COGNITFIT_CONTENT_ID)!.hasChildNodes() && (
                 <div className="text-center py-4 text-muted-foreground">
                    <p>Cognitive Gym SDK initialized for {game.title}. If the game does not appear, it might indicate an issue with this specific game key (`{game.id.toUpperCase()}`) or the Cognitive Gym platform might not have loaded the content into the provided area. Please check the browser console for any SDK-specific errors.</p>
                </div>
            )}

            {!isAuthenticated && !isLoadingAuthContext && (
                 <div className="text-center py-4">
                    <p className="text-muted-foreground">Please log in to play Cognitive Gym games.</p>
                </div>
            )}
             {isAuthenticated && !game && gameKey && currentStatus === 'sdk_error' && ( 
                <div className="text-center py-4 text-muted-foreground">
                    <p>Game with key "{gameKey}" could not be found or loaded.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    