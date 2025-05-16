
"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';
import { GameCard } from '@/components/games/GameCard';
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Input } from '@/components/ui/input';
import { Search, Brain } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function GamesPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const [selectedGame, setSelectedGame] = useState<CognitiveGame | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePlayGame = (game: CognitiveGame) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const filteredGames = COGNITIVE_GAMES.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading games...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Games</h1>
          <p className="text-muted-foreground">
            Challenge your mind and discover your strengths. Select a game to begin.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games..."
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No games found matching your search.</p>
        )}
      </div>
      <SimulateGameModal game={selectedGame} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
}
