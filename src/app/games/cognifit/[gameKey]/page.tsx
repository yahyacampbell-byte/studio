
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Brain, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CognifitSdk, CognifitSdkConfigOptions, CognifitSdkConfig } from '@cognifit/launcher-js-sdk';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { registerCognifitUser } from '@/services/cognifitService';

const COGNIFIT_CONTENT_ID = 'cogniFitContent';

export default function CognifitGamePage() {
  useRequireAuth(); 
  const { user, isAuthenticated, isLoadingAuth: isLoadingAuthContext, updateCognifitUserToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameKey = params.gameKey as string;
  const { toast } = useToast();

  const [isLoadingSdk, setIsLoadingSdk] = useState(true);
  const [isRegisteringCognifit, setIsRegisteringCognifit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sdkInitializedRef = useRef(false);
  const cognifitSdkRef = useRef<CognifitSdk | null>(null);

  const cognifitClientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;

  const initializeAndLoadGame = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      setError("CogniFit User Token not available after registration attempt.");
      setIsLoadingSdk(false);
      setIsRegisteringCognifit(false);
      return;
    }
    
    if (!cognifitClientId) {
      setError("CogniFit Client ID is not configured.");
      setIsLoadingSdk(false);
      setIsRegisteringCognifit(false);
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
      COGNIFIT_CONTENT_ID,
      cognifitClientId!,
      currentToken,
      sdkOptions
    );
    
    if (!cognifitSdkRef.current) {
      cognifitSdkRef.current = new CognifitSdk();
    }
    const sdk = cognifitSdkRef.current;

    console.log(`Initializing CogniFit SDK for gameKey: ${gameKey} with token: ${currentToken}`);
    setIsLoadingSdk(true);
    setError(null);

    try {
      await sdk.init(cognifitSdkConfig);
      console.log('CogniFit SDK initialized successfully for game:', gameKey);
      // NOTE: The SDK's init might load the game if the activityKey is part of the URL or environment context.
      // If not, an explicit sdk.loadActivity('gameMode', gameKey.toUpperCase()) might be needed here.
      // For now, assume init handles it or the SDK is designed for an environment where gameKey is implicit.
      sdkInitializedRef.current = true;
    } catch (sdkError: any) {
      console.error('CogniFit SDK initialization failed:', sdkError);
      setError(`Failed to initialize CogniFit game. ${sdkError.message || String(sdkError)}`);
    } finally {
      setIsLoadingSdk(false);
      setIsRegisteringCognifit(false);
    }
  }, [gameKey, cognifitClientId]);


  useEffect(() => {
    if (isLoadingAuthContext || !isAuthenticated || !gameKey || sdkInitializedRef.current) {
      if (!isLoadingAuthContext && !isAuthenticated) setIsLoadingSdk(false);
      return;
    }

    const attemptCognifitRegistrationAndLoad = async () => {
      if (!user) {
        setError("User data not available for CogniFit registration.");
        setIsLoadingSdk(false);
        return;
      }

      if (user.cognifitUserToken) {
        initializeAndLoadGame(user.cognifitUserToken);
      } else {
        // CogniFit token doesn't exist, attempt to register
        if (!user.id || !user.firstName || !user.lastName || !user.birthDate || !user.sex) {
          setError("Incomplete user profile for CogniFit registration. Please update your profile.");
          setIsLoadingSdk(false);
          toast({
            title: "Profile Incomplete",
            description: "Your profile is missing details required for CogniFit. Please complete your registration information.",
            variant: "destructive",
            duration: 7000,
          });
          // Potentially redirect to a profile completion page or show a more prominent UI message.
          // For now, just setting error.
          return;
        }
        
        setIsRegisteringCognifit(true);
        setError(null); // Clear previous errors
        try {
          toast({ title: "Connecting to CogniFit", description: "One moment while we set up your CogniFit account..."});
          const newCognifitToken = await registerCognifitUser({
            appUserId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate, // Assumes YYYY-MM-DD format
            sex: user.sex === '1' ? 1 : 2,
            locale: 'en', 
          });
          
          updateCognifitUserToken(newCognifitToken); // Update AuthContext
          toast({ title: "CogniFit Account Ready!", description: "Loading your game..."});
          initializeAndLoadGame(newCognifitToken);

        } catch (regError: any) {
          console.error("On-demand CogniFit registration failed:", regError);
          setError(`Failed to register with CogniFit: ${regError.message || String(regError)} Please try again or contact support.`);
          toast({
            title: "CogniFit Registration Failed",
            description: regError.message || "Could not connect to CogniFit services.",
            variant: "destructive",
          });
          setIsLoadingSdk(false);
          setIsRegisteringCognifit(false);
        }
      }
    };

    if (isAuthenticated && user) {
      attemptCognifitRegistrationAndLoad();
    } else if (!isLoadingAuthContext && !isAuthenticated) {
        // Should be handled by useRequireAuth, but as a safeguard:
        setError("User not authenticated.");
        setIsLoadingSdk(false);
    }
    

    return () => {
      if (sdkInitializedRef.current && cognifitSdkRef.current) {
        // cognifitSdkRef.current.destroy(); // Or similar cleanup method if available
        console.log('CogniFit game page unmounted, SDK instance might need cleanup.');
        // sdkInitializedRef.current = false; // Reset if SDK is fully cleaned up
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      gameKey, 
      cognifitClientId, 
      user, // User object from AuthContext
      isAuthenticated, 
      isLoadingAuthContext, 
      updateCognifitUserToken, 
      initializeAndLoadGame,
      toast
    ]);


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
              </div>
            )}
            {(isLoadingSdk || isRegisteringCognifit) && !error && isAuthenticated && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                {isRegisteringCognifit && <p className="text-muted-foreground mb-2">Registering with CogniFit...</p>}
                {isLoadingSdk && !isRegisteringCognifit && <p className="text-muted-foreground mb-2">Loading CogniFit game ({gameKey})...</p>}
                <p className="text-sm text-muted-foreground mt-1">Initializing SDK...</p>
              </div>
            )}
            <div id={COGNIFIT_CONTENT_ID} className={isLoadingSdk || isRegisteringCognifit || error || !isAuthenticated ? 'hidden' : ''}>
              {/* CogniFit content will be injected here by the SDK */}
            </div>
             {!isLoadingSdk && !isRegisteringCognifit && !error && !sdkInitializedRef.current && cognifitClientId && isAuthenticated && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">SDK process initiated. If the game does not appear, check console for errors from CogniFit SDK. Ensure game key '{gameKey}' is correct and your CogniFit account is configured for this game.</p>
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
