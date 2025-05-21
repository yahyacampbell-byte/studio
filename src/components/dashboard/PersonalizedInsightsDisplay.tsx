
"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lightbulb, ArrowUpCircle, Info, Brain, Activity } from 'lucide-react';

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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Your AI-Powered Insights</CardTitle>
        <CardDescription>
          Explore your personalized feedback below. Click on a section to expand it.
          {aiResults.lastAnalyzed && (
            <span className="block text-xs text-muted-foreground mt-1">
              Last analyzed: {new Date(aiResults.lastAnalyzed).toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {aiResults.multipleIntelligencesSummary && (
            <AccordionItem value="mi-summary" className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center text-lg font-semibold">
                  <Lightbulb className="mr-3 h-6 w-6 text-accent" />
                  Multiple Intelligences Snapshot
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {aiResults.multipleIntelligencesSummary}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {aiResults.broaderCognitiveInsights && (
            <AccordionItem value="cognitive-observations" className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center text-lg font-semibold">
                  <Brain className="mr-3 h-6 w-6 text-primary" />
                  Broader Cognitive Observations
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{aiResults.broaderCognitiveInsights}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {aiResults.actionableRecommendations && (
            <AccordionItem value="recommendations" className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center text-lg font-semibold">
                  <ArrowUpCircle className="mr-3 h-6 w-6 text-secondary" />
                  Actionable Recommendations
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{aiResults.actionableRecommendations}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

