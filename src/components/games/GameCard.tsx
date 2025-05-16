
"use client";

import type { CognitiveGame } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface GameCardProps {
  game: CognitiveGame;
  onPlay: (game: CognitiveGame) => void;
  hasBeenPlayed?: boolean;
}

export function GameCard({ game, onPlay, hasBeenPlayed }: GameCardProps) {
  const GameIcon = game.icon;
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-4 pt-4"> {/* Adjusted padding for balance */}
        <div className="flex items-center gap-3 mb-2">
          {GameIcon && <GameIcon className="h-8 w-8 text-primary" />}
          <CardTitle className="text-xl flex items-center">
            {game.title}
            {hasBeenPlayed && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />}
          </CardTitle>
        </div>
        <CardDescription className="h-12 text-sm line-clamp-2">{game.description}</CardDescription>
      </CardHeader>
      {/* CardContent formerly here, removed as it only contained the image */}
      <CardFooter className="p-4 mt-auto"> {/* Added mt-auto to push footer down */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
            <Button onClick={() => onPlay(game)} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
              {hasBeenPlayed ? "Play Again" : "Play Now"}
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                <Link href={`/games/${game.id}`}>Details</Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
