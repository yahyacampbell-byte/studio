
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Brain, LogIn, LogOut } from 'lucide-react';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from '@/context/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, logout, isLoadingAuth } = useAuth();

  const sidebarContent = (
    <ScrollArea className="h-full py-4">
      <div className="px-3 py-2">
        <div className="mb-4 flex items-center pl-2">
          <Brain className="h-8 w-8 mr-2 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {APP_NAME}
          </h2>
        </div>
        <div className="space-y-1">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.label}
              variant={pathname === link.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === link.href && "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
              asChild
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="mt-auto pt-4 px-2">
          {!isLoadingAuth && (
            isAuthenticated ? (
              <Button variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button variant="default" className="w-full justify-start" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden lg:block fixed top-0 left-0 z-40 w-64 h-screen border-r bg-card">
        {sidebarContent}
      </aside>
      <div className="flex flex-col flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-sm px-4 lg:px-6 lg:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <div className="hidden lg:flex items-center gap-2">
             {!isLoadingAuth && (
                isAuthenticated ? (
                <Button variant="ghost" onClick={logout} size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
                ) : (
                <Button asChild size="sm">
                    <Link href="/auth/login">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Link>
                </Button>
                )
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
