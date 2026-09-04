"use client";

import React from "react";
import { Settings, Shield, Mail, Sliders, Lock, Sparkles, Building2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SettingsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTabTitle?: string;
  activeTab?: string;
}

export function SettingsHeader({
  searchQuery,
  onSearchChange,
  activeTabTitle,
  activeTab,
}: SettingsHeaderProps) {
  const displayTitle = activeTabTitle || (activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : "Overview");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-brand/5 via-brand/[0.02] to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Title & Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-xs">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Settings & Configuration
              </h1>
              <Badge variant="outline" className="bg-brand/5 text-brand border-brand/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                CliqHire AEMS
              </Badge>
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-[10px] font-medium border-border px-2 py-0.5">
                {displayTitle}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Configure system roles, email delivery, pipeline preferences, and platform security
            </p>
          </div>
        </div>

        {/* Right Side: Quick Search */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search settings & roles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-muted/30 border-border/80 rounded-xl focus-visible:ring-brand/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
