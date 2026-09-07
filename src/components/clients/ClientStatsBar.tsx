"use client";

import React from "react";
import { Building2, Users, Briefcase, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientStatsBarProps {
  totalCount: number;
  clients: Array<{
    clientStage: "Lead" | "Engaged" | "Signed";
    clientSubStage?: string;
    jobCount?: number;
  }>;
  moduleType?: "clients" | "leads";
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  className?: string;
}

export const ClientStatsBar: React.FC<ClientStatsBarProps> = ({
  totalCount,
  clients = [],
  moduleType = "clients",
  selectedStage = "All",
  onSelectStage,
  className,
}) => {
  const isLeads = moduleType === "leads";

  // Calculate quick metrics from loaded clients
  const stageCounts = React.useMemo(() => {
    let leadCount = 0;
    let engagedCount = 0;
    let signedCount = 0;
    let totalJobs = 0;

    clients.forEach((c) => {
      if (c.clientStage === "Lead") leadCount++;
      else if (c.clientStage === "Engaged") engagedCount++;
      else if (c.clientStage === "Signed") signedCount++;
      totalJobs += c.jobCount || 0;
    });

    return { leadCount, engagedCount, signedCount, totalJobs };
  }, [clients]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 select-none",
        className
      )}
    >
      {/* Total Records Pill */}
      <button
        type="button"
        onClick={() => onSelectStage && onSelectStage("All")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedStage === "All"
            ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-medium">All {isLeads ? "Leads" : "Clients"}</span>
        <span className="px-1.5 py-0.2 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
          {totalCount}
        </span>
      </button>

      {isLeads ? (
        <>
          {/* Lead Stage Pill */}
          <button
            type="button"
            onClick={() => onSelectStage && onSelectStage("Lead")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              selectedStage === "Lead"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs"
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-medium">New Leads</span>
            <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              {stageCounts.leadCount}
            </span>
          </button>

          {/* Engaged Stage Pill */}
          <button
            type="button"
            onClick={() => onSelectStage && onSelectStage("Engaged")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              selectedStage === "Engaged"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs"
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium">Engaged</span>
            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
              {stageCounts.engagedCount}
            </span>
          </button>
        </>
      ) : (
        <>
          {/* Signed Clients Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-card/70 text-xs text-muted-foreground shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">Signed Contracts</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              {totalCount}
            </span>
          </div>
        </>
      )}

      {/* Jobs Metric Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-card/70 text-xs text-muted-foreground shrink-0 ml-auto hidden sm:flex">
        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[11px] font-medium">Page Jobs:</span>
        <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
          {stageCounts.totalJobs}
        </span>
      </div>
    </div>
  );
};

export default ClientStatsBar;
