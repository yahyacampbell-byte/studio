
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
  const { activities, latestAIAnalysis } = useActivity(); // Use latestAIAnalysis
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

  // For determining if profiling milestone is met (based on all-time plays)
  const allTimePlayedGameIds = useMemo(() => new Set(activities.map(act => act.gameId)), [activities]);

  const allProfilingGameModels = useMemo(() => COGNITIVE_GAMES.slice(0, PROFILING_GAMES_COUNT), []);
  const allEnhancementGameModels = useMemo(() => COGNITIVE_GAMES.slice(PROFILING_GAMES_COUNT), []);

  const isProfilingComplete = useMemo(() => {
    if (allProfilingGameModels.length === 0) return true;
    return allProfilingGameModels.every(game => allTimePlayedGameIds.has(game.id));
  }, [allProfilingGameModels, allTimePlayedGameIds]);


  // For display on GameCard (played since last analysis or ever if no analysis yet)
  const getDisplayAsPlayedStatus = useCallback((gameId: string): boolean => {
    const gameActivities = activities.filter(act => act.gameId === gameId);
    if (gameActivities.length === 0) return false; // Never played

    if (latestAnalyzedTimestamp === 0) { // No analysis performed yet
        return true; // Any play counts as "played"
    }

    // Check if any play of this game occurred AFTER the last analysis timestamp
    return gameActivities.some(act => new Date(act.timestamp).getTime() > latestAnalyzedTimestamp);
  }, [activities, latestAnalyzedTimestamp]);
  

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
      
      // Prioritize games not played in the current cycle (since last analysis)
      const unplayedThisCycle = gamesForIntelligence.filter(game => !getDisplayAsPlayedStatus(game.id));
      const playedThisCycle = gamesForIntelligence.filter(game => getDisplayAsPlayedStatus(game.id));
      
      let gameToRecommend: CognitiveGame | undefined = undefined;

      if (unplayedThisCycle.length > 0) {
        gameToRecommend = unplayedThisCycle[0]; 
      } else if (playedThisCycle.length > 0) {
        gameToRecommend = playedThisCycle[0]; 
      }

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
    // Sort based on displayAsPlayed status: "unplayed" (for this cycle) first
    const unplayedThisCycle = filtered.filter(game => !getDisplayAsPlayedStatus(game.id));
    const playedThisCycle = filtered.filter(game => getDisplayAsPlayedStatus(game.id));
    return [...unplayedThisCycle, ...playedThisCycle];
  }, [searchTerm, getDisplayAsPlayedStatus]);


  const sortedFilteredProfilingGames = useMemo(
    () => filterAndSortGames(allProfilingGameModels),
    [allProfilingGameModels, filterAndSortGames] // filterAndSortGames depends on searchTerm and getDisplayAsPlayedStatus
  );

  const sortedFilteredEnhancementGames = useMemo(
    () => filterAndSortGames(allEnhancementGameModels),
    [allEnhancementGameModels, filterAndSortGames]
  );
  
  const sortedFilteredRecommendedGames = useMemo(
    () => filterAndSortGames(recommendedGames),
    [recommendedGames, filterAndSortGames]
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
  
  const recommendedGamesSection = sortedFilteredRecommendedGames.length > 0 && (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-destructive" />
        <h2 className="text-2xl font-semibold">Recommended For You</h2>
      </div>
      <p className="text-muted-foreground">
        Based on your latest analysis, try these games to further develop your cognitive profile. Games played since your last analysis are at the bottom.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedFilteredRecommendedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={handlePlayGame}
            hasBeenPlayed={getDisplayAsPlayedStatus(game.id)}
          />
        ))}
      </div>
    </section>
  );

  const profilingGamesSection = (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Profiling Analysis Games</h2>
      </div>
      <p className="text-muted-foreground">
        {isProfilingComplete // This check is based on all-time plays
          ? `You've completed all ${PROFILING_GAMES_COUNT} profiling games! You can replay them below. Games played since your last analysis are at the bottom.`
          : `Complete these ${PROFILING_GAMES_COUNT} games to build your initial Multiple Intelligence profile. Games played since your last analysis (or ever, if no analysis yet) are at the bottom.`}
      </p>
      {sortedFilteredProfilingGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedFilteredProfilingGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlayGame}
              hasBeenPlayed={getDisplayAsPlayedStatus(game.id)}
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
        {isProfilingComplete // This check is based on all-time plays
          ? "Now, enhance your profile with these games. Games played since your last analysis are at the bottom."
          : `After completing all ${PROFILING_GAMES_COUNT} profiling games, try these to further refine and enhance your cognitive skills.`}
      </p>
      {sortedFilteredEnhancementGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedFilteredEnhancementGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlayGame}
              hasBeenPlayed={getDisplayAsPlayedStatus(game.id)}
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
              ? "Enhance your cognitive profile or replay profiling games. Check out your recommendations below!"
              : `Challenge your mind. Start by playing all ${PROFILING_GAMES_COUNT} Profiling Games to build your intelligence profile.`}
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
        
        {/* Render order logic */}
        {recommendedGamesSection}
        {isProfilingComplete ? ( // This condition is based on all-time plays
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
