
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, LogIn, LogOut, User as UserIconLucide } from 'lucide-react';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { useAuth, type User } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoadingAuth } = useAuth();

  const sidebarContent = (
    <ScrollArea className="h-full py-4">
      <div className="px-3 py-2">
        <div className="mb-4 flex items-center px-1"> {/* Adjusted padding */}
          <Image
            src="https://www.xillo.io/wp-content/uploads/2023/07/Xillo.svg"
            alt={`${APP_NAME} Logo`}
            data-ai-hint="logo"
            width={260} 
            height={64} 
            className="h-16 mr-1" // Changed h-8 to h-16 for 64px height
          />
          <h2 className="text-2xl font-semibold tracking-tight text-primary sr-only">
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
          {isLoadingAuth ? (
             <Button variant="outline" className="w-full justify-start" disabled>
                <LogIn className="mr-2 h-4 w-4" />
                Loading...
              </Button>
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-full justify-start"
              asChild
            >
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
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
              <SheetHeader> {/* Added SheetHeader */}
                <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {isLoadingAuth ? (
              <Button variant="ghost" size="sm" disabled>
                <UserIconLucide className="mr-2 h-5 w-5 animate-pulse" />
                Loading...
              </Button>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <UserIconLucide className="h-5 w-5" />
                    <span>{user.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <UserIconLucide className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center w-full cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
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
