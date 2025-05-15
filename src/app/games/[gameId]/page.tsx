"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function GameDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<CognitiveGame | null | undefined>(undefined); // undefined for loading state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const foundGame = COGNITIVE_GAMES.find(g => g.id === gameId);
    setGame(foundGame || null); // null if not found after "loading"
  }, [gameId]);

  const handlePlayGame = () => {
    if (game) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (game === undefined) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Button>
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </AppLayout>
    );
  }

  if (!game) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold mb-4">Game not found</h1>
          <Button onClick={() => router.push('/games')}>Browse Games</Button>
        </div>
      </AppLayout>
    );
  }

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
            <Image
              src={`https://placehold.co/800x400.png`}
              alt={game.title}
              data-ai-hint={game.dataAiHint || 'gameplay concept'}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h3 className="font-semibold">About this game:</h3>
              <p>
                This game is designed to stimulate specific cognitive functions related to {game.description.toLowerCase().replace('boost your ', '').replace('enhance ', '').replace('improve ', '').replace('test ', '').replace('sharpen ', '').replace('expand your ', '').replace('challenge your ', '').replace('train ', '').replace('develop ', '').replace('.', '')}. 
                Engaging with {game.title} regularly can help in strengthening these mental faculties.
              </p>
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
