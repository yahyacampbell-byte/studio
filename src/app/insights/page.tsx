"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useActivity } from '@/context/ActivityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2, BarChartBig, Bot } from 'lucide-react';
import { analyzeGameplayAndMapToIntelligences, AnalyzeGameplayInput } from '@/ai/flows/analyze-gameplay-and-map-to-intelligences';
import { generatePersonalizedInsights, PersonalizedInsightsInput } from '@/ai/flows/generate-personalized-insights-from-game-data';
import type { AIAnalysisResults, IntelligenceScore } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function InsightsPage() {
  const { activities, aiResults, setAIResults, isLoadingAI, setIsLoadingAI, clearActivities } = useActivity();
  const { toast } = useToast();

  const handleAnalyzeActivity = async () => {
    if (activities.length === 0) {
      toast({
        title: "No Activity",
        description: "Play some games first to analyze your activity.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      // Prepare data for the first AI flow
      const gameplayDataForAnalysis: AnalyzeGameplayInput['gameplayData'] = activities.map(act => ({
        gameTitle: act.gameTitle,
        score: act.score,
        activityDuration: act.activityDuration,
      }));

      const analysisResult = await analyzeGameplayAndMapToIntelligences({ gameplayData: gameplayDataForAnalysis });
      
      const intelligenceScores: IntelligenceScore[] = analysisResult.intelligenceMappings.map(im => ({
        intelligence: im.intelligence as AIAnalysisResults['intelligenceScores'][0]['intelligence'], // Cast might be needed if AI returns slightly different strings
        score: im.score,
        reasoning: im.reasoning,
      }));

      // Prepare data for the second AI flow
      const gameDataForInsights: PersonalizedInsightsInput['gameData'] = JSON.stringify(
        activities.map(act => ({
          title: act.gameId, // This uses the game KEY (e.g., CANDY_FACTORY)
          score: act.score,
          timestamp: act.timestamp,
        }))
      );
      
      const personalizedInsightsResult = await generatePersonalizedInsights({ gameData: gameDataForInsights });

      const newAIResults: AIAnalysisResults = {
        intelligenceScores,
        personalizedInsights: personalizedInsightsResult.insights,
        recommendations: personalizedInsightsResult.recommendations,
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
      setAIResults(null); // Clear previous results on error
    } finally {
      setIsLoadingAI(false);
    }
  };

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
              {activities.length > 0 
                ? `You have ${activities.length} game activities logged. Click below to process them and reveal your cognitive strengths and insights.`
                : "Play some games to log activity. Once you have some gameplay data, you can analyze it here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length > 0 ? (
              <Button onClick={handleAnalyzeActivity} disabled={isLoadingAI} size="lg" className="w-full sm:w-auto">
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
                <p className="text-sm text-muted-foreground">Last analyzed: {new Date(aiResults.lastAnalyzed!).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        {!aiResults && !isLoadingAI && activities.length > 0 && (
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
