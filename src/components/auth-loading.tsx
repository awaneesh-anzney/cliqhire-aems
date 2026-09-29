"use client";

import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOADING_MESSAGES = [
  "Securing your connection...",
  "Synchronizing your workspace...",
  "Loading your personalized dashboard...",
  "Preparing the Command Center...",
  "Almost there..."
];

export function AuthLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex w-full h-full min-h-[380px] flex-col items-center justify-center text-foreground overflow-hidden">
      {/* Soft ambient background glow */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary-soft/70 dark:bg-primary/5 blur-3xl animate-pulse [animation-duration:4s]" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Soft, Light Technical Spinner & Logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer gentle rotating ring */}
          <div className="absolute h-[116px] w-[116px] rounded-full border-[1.5px] border-primary-border/60 border-t-primary animate-spin [animation-duration:2.5s]" />
          {/* Inner gentle counter-rotating ring */}
          <div className="absolute h-[92px] w-[92px] rounded-full border-[1.5px] border-primary-soft border-b-primary/60 animate-spin [animation-duration:3.2s] [animation-direction:reverse]" />
          
          {/* Soft Centered Icon Badge */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft border border-primary-border text-primary shadow-xs transition-all duration-300">
            <Layers className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Text Area with Soft Pill */}
        <div className="flex flex-col items-center space-y-2.5 text-center max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft/90 border border-primary-border text-[11px] font-bold text-primary shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>Workspace Sync</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Loading Workspace
          </h2>

          <div className="h-5 flex items-center justify-center overflow-hidden">
            <p className={cn(
              "text-xs font-medium text-muted-foreground transition-all duration-500",
              fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}>
              {LOADING_MESSAGES[messageIndex]}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
