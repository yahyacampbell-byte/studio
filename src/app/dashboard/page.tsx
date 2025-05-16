
"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IntelligenceChart } from '@/components/dashboard/IntelligenceChart';
import { PersonalizedInsightsDisplay } from '@/components/dashboard/PersonalizedInsightsDisplay';
import { useActivity } from '@/context/ActivityContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function DashboardPage() {
  const { isAuthenticated, isLoadingAuth } = useRequireAuth();
  const { activities, aiResults } = useActivity();

  const hasActivities = activities && activities.length > 0;
  const hasAIResults = aiResults && (aiResults.intelligenceScores.length > 0 || aiResults.personalizedInsights || aiResults.recommendations);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <Brain className="h-16 w-16 animate-pulse text-primary mb-4" />
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Cognitive Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress, understand your strengths, and discover areas for growth.
          </p>
        </div>

        {!hasActivities && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <AlertCircle className="mr-2 h-5 w-5" />
                Start Your Journey!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary/90">
                You haven't played any games yet. Go to the <Link href="/games" className="font-semibold underline hover:text-primary">Games section</Link> to start building your cognitive profile.
              </p>
            </CardContent>
          </Card>
        )}
        
        {hasActivities && !hasAIResults && (
           <Card className="border-accent/50 bg-accent/5">
           <CardHeader>
             <CardTitle className="flex items-center text-accent">
               <AlertCircle className="mr-2 h-5 w-5" />
               Next Step: Gain Insights
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-accent/90 mb-3">
               You've played some games! Now, head over to the <Link href="/insights" className="font-semibold underline hover:text-accent">My Insights page</Link> to analyze your activity and unlock personalized feedback.
             </p>
             <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/insights">Analyze My Activity</Link>
             </Button>
           </CardContent>
         </Card>
        )}

        {hasAIResults && (
             <Card className="border-secondary/50 bg-secondary/5">
             <CardHeader>
               <CardTitle className="flex items-center text-secondary">
                 <CheckCircle2 className="mr-2 h-5 w-5" />
                 Profile Analyzed!
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-secondary/90">
                 Your cognitive profile and personalized insights are ready below. Keep playing and re-analyzing to track your growth!
               </p>
             </CardContent>
           </Card>
        )}


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
                 <IntelligenceChart aiResults={aiResults} />
            </div>
            <div className="lg:col-span-2">
                <PersonalizedInsightsDisplay aiResults={aiResults} />
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
