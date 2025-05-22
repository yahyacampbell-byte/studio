
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain, CheckCircle2 } from 'lucide-react';
import { useToast, type ToastFunction } from '@/hooks/use-toast'; // Ensured ToastFunction is available if needed by type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CognifitSdk } from '@cognifit/launcher-js-sdk';
import { CognifitSdkConfig } from '@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config';
import type { User } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { COGNITIVE_GAMES, CognitiveGame, APP_NAME } from '@/lib/constants';

const COGNITFIT_CONTENT_ID = 'cognitiveGymContent';

export default function CognifitGamePage() {
  useRequireAuth(); // Handles initial auth loading and redirection
  const { user, isAuthenticated, isLoadingAuth: isLoadingAuthContext, updateCognifitUserToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKeyParam = params.gameKey as string;

  if (typeof window !== 'undefined') {
    console.log(
        "[CognifitGamePage Module Scope] Value of NEXT_PUBLIC_COGNITFIT_CLIENT_ID during build/initialization:",
        process.env.NEXT_PUBLIC_COGNITFIT_CLIENT_ID
      );
  }

  const [game, setGame] = useState<CognitiveGame | null>(null);
  const [currentStatus, setCurrentStatus] = useState< 'idle' | 'registering' | 'fetching_access_token' | 'initializing_sdk' | 'launching_game' | 'game_loaded' | 'game_ended' | 'sdk_error' | 'registration_error' | 'access_token_error' | 'game_launch_error' >('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const sdkRef = useRef<CognifitSdk | null>(null);
  const sdkInitializedRef = useRef(false);
  const gameLaunchedRef = useRef(false);

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNITFIT_CLIENT_ID;

  let toastRef: ToastFunction = (props) => {
    console.warn("Toast called before initialization:", props);
    return {
      id: 'dummy-toast',
      dismiss: () => console.warn("Dummy toast dismiss called"),
      update: (updateProps) => console.warn("Dummy toast update called", updateProps)
    };
  };
  try {
    const toastHookResult = useToast();
    if (toastHookResult && typeof toastHookResult.toast === 'function') {
      toastRef = toastHookResult.toast;
    }
  } catch (e) {
    console.error("[CognitiveGymGamePage] Error calling useToast():", e);
  }
  const toast = toastRef;


  useEffect(() => {
    if (gameKeyParam && !game) {
      const foundGame = COGNITIVE_GAMES.find(g => g.id.toUpperCase() === gameKeyParam.toUpperCase());
      setGame(foundGame || null);
      if (!foundGame && currentStatus === 'idle') {
        setStatusMessage(`Game with key "${gameKeyParam}" not found in our library.`);
        setCurrentStatus('sdk_error'); // Using sdk_error for game not found
      }
    }
  }, [gameKeyParam, game, currentStatus]);


  const initializeAndLoadGame = useCallback(async (accessToken: string | null) => {
    if (!game) {
      setStatusMessage("Game details could not be loaded. Cannot initialize Cognitive Gym session.");
      setCurrentStatus('sdk_error');
      return;
    }
    if (sdkInitializedRef.current && gameLaunchedRef.current) {
      console.log("Cognitive Gym SDK already initialized and game launched for:", game.title);
      return;
    }

    if (!accessToken) {
      setStatusMessage("Cognitive Gym Access Token not available for SDK initialization.");
      setCurrentStatus('access_token_error');
      return;
    }
    if (!cognifitClientId) {
      setStatusMessage(`Cognitive Gym Client ID is missing. For local development, ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is in .env and restart the server. For deployed environments, verify it in your hosting provider's settings (e.g., apphosting.yaml or Firebase Console).`);
      setCurrentStatus('sdk_error');
      toast({ title: "Configuration Error", description: "Cognitive Gym Client ID is missing. Please ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is in your environment variables and restart your development server if you recently changed them.", variant: "destructive" });
      return;
    }

    const activityKey = game.id.toUpperCase();
    console.log(`[CognifitGamePage] Preparing to initialize Cognitive Gym SDK for gameKey: ${activityKey} (Title: ${game.title}) using client ID: ${cognifitClientId}`);

    if (!sdkRef.current) {
      sdkRef.current = new CognifitSdk();
    }
    const currentSdkInstance = sdkRef.current;


    if (!sdkInitializedRef.current) {
      console.log(`[CognifitGamePage] Initializing Cognitive Gym SDK for gameKey: ${activityKey} with access token.`);
      setCurrentStatus('initializing_sdk');
      setStatusMessage(`Initializing Cognitive Gym for ${game.title}...`);

      const sdkOptions: ConstructorParameters<typeof CognifitSdkConfig>[3] = {
        sandbox: process.env.NODE_ENV !== 'production',
        appType: 'web',
        theme: 'light',
        showResults: false,
        isFullscreenEnabled: true,
        listenEvents: true,
        scale: 100,
        customCss: '',
        screensNotToShow: [],
        preferredMobileOrientation: '',
      };

      const cognifitConfig = new CognifitSdkConfig(
        COGNITFIT_CONTENT_ID,
        cognifitClientId,
        accessToken,
        sdkOptions
      );
      console.log('*** JSDK *** CognifitSdkConfig.constructor', cognifitConfig);

      try {
        await currentSdkInstance.init(cognifitConfig);
        console.log('[CognifitGamePage] Cognitive Gym SDK initialized successfully for game:', game.title);
        sdkInitializedRef.current = true;
      } catch (sdkError: any) {
        console.error('[CognifitGamePage] Cognitive Gym SDK initialization failed:', sdkError);
        const errorMessage = currentSdkInstance.cognifitSdkError?.getMessage() || sdkError?.message || 'Unknown SDK initialization error.';
        setStatusMessage(`Failed to initialize Cognitive Gym: ${errorMessage}`);
        setCurrentStatus('sdk_error');
        sdkInitializedRef.current = false;
        toast({ title: "SDK Initialization Failed", description: errorMessage, variant: "destructive" });
        return;
      }
    }

    if (sdkInitializedRef.current && !gameLaunchedRef.current && currentSdkInstance) {
      setCurrentStatus('launching_game');
      setStatusMessage(`Launching ${game.title}...`);
      console.log(`[CognifitGamePage] Attempting to start Cognitive Gym session for game: ${activityKey}`);

      try {
        gameLaunchedRef.current = true;
        currentSdkInstance.start("GAME", activityKey).subscribe({
          next: (cognifitSdkResponse) => {
            console.log("[CognifitGamePage] Cognitive Gym SDK event:", cognifitSdkResponse);
            if (cognifitSdkResponse.isSessionCompleted()) {
              toast({ title: "Game Completed!", description: `${game?.title || 'Session'} finished.` });
              setStatusMessage(`Game session for ${game?.title || 'session'} completed successfully!`);
              setCurrentStatus('game_ended');
              sdkInitializedRef.current = false;
              gameLaunchedRef.current = false;
            } else if (cognifitSdkResponse.isSessionAborted()) {
              toast({ title: "Game Aborted", description: `${game?.title || 'Session'} was exited.`, variant: "destructive" });
              setStatusMessage(`Game session for ${game?.title || 'session'} was aborted.`);
              setCurrentStatus('game_ended');
              sdkInitializedRef.current = false;
              gameLaunchedRef.current = false;
            } else if (cognifitSdkResponse.isErrorLogin()) {
              const errorMsg = sdkRef.current?.cognifitSdkError?.getMessage() || "Unknown login error during session.";
              setStatusMessage(`Cognitive Gym login error during session: ${errorMsg}`);
              setCurrentStatus('sdk_error');
              sdkInitializedRef.current = false;
              gameLaunchedRef.current = false;
              toast({ title: "Login Error", description: errorMsg, variant: "destructive" });
            } else if (cognifitSdkResponse.isEvent()) {
              const eventPayloadValues = cognifitSdkResponse.eventPayload?.getValues();
              console.log("[CognifitGamePage] Cognitive Gym session event payload:", eventPayloadValues);
              if (eventPayloadValues?.status === 'loaded' || eventPayloadValues?.action === 'loaded') {
                   setCurrentStatus('game_loaded');
                   setStatusMessage(`${game?.title || 'Game'} is loaded. Enjoy your session!`);
              }
            }
          },
          complete: () => {
            console.log(`[CognifitGamePage] Cognitive Gym session flow for ${game?.title || 'session'} completed.`);
            if (currentStatus !== 'game_ended' && currentStatus !== 'sdk_error' && currentStatus !== 'game_launch_error') {
                 setCurrentStatus('game_ended'); 
                 setStatusMessage(`Cognitive Gym session flow for ${game?.title || 'session'} is complete.`);
                 sdkInitializedRef.current = false; 
                 gameLaunchedRef.current = false;
            }
          },
          error: (reason) => {
            console.error(`[CognifitGamePage] Error during Cognitive Gym session for ${game?.title || 'session'}:`, reason);
            let errorMessage = sdkRef.current?.cognifitSdkError?.getMessage();
            if (!errorMessage || reason === "Check cognifitSdkError") {
                // If getMessage() is null/undefined, or reason explicitly says to check, try getError() if it exists, or use the reason itself.
                // Note: cognifitSdkError.getError() might not exist or might be different from getMessage().
                // For now, we'll prioritize getMessage() and fall back to the reason string.
                 errorMessage = typeof reason === 'string' ? reason : 'Unknown session error.';
                 if (sdkRef.current?.cognifitSdkError?.getMessage()) {
                    errorMessage = sdkRef.current.cognifitSdkError.getMessage();
                 }
            }
            setStatusMessage(`An error occurred during the ${game?.title || 'session'} session: ${errorMessage}`);
            setCurrentStatus('game_launch_error');
            sdkInitializedRef.current = false;
            gameLaunchedRef.current = false;
            toast({ title: "Game Session Error", description: errorMessage, variant: "destructive" });
          }
        });
      } catch (startError: any) {
          console.error(`[CognifitGamePage] Critical error calling Cognitive Gym SDK start for ${game?.title || 'game'}:`, startError);
          const errorMessage = startError?.message || (typeof startError === 'string' ? startError : 'Failed to start game session.');
          setStatusMessage(`Failed to start the ${game?.title || 'game'} session: ${errorMessage}`);
          setCurrentStatus('game_launch_error');
          sdkInitializedRef.current = false;
          gameLaunchedRef.current = false;
          toast({ title: "Game Launch Failed", description: errorMessage, variant: "destructive" });
      }
    }
  }, [cognifitClientId, game, toast, currentStatus]); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
        console.log(
            "[CognifitGamePage Main Effect] Value of NEXT_PUBLIC_COGNITFIT_CLIENT_ID:",
            process.env.NEXT_PUBLIC_COGNITFIT_CLIENT_ID
          );
    }
    if (isLoadingAuthContext) {
       setCurrentStatus('idle');
       setStatusMessage("Authenticating user...");
      return;
    }
    if (!isAuthenticated) {
      setStatusMessage("User not authenticated. Please log in.");
      setCurrentStatus('sdk_error'); 
      return;
    }
    if (!user) {
      setStatusMessage("User data not available.");
      setCurrentStatus('sdk_error');
      return;
    }
    if (!gameKeyParam) {
        setStatusMessage("No game key provided in URL.");
        setCurrentStatus('sdk_error');
        return;
    }
    if (!game && currentStatus !== 'sdk_error' && currentStatus !== 'idle') { 
        return; 
    }
     if (!game && currentStatus === 'idle') { 
        return;
    }


    const attemptCognifitRegistrationAndLoad = async () => {
      if (!user) return; 
      if (!game) {
        setStatusMessage("Game details not found. Cannot proceed.");
        setCurrentStatus("sdk_error");
        return;
      }

      let currentCognifitUserToken = user?.cognifitUserToken;

      if (!currentCognifitUserToken) {
        if (!user.id || !user.firstName || !user.lastName || !user.birthDate || (user.sex !== '0' && user.sex !== '1')) {
          const missingFields = [
            !user.id && "User ID", !user.firstName && "First Name", !user.lastName && "Last Name",
            !user.birthDate && "Birth Date", (user.sex !== '0' && user.sex !== '1') && "Gender"
          ].filter(Boolean).join(', ');

          setStatusMessage(`Your profile is missing details (${missingFields}) required for Cognitive Gym. Please complete your ${APP_NAME} profile information.`);
          setCurrentStatus('registration_error');
          toast({ title: "Profile Incomplete", description: `Your profile requires more details for Cognitive Gym: ${missingFields}. Please update your profile.`, variant: "destructive", duration: 10000 });
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
              appUserId: user.id, firstName: user.firstName, lastName: user.lastName,
              birthDate: user.birthDate, sex: user.sex, locale: 'en', 
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
            toast({ title: "Cognitive Gym Registration Failed", description: "No user token was received after registration.", variant: "destructive", duration: 10000 });
            return;
          }
          await updateCognifitUserToken(newCognifitToken); 
          currentCognifitUserToken = newCognifitToken;
          toast({ title: "Cognitive Gym Account Ready!", description: "Fetching session token..."});
        } catch (regError: any) {
          console.error("Error during on-demand Cognitive Gym registration process:", regError);
          setStatusMessage(`An unexpected error occurred during Cognitive Gym registration: ${regError.message || String(regError)}. Please try again.`);
          setCurrentStatus('registration_error');
          toast({ title: "Cognitive Gym Connection Error", description: "Could not connect to our registration service.", variant: "destructive", duration: 10000 });
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
            setStatusMessage("Could not start Cognitive Gym session: No session token received.");
            setCurrentStatus('access_token_error');
            toast({ title: "Session Start Failed", description: "No session token received from server.", variant: "destructive", duration: 10000 });
            return;
          }
           if (!sdkInitializedRef.current || !gameLaunchedRef.current || currentStatus === 'game_ended') {
             if (currentStatus === 'game_ended') { 
                sdkInitializedRef.current = false;
                gameLaunchedRef.current = false;
            }
            initializeAndLoadGame(newAccessToken);
          }
        } catch (tokenError: any) {
          console.error("Error fetching access token:", tokenError);
          setStatusMessage(`An error occurred while preparing your session: ${tokenError.message || String(tokenError)}. Please try again.`);
          setCurrentStatus('access_token_error');
          toast({ title: "Session Connection Error", description: "Could not connect for session token.", variant: "destructive", duration: 10000 });
        }
      }
    };

    if (!cognifitClientId) {
      setStatusMessage(`Cognitive Gym Client ID is missing. For local development, ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is in .env and restart the server. For deployed environments, verify it in your hosting provider's settings (e.g., apphosting.yaml or Firebase Console).`);
      setCurrentStatus('sdk_error');
      toast({ title: "Configuration Error", description: "Cognitive Gym Client ID is missing. Please ensure NEXT_PUBLIC_COGNITFIT_CLIENT_ID is in your environment variables and restart your development server if you recently changed them.", variant: "destructive" });
      return;
    }

    if (game && user && cognifitClientId && (!sdkInitializedRef.current || !gameLaunchedRef.current || currentStatus === 'game_ended') ) {
      attemptCognifitRegistrationAndLoad();
    }

  }, [
      gameKeyParam, user, isAuthenticated, isLoadingAuthContext, game,
      updateCognifitUserToken, toast, cognifitClientId,
      initializeAndLoadGame, currentStatus, router 
    ]);


  if (isLoadingAuthContext && !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Authenticating...</p>
        </div>
      </AppLayout>
    );
  }

  const showLoadingIndicator = ['registering', 'fetching_access_token', 'initializing_sdk', 'launching_game'].includes(currentStatus);
  const showErrorState = ['sdk_error', 'registration_error', 'access_token_error', 'game_launch_error'].includes(currentStatus);
  const showGameEndedMessage = currentStatus === 'game_ended';
  const showGameArea = (currentStatus === 'game_loaded' || currentStatus === 'launching_game' || currentStatus === 'initializing_sdk') && game !== null && sdkInitializedRef.current;


  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Cognitive Gym Game: {game?.title || gameKeyParam}</CardTitle>
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

            {showLoadingIndicator && !statusMessage && !showErrorState && ( 
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground mb-2">Processing...</p>
                 <p className="text-sm text-muted-foreground">Current stage: {currentStatus}</p>
              </div>
            )}

            <div id={COGNITFIT_CONTENT_ID} className={!showGameArea ? 'hidden' : ''}>
            </div>

            {currentStatus === 'game_loaded' && sdkInitializedRef.current && game &&
             typeof document !== 'undefined' &&
             document.getElementById(COGNITFIT_CONTENT_ID) &&
             !document.getElementById(COGNITFIT_CONTENT_ID)!.hasChildNodes() && ( 
                 <div className="text-center py-4 text-muted-foreground">
                    <p>Cognitive Gym SDK initialized for {game.title}. If the game does not appear, it might indicate an issue with this specific game key (`{game.id.toUpperCase()}`) or the Cognitive Gym platform. This could also be due to environmental network issues or the SDK may require an explicit command to load/start the specific game after initialization.</p>
                </div>
            )}

            {!isAuthenticated && !isLoadingAuthContext && ( 
                 <div className="text-center py-4">
                    <p className="text-muted-foreground">Please log in to play Cognitive Gym games.</p>
                </div>
            )}
             {isAuthenticated && !game && gameKeyParam && currentStatus === 'sdk_error' && ( 
                <div className="text-center py-4 text-muted-foreground">
                    <p>Game with key "{gameKeyParam}" could not be found or loaded.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
