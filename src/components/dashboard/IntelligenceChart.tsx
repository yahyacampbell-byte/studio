"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { MULTIPLE_INTELLIGENCES } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No intelligence data available. Play some games and analyze your activity on the Insights page.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = MULTIPLE_INTELLIGENCES.map(mi => {
    const foundScore = aiResults.intelligenceScores.find(s => s.intelligence === mi.id || s.intelligence === mi.name);
    return {
      name: mi.name,
      score: foundScore ? foundScore.score : 0,
      icon: mi.icon, // For custom tooltip or legend if needed
      color: mi.color || 'hsl(var(--primary))', // Fallback to primary color
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              interval={0} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
            />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))'
              }}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
            <Bar dataKey="score" name="Strength Score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
