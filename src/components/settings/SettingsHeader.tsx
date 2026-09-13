"use client";

import React from "react";
import { 
  Settings, 
  ShieldCheck, 
  Mail, 
  Building2, 
  GitBranch, 
  Shield, 
  Network, 
  Search, 
  X,
  CheckCircle2,
  SlidersHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTabTitle?: string;
  activeTab?: string;
}

const TAB_ICONS: Record<string, React.ElementType> = {
  roles: ShieldCheck,
  email: Mail,
  general: Building2,
  pipeline: GitBranch,
  security: Shield,
  integrations: Network,
};

export function SettingsHeader({
  searchQuery,
  onSearchChange,
  activeTabTitle,
  activeTab = "roles",
}: SettingsHeaderProps) {
  const displayTitle = activeTabTitle || activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  const TabIcon = TAB_ICONS[activeTab] || SlidersHorizontal;

  return (
    <div className="shrink-0 rounded-xl border border-border/80 bg-card shadow-xs px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Title, Active Tab Badge & Description */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-2xs">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                Settings & Configuration
              </h1>
              <Badge variant="outline" className="bg-brand/5 text-brand border-brand/20 text-[10px] font-semibold tracking-wide px-2 py-0 hidden xs:inline-flex">
                CliqHire AEMS
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-medium gap-1 px-2 py-0 border border-border/70">
                <TabIcon className="h-3 w-3 text-brand" />
                <span>{displayTitle}</span>
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Configure system roles, email delivery, pipeline preferences, and platform security
            </p>
          </div>
        </div>

        {/* Right: Quick Search & Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={`Search ${displayTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-7 h-8 text-xs bg-muted/40 border-border/80 rounded-lg focus-visible:ring-1 focus-visible:ring-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* System status pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
