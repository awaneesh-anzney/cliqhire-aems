"use client";

import React from "react";
import { Layers, ChevronRight } from "lucide-react";
import { pipelineStages, type Job } from "./dummy-data";
import { cn } from "@/lib/utils";

type Props = {
  job: Job;
  selectedStage: string | null;
  onSelectStage: (stage: string | null) => void;
};

const STAGE_DOT_COLORS: Record<string, string> = {
  "Sourcing": "bg-purple-500",
  "Screening": "bg-blue-500",
  "Client Review": "bg-indigo-500",
  "Interview": "bg-amber-500",
  "Verification": "bg-teal-500",
  "Onboarding": "bg-orange-500",
  "Hired": "bg-emerald-500",
  "Disqualified": "bg-rose-500",
};

export function PipelineStageFilters({ job, selectedStage, onSelectStage }: Props) {
  const stages = job.stages && job.stages.length > 0 ? job.stages : pipelineStages;
  const totalCount = job.totalCandidates ?? job.candidates.length ?? 0;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 px-0.5 custom-scrollbar snap-x snap-mandatory">
      {/* All Candidates Pill */}
      <button
        onClick={() => onSelectStage(null)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer shadow-2xs",
          !selectedStage 
            ? "bg-brand text-white border-brand shadow-sm shadow-brand/20" 
            : "bg-card text-muted-foreground border-border/80 hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", !selectedStage ? "bg-white" : "bg-brand")} />
        <span>All Candidates</span>
        <span className={cn(
          "ml-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold transition-colors",
          !selectedStage ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
        )}>
          {totalCount}
        </span>
      </button>

      {/* Stage Specific Pills */}
      {stages.map((stage) => {
        const count = job.stageCounts?.[stage] || 0;
        const isActive = selectedStage === stage;
        const dotColor = STAGE_DOT_COLORS[stage] || "bg-slate-400";
        
        return (
          <button
            key={stage}
            onClick={() => onSelectStage(isActive ? null : stage)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer shadow-2xs",
              isActive 
                ? "bg-brand text-white border-brand shadow-sm shadow-brand/20" 
                : "bg-card text-foreground border-border/80 hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-white" : dotColor)} />
            <span>{stage}</span>
            <span className={cn(
              "ml-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold transition-colors shrink-0",
              isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
