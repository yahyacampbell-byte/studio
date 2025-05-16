
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, BarChart3, Lightbulb, LogIn } from 'lucide-react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  const getLink = (path: string) => {
    if (isLoadingAuth) return "#"; // Or some loading indicator / disabled state
    return isAuthenticated ? path : '/auth/login';
  };


  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Brain className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold">{APP_NAME}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href={getLink("/dashboard")}
            className="text-sm font-medium hover:underline underline-offset-4 text-foreground/80"
            prefetch={false}
          >
            Dashboard
          </Link>
          <Link
            href={getLink("/games")}
            className="text-sm font-medium hover:underline underline-offset-4 text-foreground/80"
            prefetch={false}
          >
            Play Games
          </Link>
          {!isLoadingAuth && !isAuthenticated && (
            <Button asChild size="sm">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Unlock Your True Cognitive Potential
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {APP_NAME} helps you understand your mind better. Play engaging cognitive games, track your progress, and discover your strengths across the 8 Multiple Intelligences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href={getLink("/games")}>Start Playing</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href={getLink("/dashboard")}>View My Dashboard</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Hero Brain Activity"
                data-ai-hint="brain activity abstract"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How {APP_NAME} Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Engage your mind, discover your strengths, and foster continuous growth.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:items-stretch mt-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Zap className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Play Cognitive Games</CardTitle>
                  <CardDescription>
                    Choose from a variety of fun and challenging games designed to test different cognitive abilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <Image src="https://placehold.co/400x250.png" alt="Cognitive Games" data-ai-hint="brain games" width={400} height={250} className="rounded-md object-cover"/>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BarChart3 className="w-10 h-10 text-secondary mb-2" />
                  <CardTitle>Track Your Activity</CardTitle>
                  <CardDescription>
                    Your scores and playtime are automatically tracked, building a comprehensive profile of your cognitive performance.
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <Image src="https://placehold.co/400x250.png" alt="Activity Tracking" data-ai-hint="charts graphs" width={400} height={250} className="rounded-md object-cover"/>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Lightbulb className="w-10 h-10 text-accent mb-2" />
                  <CardTitle>Gain AI-Powered Insights</CardTitle>
                  <CardDescription>
                    Our AI analyzes your gameplay and maps it to the 8 Multiple Intelligences, offering personalized feedback.
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <Image src="https://placehold.co/400x250.png" alt="AI Insights" data-ai-hint="artificial intelligence brain" width={400} height={250} className="rounded-md object-cover"/>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          {/* <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Privacy
          </Link> */}
        </nav>
      </footer>
    </div>
  );
}
