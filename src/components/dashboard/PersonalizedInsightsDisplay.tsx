
"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ArrowUpCircle, Info, Brain, Activity } from 'lucide-react'; // Added Brain, Activity icons

interface PersonalizedInsightsDisplayProps {
  aiResults: AIAnalysisResults | null;
}

export function PersonalizedInsightsDisplay({ aiResults }: PersonalizedInsightsDisplayProps) {
  if (!aiResults || (!aiResults.multipleIntelligencesSummary && !aiResults.actionableRecommendations && !aiResults.broaderCognitiveInsights)) {
    return (
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Personalized Feedback
            </CardTitle>
            <CardDescription>Personalized feedback based on your gameplay will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">No insights available yet. Analyze your activity on the Insights page to get personalized feedback.</p>
        </CardContent>
        </Card>
    );
  }

  const lastAnalyzedText = aiResults.lastAnalyzed 
    ? `Insights from analysis on: ${new Date(aiResults.lastAnalyzed).toLocaleString()}` 
    : 'Analysis complete.';

  return (
    <div className="space-y-6">
      {aiResults.multipleIntelligencesSummary && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lightbulb className="mr-3 h-6 w-6 text-accent" />
              Multiple Intelligences Snapshot
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
                {lastAnalyzedText}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>{aiResults.multipleIntelligencesSummary}</p>
          </CardContent>
        </Card>
      )}

      {aiResults.broaderCognitiveInsights && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Brain className="mr-3 h-6 w-6 text-primary" />
              Broader Cognitive Observations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
                These are general observations based on game patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>{aiResults.broaderCognitiveInsights}</p>
          </CardContent>
        </Card>
      )}

      {aiResults.actionableRecommendations && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ArrowUpCircle className="mr-3 h-6 w-6 text-secondary" />
              Actionable Recommendations
            </CardTitle>
             <CardDescription className="text-xs text-muted-foreground mt-1">
                Suggestions for your cognitive development.
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
             <p>{aiResults.actionableRecommendations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
