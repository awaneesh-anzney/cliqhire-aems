"use client";

import React from "react";
import { MapPin, Users, Building2, ChevronRight, Briefcase } from "lucide-react";
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

export function PipelineJobCard({ 
  job, 
  isHighlighted = false, 
  isSelected = false, 
  onSelect, 
  showCheckbox = false 
}: PipelineJobCardProps) {
  const router = useRouter();

  // Extract stage counts
  const stageCounts = job.stageCounts || {};
  
  // Create stage badges list containing only stages with candidates > 0
  const activeStages = [
    { label: 'Sourcing',      count: stageCounts.sourcing || 0,        colorClass: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/50' },
    { label: 'Screening',     count: stageCounts.screening || 0,       colorClass: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/50' },
    { label: 'Client Review',  count: stageCounts.clientScreening || 0, colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/50' },
    { label: 'Interview',     count: stageCounts.interview || 0,       colorClass: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/50' },
    { label: 'Verification',  count: stageCounts.verification || 0,    colorClass: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-300 dark:border-teal-900/50' },
    { label: 'Onboarding',    count: stageCounts.onboarding || 0,      colorClass: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-900/50' },
    { label: 'Hired',         count: stageCounts.hired || 0,           colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/50' },
    { label: 'Disqualified',  count: stageCounts.disqualified || 0,   colorClass: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/50' },
  ].filter(stage => stage.count > 0);

  // Priority styling helper
  const getPriorityBadge = (priorityVal?: string) => {
    if (!priorityVal) return null;
    const cleanPriority = priorityVal.toLowerCase();
    
    let styles = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300";
    if (cleanPriority === "high") {
      styles = "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900";
    } else if (cleanPriority === "medium") {
      styles = "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900";
    } else if (cleanPriority === "low") {
      styles = "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900";
    }

    return (
      <Badge variant="outline" className={cn("text-[8.5px] px-1.5 py-0 rounded font-bold uppercase tracking-wider", styles)}>
        {priorityVal}
      </Badge>
    );
  };

  const readableJobId = job.jobId?.jobId;
  const totalCandidates = job.totalCandidates ?? stageCounts.total ?? 0;

  return (
    <div
      onClick={() => router.push(`/reactruterpipeline/${job.id}`)}
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center justify-between bg-card rounded-lg border border-border px-4 py-2.5 cursor-pointer transition-all duration-300 gap-3",
        "hover:bg-muted/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-brand/25",
        isHighlighted ? "ring-1 ring-brand/35 bg-brand/[0.01] border-brand/30" : "",
        isSelected ? "bg-brand/[0.01] border-brand/20" : ""
      )}
    >
      {/* Interactive left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Checkbox + Job details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showCheckbox && (
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked) => onSelect?.(!!checked)} 
              className="h-3.5 w-3.5 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand shadow-sm cursor-pointer" 
            />
          </div>
        )}

        {/* Icon container */}
        <div className="h-8 w-8 shrink-0 rounded bg-muted/40 border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:bg-brand/5 group-hover:text-brand shadow-sm">
          <Briefcase className="h-4.5 w-4.5" />
        </div>

        {/* Meta Info */}
        <div className="flex flex-col min-w-0 gap-0.5 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {readableJobId && (
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                {readableJobId}
              </span>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-xs font-bold text-foreground tracking-tight group-hover:text-brand transition-colors truncate max-w-[200px] sm:max-w-[300px]">
                  {job.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg bg-card text-foreground border border-border font-semibold text-[11px] shadow-md px-2.5 py-1">
                {job.title}
              </TooltipContent>
            </Tooltip>

            {job.jobId?.stage && (
              <Badge variant="secondary" className="text-[8.5px] px-1 py-0 rounded bg-muted/50 text-muted-foreground/80 font-bold uppercase tracking-wider border border-border/60">
                {job.jobId.stage}
              </Badge>
            )}

            {getPriorityBadge(job.priority)}
          </div>

          {/* Client & Location in single bulleted line */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold flex-wrap">
            <span className="text-foreground/80 hover:text-brand transition-colors truncate max-w-[120px]">{job.clientName}</span>
            <span className="text-muted-foreground/45 font-normal">•</span>
            <span className="truncate max-w-[100px]">{job.location}</span>
            {job.jobType && (
              <>
                <span className="text-muted-foreground/45 font-normal">•</span>
                <span className="uppercase text-[8.5px] font-bold text-muted-foreground/60">{job.jobType.replace("-", " ")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Stages & Total count */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 pl-11 md:pl-0">
        
        {/* Candidates Stage Breakdown */}
        {activeStages.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeStages.map(stage => (
              <div 
                key={stage.label}
                className={cn("inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full border text-[8.5px] font-bold uppercase tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.01)]", stage.colorClass)}
              >
                <span>{stage.label}:</span>
                <span className="font-extrabold">{stage.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest italic pr-1">
            No active candidates
          </span>
        )}

        {/* Total Candidates Badge & Action button inline */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 shadow-sm text-xs font-black">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{totalCandidates}</span>
          </div>

          <div className="h-7 w-7 rounded bg-muted/20 border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:bg-brand group-hover:text-white group-hover:border-brand shadow-sm">
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

    </div>
  );
}
