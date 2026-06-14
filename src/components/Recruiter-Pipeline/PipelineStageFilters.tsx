"use client";
import React from "react";
import { Layers } from "lucide-react";
import { pipelineStages, type Job } from "./dummy-data";
import { cn } from "@/lib/utils";

type Props = {
  job: Job;
  selectedStage: string | null;
  onSelectStage: (stage: string | null) => void;
};

export function PipelineStageFilters({ job, selectedStage, onSelectStage }: Props) {
  const stages = job.stages && job.stages.length > 0 ? job.stages : pipelineStages;

  return (
    <div className="flex flex-col gap-1.5 p-0">
      <div className="flex items-center gap-2 px-1">
        <Layers className="h-3.5 w-3.5 text-brand/80" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Stages
        </span>
      </div>

      {/* Responsive Horizontal Scroll Container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-none snap-x snap-mandatory">
        {/* All Filter */}
        <button
          onClick={() => onSelectStage(null)}
          className={cn(
            "inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer",
            !selectedStage 
              ? "bg-brand text-white border-brand shadow-sm shadow-brand/10" 
              : "bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
          )}
        >
          All Candidates
          <span className={cn(
            "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors shrink-0",
            !selectedStage ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
          )}>
            {job.totalCandidates ?? job.candidates.length}
          </span>
        </button>

        {/* Stage Specific Filters */}
        {stages.map((stage) => {
          const count = job.stageCounts?.[stage] || 0;
          const isActive = selectedStage === stage;
          
          return (
            <button
              key={stage}
              onClick={() => onSelectStage(isActive ? null : stage)}
              className={cn(
                "inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer",
                isActive 
                  ? "bg-brand text-white border-brand shadow-sm shadow-brand/10" 
                  : "bg-card text-foreground border-border hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {stage}
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors shrink-0",
                isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
