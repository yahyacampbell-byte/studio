
"use client";

import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useActivity } from '@/context/ActivityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2, BarChartBig, Bot, Brain } from 'lucide-react';
import { analyzeGameplayAndMapToIntelligences, AnalyzeGameplayInput } from '@/ai/flows/analyze-gameplay-and-map-to-intelligences';
import { generatePersonalizedInsights, PersonalizedInsightsInput, PersonalizedInsightsOutput } from '@/ai/flows/generate-personalized-insights-from-game-data';
import type { AIAnalysisResults, IntelligenceScore } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { COGNITIVE_GAMES, PROFILING_GAMES_COUNT } from '@/lib/constants';

export default function InsightsPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const { activities, aiResults, setAIResults, isLoadingAI, setIsLoadingAI, clearActivities } = useActivity();
  const { toast } = useToast();

  const profilingGameIds = useMemo(() => COGNITIVE_GAMES.slice(0, PROFILING_GAMES_COUNT).map(g => g.id), []);
  
  const allProfilingGamesPlayed = useMemo(() => {
    if (activities.length < PROFILING_GAMES_COUNT) return false;
    const playedProfilingGameIds = new Set(
      activities
        .filter(act => profilingGameIds.includes(act.gameId))
        .map(act => act.gameId)
    );
    return profilingGameIds.every(id => playedProfilingGameIds.has(id));
  }, [activities, profilingGameIds]);

  const handleAnalyzeActivity = async () => {
    if (activities.length === 0) {
      toast({
        title: "No Activity",
        description: "Play some games first to analyze your activity.",
        variant: "destructive",
      });
      return;
    }

    if (!allProfilingGamesPlayed) {
      toast({
        title: "Profiling Incomplete",
        description: `Please complete all ${PROFILING_GAMES_COUNT} Profiling Analysis Games before analyzing your activity.`,
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const gameplayDataForAnalysis: AnalyzeGameplayInput['gameplayData'] = activities.map(act => ({
        gameTitle: act.gameTitle,
        score: act.score,
        activityDuration: act.activityDuration,
      }));

      const analysisResult = await analyzeGameplayAndMapToIntelligences({ gameplayData: gameplayDataForAnalysis });
      
      const intelligenceScores: IntelligenceScore[] = analysisResult.intelligenceMappings.map(im => ({
        intelligence: im.intelligence as AIAnalysisResults['intelligenceScores'][0]['intelligence'],
        score: im.score,
        reasoning: im.reasoning,
      }));

      const gameDataForInsights: PersonalizedInsightsInput['gameData'] = JSON.stringify(
        activities.map(act => ({
          gameTitle: act.gameTitle, 
          score: act.score,
          timestamp: act.timestamp,
        }))
      );
      
      const personalizedOutput: PersonalizedInsightsOutput = await generatePersonalizedInsights({ gameData: gameDataForInsights });

      const newAIResults: AIAnalysisResults = {
        intelligenceScores,
        multipleIntelligencesSummary: personalizedOutput.multipleIntelligencesSummary,
        broaderCognitiveInsights: personalizedOutput.broaderCognitiveInsights,
        actionableRecommendations: personalizedOutput.actionableRecommendations,
        lastAnalyzed: new Date().toISOString(),
      };
      
      setAIResults(newAIResults);

      toast({
        title: "Analysis Complete!",
        description: "Your cognitive insights have been updated.",
      });

    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred during AI analysis. Please try again.",
        variant: "destructive",
      });
      setAIResults(null); // Clear results on failure
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  if (isLoadingAuth || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading insights...</p>
        </div>
      </AppLayout>
    );
  }

  let analysisCardDescription: string;
  if (activities.length === 0) {
    analysisCardDescription = "Play some games to log activity. Once you have some gameplay data, you can analyze it here.";
  } else if (!allProfilingGamesPlayed) {
    const remainingGames = PROFILING_GAMES_COUNT - new Set(activities.filter(act => profilingGameIds.includes(act.gameId)).map(act => act.gameId)).size;
    analysisCardDescription = `You have ${activities.length} game activities logged. Please complete all ${PROFILING_GAMES_COUNT} Profiling Analysis Games to enable analysis. You have ${remainingGames} more profiling game(s) to play.`;
  } else {
    analysisCardDescription = `You have ${activities.length} game activities logged, including all profiling games. Click below to process them and reveal your cognitive strengths and insights.`;
  }


  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cognitive Insights</h1>
          <p className="text-muted-foreground">
            Analyze your gameplay to understand your cognitive profile and get personalized feedback.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Bot className="mr-2 h-6 w-6 text-primary" />
                AI-Powered Analysis
            </CardTitle>
            <CardDescription>
              {analysisCardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length > 0 ? (
              <Button onClick={handleAnalyzeActivity} disabled={isLoadingAI || !allProfilingGamesPlayed} size="lg" className="w-full sm:w-auto">
                {isLoadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChartBig className="mr-2 h-4 w-4" />
                    Analyze My Activity ({activities.length} sessions)
                  </>
                )}
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/games">Play Games to Get Started</Link>
              </Button>
            )}
             {activities.length > 0 && (
                <Button onClick={clearActivities} variant="outline" disabled={isLoadingAI} className="w-full sm:w-auto sm:ml-4">
                    Clear All Activity Data
                </Button>
            )}
          </CardContent>
        </Card>

        {isLoadingAI && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-lg">Processing your data with AI. This may take a moment...</p>
          </div>
        )}

        {aiResults && !isLoadingAI && (
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <CheckCircle className="mr-2 h-5 w-5" />
                Analysis Complete!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Your insights are ready. View them on your <Link href="/dashboard" className="font-semibold underline hover:text-green-700 dark:hover:text-green-200">Dashboard</Link>.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Last analyzed: {aiResults.lastAnalyzed ? new Date(aiResults.lastAnalyzed).toLocaleString() : 'N/A'}</p>
            </CardContent>
          </Card>
        )}

        {!aiResults && !isLoadingAI && activities.length > 0 && allProfilingGamesPlayed && (
           <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Ready to Analyze
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-400">
                You have gameplay data ready for analysis. Click the "Analyze My Activity" button above to generate your cognitive profile.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}
