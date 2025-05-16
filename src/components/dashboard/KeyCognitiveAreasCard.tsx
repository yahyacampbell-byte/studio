
"use client";

import type { AIAnalysisResults, IntelligenceScore } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Info } from 'lucide-react';
import { MULTIPLE_INTELLIGENCES } from '@/lib/constants';

interface KeyCognitiveAreasCardProps {
  aiResults: AIAnalysisResults | null;
}

export function KeyCognitiveAreasCard({ aiResults }: KeyCognitiveAreasCardProps) {
  if (!aiResults || !aiResults.intelligenceScores || aiResults.intelligenceScores.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-muted-foreground" />
            Key Cognitive Areas
          </CardTitle>
          <CardDescription>Highlights will appear here after more analysis.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center"> {/* Adjusted height */}
          <p className="text-muted-foreground text-center">
            Complete more game analyses to see your key cognitive strengths and areas for growth.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedScores = [...aiResults.intelligenceScores].sort((a, b) => b.score - a.score);
  
  let strengths: IntelligenceScore[] = [];
  let opportunities: IntelligenceScore[] = [];

  if (sortedScores.length >= 1) {
    strengths.push(sortedScores[0]);
  }
  if (sortedScores.length >= 2 && sortedScores.length >= 4) { // Only add a second strength if there are at least 4 scores to pick from
    strengths.push(sortedScores[1]);
  }

  if (sortedScores.length >= 1) {
    opportunities.push(sortedScores[sortedScores.length - 1]);
  }
  if (sortedScores.length >= 2 && sortedScores.length >= 4) { // Only add a second opportunity if there are at least 4 scores
     if (sortedScores.length - 2 >= 0 && sortedScores[sortedScores.length - 2].score < strengths[strengths.length-1].score) { // ensure it's not same as a strength
        opportunities.push(sortedScores[sortedScores.length - 2]);
     } else if (sortedScores.length >= 3 && sortedScores[sortedScores.length-1].intelligence !== sortedScores[sortedScores.length-2].intelligence && sortedScores[sortedScores.length-2].score < strengths[strengths.length-1].score) {
        // If only 3 items, and middle is not same as top, and it's lower than top strength, then bottom 2 could be same.
        // This logic is getting complex, simplify for now: only one opportunity if 3 scores.
     }
  }
  if (sortedScores.length === 3) {
      // For 3 scores, it's top 1 strength, bottom 1 opportunity.
      // `opportunities` already has the bottom one.
      // `strengths` already has the top one.
      // No need to add a second opportunity.
      if (opportunities.length > 1) opportunities = [opportunities[0]];
  }


  const getIntelligenceDisplayName = (id: string) => {
    const mi = MULTIPLE_INTELLIGENCES.find(m => m.id === id || m.name === id);
    return mi ? mi.name : id;
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
      <CardContent className="space-y-4">
        {strengths.length > 0 && (
          <div>
            <h3 className="flex items-center text-md font-semibold mb-2 text-green-600 dark:text-green-400">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {strengths.map((item) => (
                <Badge key={item.intelligence} variant="secondary" className="text-sm bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300">
                  {getIntelligenceDisplayName(item.intelligence)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {opportunities.length > 0 && (
          <div>
            <h3 className="flex items-center text-md font-semibold mb-2 text-amber-600 dark:text-amber-400">
              <Target className="mr-2 h-5 w-5" />
              Areas for Growth
            </h3>
            <div className="flex flex-wrap gap-2">
              {opportunities.map((item) => (
                <Badge key={item.intelligence} variant="secondary" className="text-sm bg-amber-100 text-amber-700 dark:bg-amber-800/30 dark:text-amber-300">
                  {getIntelligenceDisplayName(item.intelligence)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
