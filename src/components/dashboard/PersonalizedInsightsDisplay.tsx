"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ArrowUpCircle, Info } from 'lucide-react';

interface PersonalizedInsightsDisplayProps {
  aiResults: AIAnalysisResults | null;
}

export function PersonalizedInsightsDisplay({ aiResults }: PersonalizedInsightsDisplayProps) {
  if (!aiResults || (!aiResults.personalizedInsights && !aiResults.recommendations)) {
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

  return (
    <div className="space-y-6">
      {aiResults.personalizedInsights && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lightbulb className="mr-3 h-6 w-6 text-accent" />
              Your Personalized Insights
            </CardTitle>
             {aiResults.lastAnalyzed && (
                <CardDescription className="text-xs text-muted-foreground mt-1">
                Insights from analysis on: {new Date(aiResults.lastAnalyzed).toLocaleString()}
                </CardDescription>
            )}
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>{aiResults.personalizedInsights}</p>
          </CardContent>
        </Card>
      )}

      {aiResults.recommendations && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ArrowUpCircle className="mr-3 h-6 w-6 text-secondary" />
              Growth Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
             <p>{aiResults.recommendations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
