"use client";

import React, { useEffect, useState } from 'react';
import { Route, Sparkles } from 'lucide-react';
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
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-8 text-center w-full max-w-md mx-auto animate-in fade-in duration-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated Logo Container */}
      <div className="relative mb-12">
        {/* Multi-layered Glow */}
        <div className="absolute inset-0 bg-brand/40 blur-[60px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full animate-pulse delay-700" />
        
        {/* Logo Card */}
        <div className="relative z-10 flex shrink-0 items-center justify-center rounded-[2.5rem] bg-brand p-8 text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] animate-bounce-slow">
          <Route className="h-16 w-16" />
          
          {/* Floating sparks */}
          <div className="absolute -top-4 -right-4 text-white animate-pulse">
            <Sparkles className="h-8 w-8 fill-white/20" />
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="mb-8 space-y-3">
        <h1 className="text-5xl font-black tracking-tight text-foreground leading-none">
          Cliqhire
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Recruitment OS</p>
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full" />
        </div>
      </div>

      {/* Message & Progress */}
      <div className="space-y-8 w-full max-w-[320px] relative z-10">
        <div className="h-6 flex items-center justify-center">
          <p className={cn(
            "text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] transition-all duration-500",
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="relative group">
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm border border-border/50">
            {/* Indeterminate loader effect */}
            <div className="absolute inset-0 bg-brand/5 w-full h-full" />
            <div 
              className="h-full bg-brand rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              style={{
                width: '40%',
                animation: 'loading-slide 2.5s infinite cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            />
          </div>
          
          {/* Decorative dots */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  messageIndex % 3 === i ? "bg-brand w-4 shadow-[0_0_8px_rgba(79,70,229,0.4)]" : "bg-muted w-1.5"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-slide {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(250%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
