
"use client";

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame, PROFILING_GAMES_COUNT } from '@/lib/constants';
import { GameCard } from '@/components/games/GameCard';
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Input } from '@/components/ui/input';
import { Search, Brain, Sparkles, ListChecks } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useActivity } from '@/context/ActivityContext';

export default function GamesPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const { activities } = useActivity();
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

  const playedGameIds = useMemo(() => new Set(activities.map(act => act.gameId)), [activities]);

  const allProfilingGameModels = useMemo(() => COGNITIVE_GAMES.slice(0, PROFILING_GAMES_COUNT), []);
  const allEnhancementGameModels = useMemo(() => COGNITIVE_GAMES.slice(PROFILING_GAMES_COUNT), []);

  const isProfilingComplete = useMemo(() => {
    if (allProfilingGameModels.length === 0) return true; // Or false, depending on desired behavior for empty profiling set
    return allProfilingGameModels.every(game => playedGameIds.has(game.id));
  }, [allProfilingGameModels, playedGameIds]);

  const filterAndSortGames = (games: CognitiveGame[], isSectionCompleteForHeaderText?: boolean) => {
    const filtered = games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const unplayed = filtered.filter(game => !playedGameIds.has(game.id));
    const played = filtered.filter(game => playedGameIds.has(game.id));
    return [...unplayed, ...played];
  };

  const sortedFilteredProfilingGames = useMemo(
    () => filterAndSortGames(allProfilingGameModels),
    [allProfilingGameModels, searchTerm, playedGameIds]
  );

  const sortedFilteredEnhancementGames = useMemo(
    () => filterAndSortGames(allEnhancementGameModels),
    [allEnhancementGameModels, searchTerm, playedGameIds]
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

  const profilingGamesSection = (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Profiling Analysis Games</h2>
      </div>
      <p className="text-muted-foreground">
        {isProfilingComplete
          ? `You've completed all ${PROFILING_GAMES_COUNT} profiling games! You can replay them below or proceed to enhancement games.`
          : `Complete these ${PROFILING_GAMES_COUNT} games to build your initial Multiple Intelligence profile. Played games will move to the bottom of this list.`}
      </p>
      {sortedFilteredProfilingGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedFilteredProfilingGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlayGame}
              hasBeenPlayed={playedGameIds.has(game.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "No profiling games found matching your search." : "No profiling games available."}
        </p>
      )}
    </section>
  );

  const enhancementGamesSection = (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-semibold">Profile Enhancement Games</h2>
      </div>
      <p className="text-muted-foreground">
        {isProfilingComplete
          ? "Now, enhance your profile with these games. Played games will move to the bottom of this list."
          : `After completing all ${PROFILING_GAMES_COUNT} profiling games, try these to further refine and enhance your cognitive skills.`}
      </p>
      {sortedFilteredEnhancementGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedFilteredEnhancementGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlayGame}
              hasBeenPlayed={playedGameIds.has(game.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "No enhancement games found matching your search." : "No enhancement games available yet."}
        </p>
      )}
    </section>
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Games</h1>
          <p className="text-muted-foreground">
            {isProfilingComplete
              ? "Enhance your cognitive profile or replay profiling games."
              : `Challenge your mind. Start with the ${PROFILING_GAMES_COUNT} Profiling Games to build your intelligence profile.`}
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

        {isProfilingComplete ? (
          <>
            {enhancementGamesSection}
            {profilingGamesSection}
          </>
        ) : (
          <>
            {profilingGamesSection}
            {enhancementGamesSection}
          </>
        )}

      </div>
      <SimulateGameModal game={selectedGame} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
}
