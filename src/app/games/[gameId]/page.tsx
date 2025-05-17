
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlayCircle, Brain as BrainIcon } from 'lucide-react';
// Image component is no longer needed here
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function GameDetailsPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<CognitiveGame | null | undefined>(undefined); // undefined for loading state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) { // Only load game details if authenticated
      const foundGame = COGNITIVE_GAMES.find(g => g.id === gameId);
      setGame(foundGame || null); // null if not found after "loading"
    }
  }, [gameId, isAuthenticated]);

  const handlePlayGame = () => {
    if (game) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  if (isLoadingAuth || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <BrainIcon className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading game details...</p>
        </div>
      </AppLayout>
    );
  }

  if (game === undefined && isAuthenticated) { // Show skeleton only if authenticated and game data is loading
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Button>
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-32 mt-4" /> {/* Adjusted skeleton */}
        </div>
      </AppLayout>
    );
  }

  if (!game && isAuthenticated) { // Show not found only if authenticated and game is truly not found
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold mb-4">Game not found</h1>
          <Button onClick={() => router.push('/games')}>Browse Games</Button>
        </div>
      </AppLayout>
    );
  }
  
  if (!game) return null; // Should be covered by above, or if not authenticated yet

  const GameIcon = game.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
        </Button>
        
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="bg-muted/30 p-6">
            <div className="flex items-center gap-4">
              {GameIcon && <GameIcon className="h-12 w-12 text-primary" />}
              <div>
                <CardTitle className="text-3xl font-bold">{game.title}</CardTitle>
                <CardDescription className="text-lg">{game.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Placeholder image removed */}
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h3 className="font-semibold">About this game:</h3>
              <p>
                This game is designed to stimulate specific cognitive functions. 
                Engaging with {game.title} regularly can help in strengthening these mental faculties.
              </p>
              <p className="text-sm text-muted-foreground">
                Intelligence Focus: {game.assessesIntelligences.join(', ')}
              </p>
              {game.dataAiHint && (
                <p className="text-xs text-muted-foreground italic">
                  AI Hint: {game.dataAiHint}
                </p>
              )}
              {/* Add more detailed game description or rules here if available */}
            </div>

            <Button size="lg" onClick={handlePlayGame} className="w-full sm:w-auto">
              <PlayCircle className="mr-2 h-5 w-5" /> Simulate Playing {game.title}
            </Button>
          </CardContent>
        </Card>
        
      </div>
      <SimulateGameModal game={game} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
}
