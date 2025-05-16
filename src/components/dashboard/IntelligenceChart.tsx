
"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { MULTIPLE_INTELLIGENCES } from '@/lib/constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface IntelligenceChartProps {
  aiResults: AIAnalysisResults | null;
}

export function IntelligenceChart({ aiResults }: IntelligenceChartProps) {
  if (!aiResults || aiResults.intelligenceScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intelligence Profile</CardTitle>
          <CardDescription>Your cognitive strengths will appear here after analysis.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No intelligence data available. Play some games and analyze your activity on the Insights page.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = MULTIPLE_INTELLIGENCES.map(mi => {
    const foundScore = aiResults.intelligenceScores.find(s => s.intelligence === mi.id || s.intelligence === mi.name);
    return {
      subject: mi.name, // For RadarChart, the axis label is often called 'subject'
      score: foundScore ? foundScore.score : 0,
      fullMark: 100, // Maximum score for each axis
    };
  });
  

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Cognitive Strengths Profile</CardTitle>
        <CardDescription>
          Based on your gameplay, here's a snapshot of your relative strengths across different intelligences. Scores are from 0 to 100.
          {aiResults.lastAnalyzed && (
            <span className="block text-xs text-muted-foreground mt-1">
              Last analyzed: {new Date(aiResults.lastAnalyzed).toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <Radar 
              name="Strength Score" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.6} 
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))'
              }}
              cursor={{ stroke: 'hsl(var(--accent))', strokeOpacity: 0.5, strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

