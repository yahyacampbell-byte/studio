
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame, PROFILING_GAMES_COUNT, MULTIPLE_INTELLIGENCES } from '@/lib/constants';
import type { IntelligenceId } from '@/lib/types';
import { GameCard } from '@/components/games/GameCard';
import { SimulateGameModal } from '@/components/games/SimulateGameModal';
import { Input } from '@/components/ui/input';
import { Search, Brain, Sparkles, ListChecks, Lightbulb } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useActivity } from '@/context/ActivityContext';

export default function GamesPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const { activities, latestAIAnalysis } = useActivity();
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

  const latestAnalyzedTimestamp = useMemo(() => {
    return latestAIAnalysis?.lastAnalyzed ? new Date(latestAIAnalysis.lastAnalyzed).getTime() : 0;
  }, [latestAIAnalysis]);

  const getDisplayAsPlayedStatus = useCallback((gameId: string): boolean => {
    const gameActivities = activities.filter(act => act.gameId === gameId);
    if (gameActivities.length === 0) return false;

    if (latestAnalyzedTimestamp === 0) {
      return true;
    }
    return gameActivities.some(act => new Date(act.timestamp).getTime() > latestAnalyzedTimestamp);
  }, [activities, latestAnalyzedTimestamp]);

  const allTimePlayedGameIds = useMemo(() => new Set(activities.map(act => act.gameId)), [activities]);
  const profilingGameModels = useMemo(() => COGNITIVE_GAMES.slice(0, PROFILING_GAMES_COUNT), []);
  const enhancementGameModels = useMemo(() => COGNITIVE_GAMES.slice(PROFILING_GAMES_COUNT), []);

  const isInitialProfilingComplete = useMemo(() => {
    if (profilingGameModels.length === 0) return true;
    return profilingGameModels.every(game => allTimePlayedGameIds.has(game.id));
  }, [profilingGameModels, allTimePlayedGameIds]);

  const recommendedGames = useMemo(() => {
    if (!latestAIAnalysis || !latestAIAnalysis.intelligenceScores || latestAIAnalysis.intelligenceScores.length === 0) {
      return [];
    }
    const scores = [...latestAIAnalysis.intelligenceScores].sort((a, b) => a.score - b.score);
    const recommendations: CognitiveGame[] = [];
    const recommendedGameIds = new Set<string>();

    const weakestIntelligences = scores.slice(0, 2).map(s => s.intelligence);
    const strongestIntelligences = scores.length > 2 ? scores.slice(scores.length -1).map(s => s.intelligence) : [];
    
    const targetIntelligences = [
        ...weakestIntelligences,
        ...strongestIntelligences
    ].filter(Boolean) as IntelligenceId[];

    for (const targetInt of targetIntelligences) {
      if (recommendations.length >= 3) break;
      const gamesForIntelligence = COGNITIVE_GAMES.filter(game => 
        game.assessesIntelligences.includes(targetInt) && !recommendedGameIds.has(game.id)
      );
      const unplayedThisCycle = gamesForIntelligence.filter(game => !getDisplayAsPlayedStatus(game.id));
      const playedThisCycle = gamesForIntelligence.filter(game => getDisplayAsPlayedStatus(game.id));
      
      let gameToRecommend: CognitiveGame | undefined = unplayedThisCycle[0] || playedThisCycle[0];
      if (gameToRecommend) {
        recommendations.push(gameToRecommend);
        recommendedGameIds.add(gameToRecommend.id);
      }
    }
    return recommendations;
  }, [latestAIAnalysis, getDisplayAsPlayedStatus]);

  const filterAndSortGames = useCallback((games: CognitiveGame[]) => {
    const filtered = games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const unplayedThisCycle = filtered.filter(game => !getDisplayAsPlayedStatus(game.id));
    const playedThisCycle = filtered.filter(game => getDisplayAsPlayedStatus(game.id));
    return [...unplayedThisCycle, ...playedThisCycle];
  }, [searchTerm, getDisplayAsPlayedStatus]);

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

  const renderGameCards = (games: CognitiveGame[]) => {
    if (games.length === 0 && searchTerm) {
      return <p className="text-center text-muted-foreground py-8 col-span-full">No games found matching your search in this section.</p>;
    }
    if (games.length === 0 && !searchTerm) {
        return <p className="text-center text-muted-foreground py-8 col-span-full">No games available in this section currently.</p>;
    }
    return games.map((game) => (
      <GameCard
        key={game.id}
        game={game}
        onPlay={handlePlayGame}
        hasBeenPlayed={getDisplayAsPlayedStatus(game.id)}
      />
    ));
  };

  const recommendedGamesSection = useMemo(() => {
    const sortedGames = filterAndSortGames(recommendedGames);
    if (!latestAIAnalysis || sortedGames.length === 0 && !searchTerm) return null; // Don't render section if no recommendations or AI results
     if (sortedGames.length === 0 && searchTerm) { // Still show section header if search yields no results but recommendations exist
        return (
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-destructive" />
                    <h2 className="text-2xl font-semibold">Recommended For You</h2>
                </div>
                <p className="text-muted-foreground">
                    Based on your latest analysis. Games played since your last analysis are at the bottom.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderGameCards(sortedGames)}
                </div>
            </section>
        );
    }
    if (sortedGames.length === 0) return null;


    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold">Recommended For You</h2>
        </div>
        <p className="text-muted-foreground">
          Based on your latest analysis. Games played since your last analysis are at the bottom.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderGameCards(sortedGames)}
        </div>
      </section>
    );
  }, [recommendedGames, latestAIAnalysis, filterAndSortGames, searchTerm, renderGameCards]);


  const gamesByIntelligenceSection = useMemo(() => {
    if (!latestAIAnalysis) return null;

    return (
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Games by Intelligence Type</h2>
        </div>
        <p className="text-muted-foreground">
            Explore games targeting specific cognitive intelligences. Games played since your last analysis appear at the bottom of each list.
        </p>
        {MULTIPLE_INTELLIGENCES.map(intelligence => {
          const gamesForThisIntelligence = COGNITIVE_GAMES.filter(game => 
            game.assessesIntelligences.includes(intelligence.id)
          );
          const sortedGames = filterAndSortGames(gamesForThisIntelligence);
          if (sortedGames.length === 0 && !searchTerm) return null; // Skip rendering if no games for this intelligence or no search match

          const IconComponent = intelligence.icon;

          return (
            <div key={intelligence.id} className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b pb-2">
                {IconComponent && <IconComponent className="h-5 w-5" style={{ color: intelligence.color || 'hsl(var(--foreground))' }} />}
                <h3 className="text-xl font-medium">{intelligence.name} Games</h3>
              </div>
              {sortedGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {renderGameCards(sortedGames)}
                </div>
              ) : (
                 searchTerm && <p className="text-center text-muted-foreground py-4">No {intelligence.name} games found matching your search.</p>
              )}
            </div>
          );
        })}
      </section>
    );
  }, [latestAIAnalysis, filterAndSortGames, searchTerm, renderGameCards]);


  const profilingGamesSection = useMemo(() => {
    if (latestAIAnalysis) return null; // This section is replaced if analysis has been done
    const sortedGames = filterAndSortGames(profilingGameModels);
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Profiling Analysis Games</h2>
        </div>
        <p className="text-muted-foreground">
          {isInitialProfilingComplete
            ? `You've played all ${PROFILING_GAMES_COUNT} initial profiling games! Replay them or proceed to Enhancement Games. Games played recently are at the bottom.`
            : `Complete these ${PROFILING_GAMES_COUNT} games to build your initial Multiple Intelligence profile. Games played recently are at the bottom.`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderGameCards(sortedGames)}
        </div>
      </section>
    );
  }, [profilingGameModels, latestAIAnalysis, isInitialProfilingComplete, filterAndSortGames, searchTerm, renderGameCards]);

  const enhancementGamesSection = useMemo(() => {
    const sortedGames = filterAndSortGames(enhancementGameModels);
    const title = latestAIAnalysis ? "Further Profile Enhancement" : "Profile Enhancement Games";
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <p className="text-muted-foreground">
          {isInitialProfilingComplete
            ? "Challenge yourself with these games to further refine and enhance your cognitive skills. Games played since your last analysis are at the bottom."
            : `After completing all ${PROFILING_GAMES_COUNT} profiling games, try these. Games played recently are at the bottom.`}
        </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderGameCards(sortedGames)}
        </div>
      </section>
    );
  }, [enhancementGameModels, isInitialProfilingComplete, latestAIAnalysis, filterAndSortGames, searchTerm, renderGameCards]);
  
  const pageTitle = latestAIAnalysis 
    ? "Explore Games by Recommendation or Intelligence" 
    : `Play ${PROFILING_GAMES_COUNT} Profiling Games to Start`;
  
  const pageDescription = latestAIAnalysis
    ? "Dive into recommended games or explore specific intelligences. Replay games to see how your profile evolves!"
    : `Challenge your mind. Start by playing all ${PROFILING_GAMES_COUNT} Profiling Games to build your intelligence profile, then move to enhancement games.`;


  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
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
        
        {/* Conditional Rendering Logic */}
        {latestAIAnalysis ? (
          <>
            {recommendedGamesSection}
            {gamesByIntelligenceSection}
            {enhancementGamesSection}
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

