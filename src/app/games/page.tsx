
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { COGNITIVE_GAMES, CognitiveGame, PROFILING_GAMES_COUNT, MULTIPLE_INTELLIGENCES, ENHANCEMENT_GAME_IDS } from '@/lib/constants';
import type { IntelligenceId } from '@/lib/types';
import { GameCard } from '@/components/games/GameCard';
// SimulateGameModal is no longer needed here, it's on the game details page
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Brain, Sparkles, ListChecks, Lightbulb } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useActivity } from '@/context/ActivityContext';


export default function GamesPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const { activities, latestAIAnalysis } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');

  const latestAnalyzedTimestamp = useMemo(() => {
    return latestAIAnalysis?.lastAnalyzed ? new Date(latestAIAnalysis.lastAnalyzed).getTime() : 0;
  }, [latestAIAnalysis]);

  const getDisplayAsPlayedStatus = useCallback((gameId: string): boolean => {
    const gameActivities = activities.filter(act => act.gameId === gameId);
    if (gameActivities.length === 0) return false;

    if (latestAnalyzedTimestamp === 0) { // No analysis done yet, any play counts
      return true;
    }
    // If analysis has been done, only count plays *after* the last analysis
    return gameActivities.some(act => new Date(act.timestamp).getTime() > latestAnalyzedTimestamp);
  }, [activities, latestAnalyzedTimestamp]);

  const allTimePlayedGameIds = useMemo(() => new Set(activities.map(act => act.gameId)), [activities]);
  const profilingGameModels = useMemo(() => COGNITIVE_GAMES.slice(0, PROFILING_GAMES_COUNT), []);
  
  const gamesForIntelligenceAccordions = useMemo(() => 
    COGNITIVE_GAMES.filter(game => game && game.id && !ENHANCEMENT_GAME_IDS.includes(game.id))
  , []);

  const enhancementGameModels = useMemo(() => 
    COGNITIVE_GAMES.filter(game => game && game.id && ENHANCEMENT_GAME_IDS.includes(game.id))
  , []);
  
  const isInitialProfilingComplete = useMemo(() => {
    if (profilingGameModels.length === 0) return true;
    return profilingGameModels.every(game => game && game.id && allTimePlayedGameIds.has(game.id));
  }, [profilingGameModels, allTimePlayedGameIds]);

  const recommendedGames = useMemo(() => {
    if (
        !latestAIAnalysis || 
        typeof latestAIAnalysis !== 'object' ||
        !latestAIAnalysis.intelligenceScores || 
        !Array.isArray(latestAIAnalysis.intelligenceScores) || 
        latestAIAnalysis.intelligenceScores.length === 0
    ) {
      return [];
    }

    const validScores = latestAIAnalysis.intelligenceScores.filter(
        s => typeof s === 'object' && s !== null && typeof s.score === 'number' && typeof s.intelligence === 'string'
    );

    if (validScores.length === 0) {
        return [];
    }

    const scores = [...validScores].sort((a, b) => a.score - b.score);
    const recommendations: CognitiveGame[] = [];
    const recommendedGameIds = new Set<string>();

    const weakestIntelligences = scores.slice(0, 2).map(s => s.intelligence as IntelligenceId);
    const strongestIntelligences = scores.length > 2 ? scores.slice(scores.length - 1).map(s => s.intelligence as IntelligenceId) : [];
    
    const targetIntelligences = [
        ...weakestIntelligences,
        ...strongestIntelligences
    ].filter(Boolean); 

    for (const targetInt of targetIntelligences) {
      if (recommendations.length >= 3) break; 
      
      const gamesForIntelligence = COGNITIVE_GAMES.filter(game => 
        game && game.id && Array.isArray(game.assessesIntelligences) && game.assessesIntelligences.includes(targetInt) && !recommendedGameIds.has(game.id)
      );
      
      const unplayedThisCycle = gamesForIntelligence.filter(game => game && game.id && !getDisplayAsPlayedStatus(game.id));
      const playedThisCycle = gamesForIntelligence.filter(game => game && game.id && getDisplayAsPlayedStatus(game.id));
      
      let gameToRecommend: CognitiveGame | undefined = unplayedThisCycle[0] || playedThisCycle[0];

      if (gameToRecommend) {
        recommendations.push(gameToRecommend);
        recommendedGameIds.add(gameToRecommend.id);
      }
    }
    return recommendations.filter(game => game && game.id);
  }, [latestAIAnalysis, getDisplayAsPlayedStatus]);


  const filterAndSortGames = useCallback((games: CognitiveGame[]) => {
    if (!Array.isArray(games)) return [];

    const filtered = games.filter(game =>
      game && game.title && game.description &&
      (game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const unplayedThisCycle = filtered.filter(game => game && game.id && !getDisplayAsPlayedStatus(game.id));
    const playedThisCycle = filtered.filter(game => game && game.id && getDisplayAsPlayedStatus(game.id));
    return [...unplayedThisCycle, ...playedThisCycle];
  }, [searchTerm, getDisplayAsPlayedStatus]);

  const renderGameCards = useCallback((games: CognitiveGame[]) => {
    if (!Array.isArray(games)) { 
        console.error("renderGameCards received non-array:", games);
        return <p className="text-center text-destructive py-8 col-span-full">Error: Could not load games.</p>;
    }
    const validGames = games.filter(game => game && game.id);

    if (validGames.length === 0 && searchTerm) {
      return <p className="text-center text-muted-foreground py-8 col-span-full">No games found matching your search in this section.</p>;
    }
    if (validGames.length === 0 && !searchTerm) {
        return <p className="text-center text-muted-foreground py-8 col-span-full">No games available in this section.</p>;
    }
    return validGames.map((game) => (
        <GameCard
            key={game.id}
            game={game}
            hasBeenPlayed={getDisplayAsPlayedStatus(game.id)}
        />
    ));
  }, [searchTerm, getDisplayAsPlayedStatus]);

  const recommendedGamesSection = useMemo(() => {
    const sortedGames = filterAndSortGames(recommendedGames);
    if (!latestAIAnalysis || !Array.isArray(recommendedGames) || recommendedGames.length === 0) return null; 
    
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold">Recommended For You</h2>
        </div>
        <p className="text-muted-foreground">
          Based on your latest analysis. Games played since your last analysis are at the bottom.
        </p>
        {sortedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderGameCards(sortedGames)}
            </div>
        ) : (
            searchTerm && <p className="text-center text-muted-foreground py-4">No recommended games found matching your search.</p>
        )}
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
            The {ENHANCEMENT_GAME_IDS.length} Profile Enhancement games are listed separately below.
        </p>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {MULTIPLE_INTELLIGENCES.map(intelligence => {
            if (!intelligence || !intelligence.id) return null;
            
            const gamesForThisIntelligence = gamesForIntelligenceAccordions.filter(game => 
              game && Array.isArray(game.assessesIntelligences) && game.assessesIntelligences.includes(intelligence.id)
            );
            const sortedGames = filterAndSortGames(gamesForThisIntelligence);
            
            if (sortedGames.length === 0 && searchTerm && gamesForThisIntelligence.length > 0) { 
              // If search term yields no results but games exist for this intelligence, allow accordion to show "no results" message
            } else if (gamesForThisIntelligence.length === 0 && !searchTerm) { 
                return null; // Don't render accordion if no games and no search term
            }

            const IconComponent = intelligence.icon;

            return (
              <AccordionItem value={intelligence.id} key={intelligence.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <div className="flex items-center text-lg font-semibold">
                    {IconComponent && <IconComponent className="mr-3 h-5 w-5" style={{ color: intelligence.color || 'hsl(var(--foreground))' }} />}
                    {intelligence.name} Games
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  {sortedGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                      {renderGameCards(sortedGames)}
                    </div>
                  ) : ( 
                    <p className="text-center text-muted-foreground py-4">
                      {searchTerm ? `No ${intelligence.name} games found matching your search.` : `No games currently listed for ${intelligence.name} (excluding enhancement games).`}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    );
  }, [latestAIAnalysis, filterAndSortGames, searchTerm, renderGameCards, gamesForIntelligenceAccordions]);


  const profilingGamesSection = useMemo(() => {
    if (latestAIAnalysis) return null; 
    
    const sortedGames = filterAndSortGames(profilingGameModels);
    
    if (sortedGames.length === 0 && searchTerm && profilingGameModels.length > 0) {
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
                <p className="text-center text-muted-foreground py-8 col-span-full">No games found matching your search in this section.</p>
            </section>
        );
    }
    if (profilingGameModels.length === 0 && !searchTerm) return null;

    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Profiling Analysis Games</h2>
        </div>
        <p className="text-muted-foreground">
          {isInitialProfilingComplete
            ? `You've played all ${PROFILING_GAMES_COUNT} initial profiling games! You can replay them. Games played recently are at the bottom.`
            : `Complete these ${PROFILING_GAMES_COUNT} games to build your initial Multiple Intelligence profile. Games played recently are at the bottom.`}
        </p>
        {sortedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderGameCards(sortedGames)}
            </div>
        ) : (
            <p className="text-center text-muted-foreground py-8 col-span-full">No profiling games available.</p>
        )}
      </section>
    );
  }, [profilingGameModels, latestAIAnalysis, isInitialProfilingComplete, filterAndSortGames, searchTerm, renderGameCards]);

  const enhancementGamesSection = useMemo(() => {
    const sortedGames = filterAndSortGames(enhancementGameModels);
    const title = "Profile Enhancement Games";

    if (enhancementGameModels.length === 0) return null; 

    if (sortedGames.length === 0 && searchTerm) {
         return (
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-semibold">{title}</h2>
                </div>
                <p className="text-muted-foreground">
                These games help further refine and enhance your cognitive skills. Games played since your last analysis (if any) are at the bottom.
                </p>
                <p className="text-center text-muted-foreground py-8 col-span-full">No enhancement games found matching your search.</p>
            </section>
        );
    }
    
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <p className="text-muted-foreground">
          These games help further refine and enhance your cognitive skills. Games played since your last analysis (if any) are at the bottom.
        </p>
        {sortedGames.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderGameCards(sortedGames)}
            </div>
        ) : (
            <p className="text-center text-muted-foreground py-8 col-span-full">No enhancement games available.</p>
        )}
      </section>
    );
  }, [enhancementGameModels, filterAndSortGames, searchTerm, renderGameCards]);
  
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
  
  const pageTitle = latestAIAnalysis
    ? "Explore Games by Recommendation or Intelligence" 
    : `Play ${PROFILING_GAMES_COUNT} Profiling Games to Start`;
  
  const pageDescription = latestAIAnalysis
    ? "Dive into recommended games, explore specific intelligences via the accordions, or try our enhancement games. Replay games to see how your profile evolves!"
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
        
        {latestAIAnalysis ? ( 
          <>
            {recommendedGamesSection}
            {gamesByIntelligenceSection}
            {/* Profiling Games Section is INTENTIONALLY OMITTED HERE as per request */}
            {enhancementGamesSection} 
          </>
        ) : ( 
          <>
            {profilingGamesSection} {/* Shown only if no analysis has been done */}
            {enhancementGamesSection}
          </>
        )}

      </div>
      {/* SimulateGameModal is no longer needed here, moved to game details page */}
    </AppLayout>
  );
}

