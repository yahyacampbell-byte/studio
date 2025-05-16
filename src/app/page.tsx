
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart3, Lightbulb, LogIn } from 'lucide-react';
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
          <Image 
            src="https://www.xillo.io/wp-content/uploads/2023/07/Xillo.svg" 
            alt={`${APP_NAME} Logo`}
            data-ai-hint="logo"
            width={83} 
            height={20} 
            className="h-5" // Adjust height as needed, width will scale
          />
          <span className="ml-2 text-xl font-semibold sr-only">{APP_NAME}</span>
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
            <div className="grid gap-6 lg:grid-cols-1 lg:gap-12 xl:grid-cols-1"> {/* Adjusted grid for text-only hero */}
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Unlock Your True Cognitive Potential
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                    {APP_NAME} helps you understand your mind better. Play engaging cognitive games, track your progress, and discover your strengths across the 8 Multiple Intelligences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href={getLink("/games")}>Start Playing</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href={getLink("/dashboard")}>View My Dashboard</Link>
                  </Button>
                </div>
              </div>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2020 - {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="https://www.xillo.io/privacy-policy/" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false} target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </Link>
          <Link href="https://www.xillo.io/tdi-terms-conditions/" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false} target="_blank" rel="noopener noreferrer">
            Terms & Conditions
          </Link>
        </nav>
      </footer>
    </div>
  );
}

