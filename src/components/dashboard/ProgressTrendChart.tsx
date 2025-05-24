
"use client";

import type { AIAnalysisResults } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProgressTrendChartProps {
  aiAnalysisHistory: AIAnalysisResults[];
}

export function ProgressTrendChart({ aiAnalysisHistory }: ProgressTrendChartProps) {
  if (!aiAnalysisHistory || aiAnalysisHistory.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Cognitive Score Trend</CardTitle>
          <CardDescription>Your overall cognitive score trend will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-center">
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
      averageScore: parseFloat(averageScore.toFixed(1)),
    };
  });

  const latestScoreData = chartData[chartData.length - 1];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Overall Cognitive Score Trend</CardTitle>
        <CardDescription>
          Average of your intelligence scores over time (0-100).
          {latestScoreData && (
            <span className="block text-sm font-semibold text-primary mt-1">
              Latest Average Score: {latestScoreData.averageScore}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2"> {/* Reduced top padding */}
        {/* Comment moved outside the tag */}
        <ResponsiveContainer width="100%" height={150}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: -25, // Adjusted to bring Y-axis labels closer if they were to be shown
              bottom: 5,
            }}
          >
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd" // Tries to show first and last tick
                dy={5} // Offset for ticks
            />
            {/* Y-axis is hidden for a sparkline feel, but its domain is set for correct scaling */}
            <YAxis
                domain={[0, 100]}
                tick={false} // Hides ticks
                axisLine={false} // Hides the axis line
                tickLine={false} // Hides tick lines
                width={0} // Effectively hides the axis space
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              cursor={{ stroke: 'hsl(var(--accent))', strokeOpacity: 0.5, strokeWidth: 1 }}
            />
            <Line
                type="monotone"
                dataKey="averageScore"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 1, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 5, strokeWidth: 2, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' }}
                name="Avg. Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
