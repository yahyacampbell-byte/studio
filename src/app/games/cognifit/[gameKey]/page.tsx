
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Attempting top-level import for SDK v2.x+
import { cognifitSdk, CognifitSdkConfig } from '@cognifit/launcher-js-sdk';
// If the above fails, revert to:
// import { cognifitSdk } from '@cognifit/launcher-js-sdk';
// import { CognifitSdkConfig } from '@cognifit/launcher-js-sdk/lib/lib/cognifit.sdk.config';
import type { User } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';

const COGNITFIT_CONTENT_ID = 'cognitiveGymContent';

export default function CognifitGamePage() {
  useRequireAuth();
  const { user, isAuthenticated, isLoadingAuth: isLoadingAuthContext, updateCognifitUserToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKeyParam = params.gameKey as string;

  const [game, setGame] = useState<CognitiveGame | null>(null);
  const [currentStatus, setCurrentStatus] = useState< 'idle' | 'registering' | 'fetching_access_token' | 'initializing_sdk' | 'launching_game' | 'game_loaded' | 'game_ended' | 'sdk_error' | 'registration_error' | 'access_token_error' | 'game_launch_error' >('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const gameLaunchedRef = useRef(false);

  let toastRef: ReturnType<typeof useToast>['toast'] = () => { console.warn("Toast called before initialization"); };
  try {
    const toastHookResult = useToast();
    if (toastHookResult && typeof toastHookResult.toast === 'function') {
      toastRef = toastHookResult.toast;
    }
  } catch (e) {
    console.error("[CognitiveGymGamePage] Error calling useToast():", e);
  }
  const toast = toastRef;

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNITFIT_CLIENT_ID;

  useEffect(() => {
    if (gameKeyParam) {
      const foundGame = COGNITIVE_GAMES.find(g => g.id.toUpperCase() === gameKeyParam.toUpperCase());
      setGame(foundGame || null);
      if (!foundGame && currentStatus === 'idle') {
        setStatusMessage(`Game with key "${gameKeyParam}" not found in our library.`);
        setCurrentStatus('sdk_error');
      }
    }
  }, [gameKeyParam, currentStatus]);

  const initializeAndLaunchGame = useCallback(async (accessToken: string | null) => {
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
      setStatusMessage("Cognitive Gym Client ID is not configured. Please check environment variables.");
      setCurrentStatus('sdk_error');
      return;
    }

    const activityKey = game.id.toUpperCase();

    if (!sdkInitializedRef.current) {
      console.log(`Initializing Cognitive Gym SDK for gameKey: ${activityKey} with access token.`);
      setCurrentStatus('initializing_sdk');
      setStatusMessage(`Initializing Cognitive Gym for ${game.title}...`);

      const sdkOptions: ConstructorParameters<typeof CognifitSdkConfig>[3] = {
        sandbox: false,
        appType: 'web',
        theme: 'light',
        showResults: false,
        isFullscreenEnabled: true,
        listenEvents: true, // Important for the new .start().subscribe()
        // scale: 100, // Default is 800, 100 might be too small unless intended
      };

      const cognifitConfig = new CognifitSdkConfig(
        COGNITFIT_CONTENT_ID,
        cognifitClientId,
        accessToken,
        sdkOptions
      );

      try {
        await cognifitSdk.init(cognifitConfig);
        console.log('Cognitive Gym SDK initialized successfully for game:', game.title);
        sdkInitializedRef.current = true;
        // Proceed to launch game
      } catch (sdkError: any) {
        console.error('Cognitive Gym SDK initialization failed:', sdkError);
        // Try to get more specific error from SDK if available
        const errorMessage = cognifitSdk.cognifitSdkError?.getMessage() || sdkError.message || String(sdkError);
        setStatusMessage(`Failed to initialize Cognitive Gym. ${errorMessage}`);
        setCurrentStatus('sdk_error');
        sdkInitializedRef.current = false;
        return; // Stop if init fails
      }
    }

    // Launch the game session if SDK is initialized and game not yet launched
    if (sdkInitializedRef.current && !gameLaunchedRef.current) {
      setCurrentStatus('launching_game');
      setStatusMessage(`Launching ${game.title}...`);
      console.log(`Attempting to start Cognitive Gym session for game: ${activityKey}`);

      cognifitSdk.start("GAME", activityKey).subscribe({
        next: (cognifitSdkResponse) => {
          console.log("Cognitive Gym SDK event:", cognifitSdkResponse);
          if (cognifitSdkResponse.isSessionCompleted()) {
            toast({ title: "Game Completed!", description: `${game.title} session finished.` });
            setStatusMessage(`Game session for ${game.title} completed successfully!`);
            setCurrentStatus('game_ended');
            gameLaunchedRef.current = false; // Reset for potential replay
          } else if (cognifitSdkResponse.isSessionAborted()) {
            toast({ title: "Game Aborted", description: `${game.title} session was exited.`, variant: "destructive" });
            setStatusMessage(`Game session for ${game.title} was aborted.`);
            setCurrentStatus('game_ended');
            gameLaunchedRef.current = false; // Reset for potential replay
          } else if (cognifitSdkResponse.isErrorLogin()) {
            setStatusMessage(`Cognitive Gym login error during session: ${cognifitSdkResponse.getError().message}`);
            setCurrentStatus('sdk_error'); // Or a more specific error state
            gameLaunchedRef.current = false;
          } else if (cognifitSdkResponse.isEvent()) {
            const eventPayloadValues = cognifitSdkResponse.eventPayload?.getValues();
            console.log("Cognitive Gym session event payload:", eventPayloadValues);
            // Potentially update UI based on specific events if needed
            // For now, we just log them.
            // If a 'loaded' or similar event signifies the game is visible, update status:
            if (eventPayloadValues?.status === 'loaded' || eventPayloadValues?.action === 'loaded') { // Check common event names
                 setCurrentStatus('game_loaded');
                 setStatusMessage(`${game.title} is loaded. Enjoy your session!`);
            }
          }
        },
        complete: () => {
          console.log(`Cognitive Gym session flow for ${game.title} completed.`);
          // This 'complete' usually means the observable stream finished,
          // which happens after 'isSessionCompleted' or 'isSessionAborted' typically.
          // `game_ended` status is already set by those specific handlers.
        },
        error: (reason) => {
          console.error(`Error during Cognitive Gym session for ${game.title}:`, reason);
          const errorMessage = reason.message || String(reason);
          setStatusMessage(`An error occurred during the ${game.title} session: ${errorMessage}`);
          setCurrentStatus('game_launch_error');
          gameLaunchedRef.current = false;
          toast({ title: "Game Session Error", description: errorMessage, variant: "destructive" });
        }
      });
      gameLaunchedRef.current = true; // Assume launch attempt has started
    }

  }, [cognifitClientId, game, toast]);

  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !gameKeyParam || !user || !game ) {
       if (!isLoadingAuthContext && !isAuthenticated) {
         setCurrentStatus('sdk_error'); // Or a specific 'auth_required' status
         setStatusMessage("User not authenticated. Please log in.");
      } else if (!isLoadingAuthContext && isAuthenticated && !user) {
        setCurrentStatus('sdk_error');
        setStatusMessage("User data not available.");
      } else if (gameKeyParam && !game && currentStatus !== 'sdk_error' && currentStatus !== 'idle') {
        setStatusMessage("Loading game details...");
      }
      return;
    }

    // If SDK already initialized and game launched for THIS game, do nothing further.
    // This check might be too simple if user navigates away and back to the same game page
    // without a full unmount/remount, sdkInitializedRef and gameLaunchedRef might persist.
    // However, for typical navigation, it should be fine.
    if (sdkInitializedRef.current && gameLaunchedRef.current && cognifitSdk.getCurrentActivity()?.key === game.id.toUpperCase()) {
        console.log("Game already initialized and launched:", game.title);
        setCurrentStatus('game_loaded'); // Or the last known relevant status
        return;
    }


    const attemptCognifitActions = async () => {
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
          updateCognifitUserToken(newCognifitToken);
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
          // Initialize and Launch Game
          initializeAndLaunchGame(newAccessToken);
        } catch (tokenError: any) {
          console.error("Error fetching access token:", tokenError);
          setStatusMessage(`An error occurred while preparing your session: ${tokenError.message || String(tokenError)}. Please try again.`);
          setCurrentStatus('access_token_error');
          toast({ title: "Session Connection Error", description: "Could not connect for session token.", variant: "destructive", duration: 10000 });
        }
      }
    };

    // Only attempt actions if not already in a terminal state for this game or if SDK not initialized/game not launched
    if (game && (currentStatus === 'idle' || currentStatus === 'sdk_error' || currentStatus === 'registration_error' || currentStatus === 'access_token_error' || currentStatus === 'game_launch_error' || currentStatus === 'game_ended' || !sdkInitializedRef.current || !gameLaunchedRef.current ) ) {
        // If game_ended, we might want to allow re-initialization for a new session
        if (currentStatus === 'game_ended') {
            sdkInitializedRef.current = false; // Force re-init for a new session
            gameLaunchedRef.current = false;
        }
      attemptCognifitActions();
    } else if (!game && gameKeyParam && currentStatus === 'idle') {
      setStatusMessage("Loading game details..."); // Or if game object is not yet loaded
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      gameKeyParam, user, isAuthenticated, isLoadingAuthContext, game,
      // currentStatus, // Removing currentStatus to avoid loops if it's set within this effect.
      // Instead, rely on refs (sdkInitializedRef, gameLaunchedRef) and initial check.
      initializeAndLaunchGame, updateCognifitUserToken, toast
    ]);


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

  const showLoadingIndicator = ['registering', 'fetching_access_token', 'initializing_sdk', 'launching_game'].includes(currentStatus);
  const showErrorState = ['sdk_error', 'registration_error', 'access_token_error', 'game_launch_error'].includes(currentStatus);
  const showGameEndedMessage = currentStatus === 'game_ended';
  // Game area should ideally be visible if game is 'launching_game' or 'game_loaded'
  const showGameArea = (currentStatus === 'game_loaded' || currentStatus === 'launching_game') && game !== null && sdkInitializedRef.current;


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
                    <p>Cognitive Gym SDK initialized for {game.title}. If the game does not appear, it might indicate an issue with this specific game key (`{game.id.toUpperCase()}`) or the Cognitive Gym platform might not have loaded the content into the provided area. This could also be due to environmental network issues (check browser console for 404s/503s from cognifit.com domains).</p>
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
