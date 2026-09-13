"use client";

import React from "react";
import { Briefcase, CheckCircle2, Clock, Users2, PauseCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobStatsBarProps {
  totalCount: number;
  jobs: Array<{
    stage?: string;
    headcount?: number;
  }>;
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  className?: string;
}

export const JobStatsBar: React.FC<JobStatsBarProps> = ({
  totalCount,
  jobs = [],
  selectedStage = "All",
  onSelectStage,
  className,
}) => {
  const counts = React.useMemo(() => {
    let openCount = 0;
    let activeCount = 0;
    let hiredCount = 0;
    let onHoldCount = 0;
    let closedCount = 0;
    let totalHeadcount = 0;

    jobs.forEach((j) => {
      if (j.stage === "Open") openCount++;
      else if (j.stage === "Active") activeCount++;
      else if (j.stage === "Hired") hiredCount++;
      else if (j.stage === "On Hold") onHoldCount++;
      else if (j.stage === "Closed") closedCount++;
      totalHeadcount += j.headcount || 1;
    });

    return { openCount, activeCount, hiredCount, onHoldCount, closedCount, totalHeadcount };
  }, [jobs]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 select-none",
        className
      )}
    >
      {/* All Jobs */}
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
        <span className="text-[11px] font-medium">All Jobs</span>
        <span className="px-1.5 py-0.2 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
          {totalCount}
        </span>
      </button>

      {/* Open */}
      <button
        type="button"
        onClick={() => onSelectStage && onSelectStage("Open")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedStage === "Open"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-medium">Open</span>
        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
          {counts.openCount}
        </span>
      </button>

      {/* Active */}
      <button
        type="button"
        onClick={() => onSelectStage && onSelectStage("Active")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedStage === "Active"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[11px] font-medium">Active</span>
        <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          {counts.activeCount}
        </span>
      </button>

      {/* Hired */}
      <button
        type="button"
        onClick={() => onSelectStage && onSelectStage("Hired")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedStage === "Hired"
            ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <span className="text-[11px] font-medium">Hired</span>
        <span className="px-1.5 py-0.2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold">
          {counts.hiredCount}
        </span>
      </button>

      {/* On Hold */}
      <button
        type="button"
        onClick={() => onSelectStage && onSelectStage("On Hold")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedStage === "On Hold"
            ? "bg-muted text-foreground border-border shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <PauseCircle className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium">On Hold</span>
      </button>

      {/* Headcount pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-card/70 text-xs text-muted-foreground shrink-0 ml-auto hidden sm:flex">
        <Users2 className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[11px] font-medium">Total Headcount:</span>
        <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
          {counts.totalHeadcount}
        </span>
      </div>
    </div>
  );
};

export default JobStatsBar;
