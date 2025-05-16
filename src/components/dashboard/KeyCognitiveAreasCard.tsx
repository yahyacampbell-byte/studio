
"use client";

import type { AIAnalysisResults, IntelligenceScore } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Info } from 'lucide-react';
import { MULTIPLE_INTELLIGENCES, Intelligence } from '@/lib/constants';

interface KeyCognitiveAreasCardProps {
  aiResults: AIAnalysisResults | null;
}

export function KeyCognitiveAreasCard({ aiResults }: KeyCognitiveAreasCardProps) {
  if (!aiResults || !aiResults.intelligenceScores || aiResults.intelligenceScores.length < 1) { // Changed to < 1 for flexibility with 1-2 items.
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-muted-foreground" />
            Key Cognitive Areas
          </CardTitle>
          <CardDescription>Highlights will appear here after analysis.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Complete game analyses to see your key cognitive strengths and areas for growth.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort scores: highest to lowest
  const sortedScores = [...aiResults.intelligenceScores].sort((a, b) => b.score - a.score);
  
  let strengths: IntelligenceScore[] = [];
  let opportunities: IntelligenceScore[] = [];

  if (sortedScores.length > 0) {
    strengths.push(sortedScores[0]); // Top strength
    if (sortedScores.length > 2) { // Only add a second strength if there are at least 3 scores
      strengths.push(sortedScores[1]);
    }

    opportunities.push(sortedScores[sortedScores.length - 1]); // Bottom opportunity
    if (sortedScores.length > 3 && sortedScores.length - 2 >= 0) { // Only add a second opportunity if there are at least 4 scores and it's distinct from strengths
      // Ensure the second opportunity is not also a strength (can happen with few scores)
      const secondOpportunityIndex = sortedScores.length - 2;
      if (!strengths.some(s => s.intelligence === sortedScores[secondOpportunityIndex].intelligence)) {
        opportunities.push(sortedScores[secondOpportunityIndex]);
      }
    }
  }
  
  // If only 1 score, it's a strength, no opportunity.
  // If 2 scores, top is strength, bottom is opportunity.
  if (sortedScores.length === 1) {
    opportunities = [];
  } else if (sortedScores.length === 2) {
    // strengths has sortedScores[0], opportunities has sortedScores[1] - this is correct.
  }


  const getIntelligenceDetails = (intelligenceId: string): Intelligence | undefined => {
    return MULTIPLE_INTELLIGENCES.find(mi => mi.id === intelligenceId || mi.name === intelligenceId);
  };

  const renderIntelligenceItem = (scoreItem: IntelligenceScore) => {
    const details = getIntelligenceDetails(scoreItem.intelligence);
    if (!details) return null;
    const IconComponent = details.icon;
    return (
      <div key={details.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
        {IconComponent && <IconComponent className="h-5 w-5" style={{ color: details.color }} />}
        <span className="font-medium">{details.name}:</span>
        <span className="text-foreground font-semibold">{scoreItem.score}</span>
      </div>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Key Cognitive Areas</CardTitle>
        <CardDescription>
          A quick look at your prominent cognitive areas from your latest analysis.
          {aiResults.lastAnalyzed && (
            <span className="block text-xs text-muted-foreground mt-1">
              Analyzed: {new Date(aiResults.lastAnalyzed).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {strengths.length > 0 && (
          <div>
            <h3 className="flex items-center text-md font-semibold mb-2 text-green-600 dark:text-green-400">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Strengths
            </h3>
            <div className="space-y-2">
              {strengths.map(renderIntelligenceItem)}
            </div>
          </div>
        )}

        {opportunities.length > 0 && (
          <div>
            <h3 className="flex items-center text-md font-semibold mb-2 text-amber-600 dark:text-amber-400">
              <Target className="mr-2 h-5 w-5" />
              Areas for Growth
            </h3>
            <div className="space-y-2">
              {opportunities.map(renderIntelligenceItem)}
            </div>
          </div>
        )}
         {(strengths.length === 0 && opportunities.length === 0 && aiResults.intelligenceScores.length > 0) && (
            <p className="text-sm text-muted-foreground">More distinct scoring patterns are needed to highlight specific strengths and growth areas.</p>
        )}
      </CardContent>
    </Card>
  );
}
