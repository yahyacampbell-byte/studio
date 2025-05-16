
"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProgressTrendChartProps {
  aiAnalysisHistory: AIAnalysisResults[];
}

export function ProgressTrendChart({ aiAnalysisHistory }: ProgressTrendChartProps) {
  if (!aiAnalysisHistory || aiAnalysisHistory.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cognitive Score Trend</CardTitle>
          <CardDescription>Your overall cognitive score trend will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {(!aiAnalysisHistory || aiAnalysisHistory.length === 0) 
              ? "No analysis data available yet. Analyze your activity on the Insights page."
              : "At least two analyses are needed to show a trend. Keep playing and analyzing!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = aiAnalysisHistory.map(analysis => {
    const averageScore = analysis.intelligenceScores.length > 0
      ? analysis.intelligenceScores.reduce((sum, s) => sum + s.score, 0) / analysis.intelligenceScores.length
      : 0;
    return {
      date: new Date(analysis.lastAnalyzed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      averageScore: parseFloat(averageScore.toFixed(1)), // Keep one decimal place
    };
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Overall Cognitive Score Trend</CardTitle>
        <CardDescription>
          Track the average of your intelligence scores over time. Scores are from 0 to 100.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20, // Adjusted for better label visibility
              left: 0,  // Adjusted
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                angle={-35} // Angle labels for better fit if many data points
                textAnchor="end"
                height={50} // Increase height for angled labels
                interval="preserveStartEnd" // Show first and last, and some in between
            />
            <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
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
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                activeDot={{ r: 6 }} 
                name="Average Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
