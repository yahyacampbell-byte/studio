"use client";

import type { CognitiveGame } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  game: CognitiveGame;
  onPlay: (game: CognitiveGame) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const GameIcon = game.icon;
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          {GameIcon && <GameIcon className="h-8 w-8 text-primary" />}
          <CardTitle className="text-xl">{game.title}</CardTitle>
        </div>
        <CardDescription className="h-12 text-sm line-clamp-2">{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Image
          src={`https://placehold.co/400x200.png`}
          alt={game.title}
          data-ai-hint={game.dataAiHint || 'abstract game'}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
            <Button onClick={() => onPlay(game)} className="w-full sm:w-auto flex-grow sm:flex-grow-0">Play Now</Button>
            <Button variant="outline" asChild className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                <Link href={`/games/${game.id}`}>Details</Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
