
"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame } from '@/lib/constants';
import { GameCard } from '@/components/games/GameCard';
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Input } from '@/components/ui/input';
import { Search, Brain, Sparkles, ListChecks } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const PROFILING_GAMES_COUNT = 8;

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

  const allGames = COGNITIVE_GAMES;
  const profilingGames = allGames.slice(0, PROFILING_GAMES_COUNT);
  const enhancementGames = allGames.slice(PROFILING_GAMES_COUNT);

  const filterGames = (games: CognitiveGame[]) => {
    if (!searchTerm) return games;
    return games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProfilingGames = filterGames(profilingGames);
  const filteredEnhancementGames = filterGames(enhancementGames);

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
            Challenge your mind. Start with Profiling Games, then move to Enhancement Games.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search all games..."
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Profiling Analysis Games</h2>
          </div>
          <p className="text-muted-foreground">
            Complete these 8 games to build your initial Multiple Intelligence profile.
          </p>
          {filteredProfilingGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfilingGames.map((game) => (
                <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No profiling games found matching your search." : "No profiling games available."}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-semibold">Profile Enhancement Games</h2>
          </div>
           <p className="text-muted-foreground">
            After completing the profiling games, try these to further refine and enhance your cognitive skills.
          </p>
          {filteredEnhancementGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEnhancementGames.map((game) => (
                <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No enhancement games found matching your search." : "No enhancement games available yet."}
            </p>
          )}
        </section>

      </div>
      <SimulateGameModal game={selectedGame} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
}


    