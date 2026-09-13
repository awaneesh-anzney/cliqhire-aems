"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  ArrowUpRight,
  FolderOpen,
  Sparkles,
  UserCheck,
  CheckCircle2,
  PauseCircle
} from "lucide-react";
import { type Job } from "./dummy-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PipelineBoardViewProps {
  jobs: Job[];
  selectedPipelines?: string[];
  onSelectPipeline?: (id: string, checked: boolean) => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  statuses: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "open",
    title: "Open Requisitions",
    statuses: ["open"],
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50/60 dark:bg-sky-950/20",
    borderColor: "border-sky-200 dark:border-sky-900/50",
    icon: FolderOpen,
  },
  {
    id: "active",
    title: "Active Sourcing",
    statuses: ["active"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/60 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/50",
    icon: Sparkles,
  },
  {
    id: "onboarding",
    title: "Offer & Onboarding",
    statuses: ["onboarding"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50/60 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-900/50",
    icon: UserCheck,
  },
  {
    id: "hired",
    title: "Hired & Closed",
    statuses: ["hired", "closed"],
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/50",
    icon: CheckCircle2,
  },
  {
    id: "hold",
    title: "On Hold",
    statuses: ["on hold"],
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/50",
    icon: PauseCircle,
  },
];

export function PipelineBoardView({ jobs }: PipelineBoardViewProps) {
  const router = useRouter();

  // Group jobs by column statuses
  const getJobsForColumn = (col: ColumnConfig) => {
    return jobs.filter((job) => {
      const rawStatus = (job.pipelineStatus || job.jobId?.stage || "open").toLowerCase().trim();
      return col.statuses.includes(rawStatus);
    });
  };

  const getPriorityBadge = (priorityVal?: string) => {
    if (!priorityVal) return null;
    const clean = priorityVal.toLowerCase();
    let style = "bg-slate-50 text-slate-600 border-slate-200";
    if (clean === "high") style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
    else if (clean === "medium") style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";

    return (
      <Badge variant="outline" className={cn("text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full", style)}>
        {priorityVal}
      </Badge>
    );
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className="flex gap-2.5 min-w-[1000px] items-start">
        {COLUMNS.map((col) => {
          const colJobs = getJobsForColumn(col);
          const IconComp = col.icon;

          return (
            <div
              key={col.id}
              className={cn(
                "flex-1 min-w-[240px] max-w-[300px] rounded-xl border flex flex-col bg-card/60 backdrop-blur-xs shadow-2xs",
                col.borderColor
              )}
            >
              {/* Column Header */}
              <div className={cn("px-3 py-2 rounded-t-xl border-b flex items-center justify-between", col.bgColor, col.borderColor)}>
                <div className="flex items-center gap-1.5">
                  <IconComp className={cn("h-3.5 w-3.5", col.color)} />
                  <span className="font-bold text-xs text-foreground tracking-tight">{col.title}</span>
                </div>
                <span className={cn("text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-card shadow-2xs border", col.borderColor, col.color)}>
                  {colJobs.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="p-2 flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                {colJobs.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground/60 text-xs font-semibold italic">
                    No requisitions
                  </div>
                ) : (
                  colJobs.map((job) => {
                    const totalCandidates = job.totalCandidates ?? job.stageCounts?.total ?? 0;
                    const readableJobId = job.jobId?.jobId;

                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(`/reactruterpipeline/${job.id}`)}
                        className="group bg-card rounded-lg border border-border p-2.5 hover:border-brand/40 hover:shadow-xs transition-all cursor-pointer flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex flex-col min-w-0 flex-1">
                            {readableJobId && (
                              <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase">
                                {readableJobId}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                              {job.title}
                            </h4>
                          </div>
                          <div className="h-6 w-6 rounded bg-muted/30 border border-border/80 flex items-center justify-center text-muted-foreground group-hover:bg-brand group-hover:text-white transition-all shrink-0">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                          <Building2 className="h-3 w-3 text-brand shrink-0" />
                          <span className="truncate">{job.clientName}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[100px]">{job.location}</span>
                          </div>
                          {getPriorityBadge(job.priority)}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/70 text-foreground font-bold text-[10px]">
                            <Users className="h-3 w-3 text-brand" />
                            <span>{totalCandidates}</span>
                            <span className="text-muted-foreground font-normal">candidates</span>
                          </div>

                          {job.jobType && (
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">
                              {job.jobType.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
