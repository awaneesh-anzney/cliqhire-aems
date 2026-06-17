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
    <div className="relative flex w-full h-full min-h-[400px] flex-col items-center justify-center text-foreground overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Technical Spinner & Logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute h-[140px] w-[140px] rounded-full border-[1px] border-primary/20 border-t-primary border-r-primary animate-spin [animation-duration:2s]" />
          {/* Inner rotating ring */}
          <div className="absolute h-[110px] w-[110px] rounded-full border-[1px] border-blue-500/20 border-b-blue-500 border-l-blue-500 animate-spin [animation-duration:3s] [animation-direction:reverse]" />
          
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 text-white shadow-xl shadow-primary/30">
            <Layers className="h-7 w-7" />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Authenticating
          </h1>
          <div className="h-5 flex items-center justify-center overflow-hidden">
            <p className={cn(
              "text-sm font-medium text-muted-foreground transition-all duration-500",
              fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {LOADING_MESSAGES[messageIndex]}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
