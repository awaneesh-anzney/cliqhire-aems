"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  ArrowLeft,
  ArrowRight,
  Compass,
  Briefcase,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background Glow Elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[32rem] w-[48rem] rounded-full bg-gradient-to-tr from-primary/15 via-blue-500/10 to-indigo-500/15 blur-3xl opacity-60 dark:opacity-30" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl opacity-50 dark:opacity-20" />
        <div className="absolute bottom-10 right-[-5rem] h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl opacity-40 dark:opacity-15" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_30%,#000_60%,transparent_100%)]" />
      </div>

      {/* Top Header with Brand and Direct Home Redirect Link */}
      <header className="relative z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
            title="Go to Home"
          >
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 shadow-sm group-hover:border-primary/40 group-hover:bg-primary/15 transition-colors overflow-hidden">
              <Image
                src="/cliqhire-f.png"
                alt="CliqHire Logo"
                width={28}
                height={28}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                CliqHire
              </span>
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Talent System
              </span>
            </div>
          </Link>

          {/* Prominent Direct Home Redirect Link at Top Bar */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="default"
              size="sm"
              className="group shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg px-4 gap-2 transition-all hover:shadow-md"
            >
              <Link href="/">
                <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Go to Home Page</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8">
          
          {/* Badge & Number Visual */}
          <div className="relative inline-flex flex-col items-center">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shadow-sm mb-4 animate-in fade-in zoom-in-95 duration-500">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Error 404 &bull; Page Not Found</span>
            </div>

            {/* Giant Gradient 404 Display */}
            <div className="relative select-none">
              <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary via-blue-600 to-indigo-600 drop-shadow-sm">
                404
              </h1>
              {/* Floating decorative sparkles/icon badge */}
              <div className="absolute -top-2 -right-4 sm:-right-6 p-2 rounded-2xl bg-card border border-border/70 shadow-lg rotate-12 transition-transform hover:rotate-0">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Heading & Informational Description */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Oops! Page not found
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              Please verify the URL or use the navigation options below to get back on track.
            </p>

            {/* Attempted Path Indicator */}
            {mounted && pathname && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 text-muted-foreground text-xs font-mono border border-border/50 max-w-full truncate">
                  <Search className="h-3 w-3 shrink-0 opacity-60" />
                  <span className="opacity-75">Attempted route:</span>
                  <span className="font-semibold text-foreground truncate">{pathname}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Home & Back */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md hover:shadow-lg transition-all rounded-xl"
            >
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="font-medium px-6 rounded-xl border-border/80 hover:bg-muted/80 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>
          </div>

          {/* Quick Helpful Destinations Grid */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Or Explore Popular Sections
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link
                href="/dashboard"
                className="group p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Dashboard
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">System metrics & overview</div>
                </div>
              </Link>

              <Link
                href="/jobs"
                className="group p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Job Openings
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">Manage active listings</div>
                </div>
              </Link>

              <Link
                href="/candidates"
                className="group p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Candidates
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">Pipelines & talent pool</div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full py-4 border-t border-border/30 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} CliqHire ATS &bull; All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
