"use client";

import React from "react";
import { 
  MapPin, 
  Users, 
  Building2, 
  ChevronRight, 
  Briefcase, 
  Clock, 
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type Job } from "./dummy-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface PipelineJobCardProps {
  job: Job;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  showCheckbox?: boolean;
}

const STAGE_CONFIG: Record<string, { label: string; barColor: string; badgeColor: string }> = {
  sourcing: { 
    label: "Sourcing", 
    barColor: "bg-purple-500", 
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" 
  },
  screening: { 
    label: "Screening", 
    barColor: "bg-blue-500", 
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" 
  },
  clientScreening: { 
    label: "Client Review", 
    barColor: "bg-indigo-500", 
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800" 
  },
  interview: { 
    label: "Interview", 
    barColor: "bg-amber-500", 
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" 
  },
  verification: { 
    label: "Verification", 
    barColor: "bg-teal-500", 
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800" 
  },
  onboarding: { 
    label: "Onboarding", 
    barColor: "bg-orange-500", 
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" 
  },
  hired: { 
    label: "Hired", 
    barColor: "bg-emerald-500", 
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" 
  },
  disqualified: { 
    label: "Disqualified", 
    barColor: "bg-rose-400", 
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" 
  },
};

export function PipelineJobCard({ 
  job, 
  isHighlighted = false, 
  isSelected = false, 
  onSelect, 
  showCheckbox = false 
}: PipelineJobCardProps) {
  const router = useRouter();

  const stageCounts = job.stageCounts || {};
  const totalCandidates = job.totalCandidates ?? stageCounts.total ?? 0;
  const readableJobId = job.jobId?.jobId;

  // Active stages with counts > 0
  const activeStages = Object.entries(STAGE_CONFIG)
    .map(([key, config]) => ({
      key,
      label: config.label,
      count: (stageCounts as Record<string, number>)[key] || 0,
      barColor: config.barColor,
      badgeColor: config.badgeColor,
    }))
    .filter(stage => stage.count > 0);

  // Status Badge Helper
  const getPipelineStatusBadge = (status?: string) => {
    const cleanStatus = (status || "Open").toLowerCase();
    
    let style = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    let dotColor = "bg-slate-400";

    if (cleanStatus === "active") {
      style = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
      dotColor = "bg-blue-500 animate-pulse";
    } else if (cleanStatus === "onboarding") {
      style = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
      dotColor = "bg-purple-500";
    } else if (cleanStatus === "hired") {
      style = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      dotColor = "bg-emerald-500";
    } else if (cleanStatus === "on hold") {
      style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
      dotColor = "bg-amber-500";
    } else if (cleanStatus === "closed") {
      style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
      dotColor = "bg-rose-500";
    } else if (cleanStatus === "open") {
      style = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800";
      dotColor = "bg-sky-500";
    }

    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs", style)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
        {status || "Open"}
      </Badge>
    );
  };

  // Priority Badge Helper
  const getPriorityBadge = (priorityVal?: string) => {
    if (!priorityVal) return null;
    const cleanPriority = priorityVal.toLowerCase();
    
    let style = "bg-slate-50 text-slate-600 border-slate-200";
    if (cleanPriority === "high") {
      style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
    } else if (cleanPriority === "medium") {
      style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
    } else if (cleanPriority === "low") {
      style = "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }

    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", style)}>
        {priorityVal} Priority
      </Badge>
    );
  };

  const handleCardClick = () => {
    router.push(`/reactruterpipeline/${job.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border border-border/80 p-4 transition-all duration-300 cursor-pointer",
        "hover:shadow-md hover:border-brand/40 hover:-translate-y-0.5",
        isHighlighted && "ring-2 ring-brand/30 border-brand/40 bg-brand/[0.02]",
        isSelected && "bg-brand/[0.03] border-brand/50 ring-1 ring-brand/20"
      )}
    >
      {/* Interactive left status line */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top Header Row: Job title + ID + Status + Priority */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {showCheckbox && (
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={(checked) => onSelect?.(!!checked)} 
                className="h-4 w-4 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand cursor-pointer transition-all" 
              />
            </div>
          )}

          <div className="h-9 w-9 shrink-0 rounded-lg bg-brand/5 border border-brand/15 flex items-center justify-center text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <Briefcase className="h-4 w-4" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {readableJobId && (
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">
                  {readableJobId}
                </span>
              )}
              <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-brand transition-colors truncate max-w-[280px] sm:max-w-[400px]">
                {job.title}
              </h3>
            </div>

            {/* Client, Location & Job Type row */}
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1 font-semibold text-foreground/90">
                <Building2 className="h-3.5 w-3.5 text-brand shrink-0" />
                <span className="truncate max-w-[160px]">{job.clientName}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate max-w-[140px]">{job.location}</span>
              </div>
              {job.jobType && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted/60 px-1.5 py-0.2 rounded text-muted-foreground">
                    {job.jobType.replace("-", " ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badges & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            {getPriorityBadge(job.priority)}
            {getPipelineStatusBadge(job.pipelineStatus || job.jobId?.stage)}
          </div>
          <div className="h-8 w-8 rounded-lg bg-muted/30 border border-border/80 flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:bg-brand group-hover:text-white group-hover:border-brand shadow-xs">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* Mobile-only status chips */}
      <div className="flex sm:hidden items-center gap-1.5 mt-2.5 pl-12">
        {getPriorityBadge(job.priority)}
        {getPipelineStatusBadge(job.pipelineStatus || job.jobId?.stage)}
      </div>

      {/* Candidate Pipeline Funnel Progress Bar */}
      <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Layers className="h-3.5 w-3.5 text-brand" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Talent Distribution</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Users className="h-3.5 w-3.5 text-brand" />
            <span>{totalCandidates}</span>
            <span className="text-[10px] font-normal text-muted-foreground">candidates in pipeline</span>
          </div>
        </div>

        {/* Visual Segmented Bar */}
        {totalCandidates > 0 && activeStages.length > 0 ? (
          <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
            {activeStages.map((stage) => {
              const percentage = Math.max(5, Math.round((stage.count / totalCandidates) * 100));
              return (
                <Tooltip key={stage.key}>
                  <TooltipTrigger asChild>
                    <div 
                      style={{ width: `${(stage.count / totalCandidates) * 100}%` }}
                      className={cn(
                        "h-full transition-all duration-300 hover:opacity-85 cursor-pointer relative",
                        stage.barColor
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-semibold px-2 py-1 bg-card text-foreground border border-border shadow-md">
                    <span>{stage.label}: <b>{stage.count}</b> ({Math.round((stage.count / totalCandidates) * 100)}%)</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-2 rounded-full bg-muted/40 border border-dashed border-border flex items-center justify-center">
            <span className="sr-only">No active candidates in pipeline</span>
          </div>
        )}

        {/* Stage Pill Chips */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          {activeStages.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeStages.map(stage => (
                <span 
                  key={stage.key}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all",
                    stage.badgeColor
                  )}
                >
                  <span>{stage.label}</span>
                  <span className="font-extrabold bg-white/50 dark:bg-black/20 px-1 rounded-full">{stage.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground italic">
              No active candidates assigned yet
            </span>
          )}

          {job.headcount && job.headcount > 1 && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-auto">
              Target: <span className="text-foreground font-black">{job.headcount} Hires</span>
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
