"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  Layers 
} from "lucide-react";
import { type Job } from "./dummy-data";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface PipelineTableViewProps {
  jobs: Job[];
  selectedPipelines: string[];
  onSelectPipeline: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  showCheckbox?: boolean;
}

const STAGES_LIST = [
  { key: "sourcing", label: "Sourcing", barColor: "bg-purple-500" },
  { key: "screening", label: "Screening", barColor: "bg-blue-500" },
  { key: "clientScreening", label: "Review", barColor: "bg-indigo-500" },
  { key: "interview", label: "Interview", barColor: "bg-amber-500" },
  { key: "verification", label: "Verification", barColor: "bg-teal-500" },
  { key: "onboarding", label: "Onboarding", barColor: "bg-orange-500" },
  { key: "hired", label: "Hired", barColor: "bg-emerald-500" },
];

export function PipelineTableView({
  jobs,
  selectedPipelines,
  onSelectPipeline,
  onSelectAll,
  showCheckbox = false,
}: PipelineTableViewProps) {
  const router = useRouter();

  const isAllSelected = jobs.length > 0 && jobs.every(j => selectedPipelines.includes(j.id));
  const isSomeSelected = jobs.some(j => selectedPipelines.includes(j.id)) && !isAllSelected;

  const getStatusBadge = (status?: string) => {
    const cleanStatus = (status || "Open").toLowerCase();
    let style = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    let dotColor = "bg-slate-400";

    if (cleanStatus === "active") {
      style = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300";
      dotColor = "bg-blue-500 animate-pulse";
    } else if (cleanStatus === "onboarding") {
      style = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300";
      dotColor = "bg-purple-500";
    } else if (cleanStatus === "hired") {
      style = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300";
      dotColor = "bg-emerald-500";
    } else if (cleanStatus === "on hold") {
      style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300";
      dotColor = "bg-amber-500";
    } else if (cleanStatus === "closed") {
      style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300";
      dotColor = "bg-rose-500";
    } else if (cleanStatus === "open") {
      style = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300";
      dotColor = "bg-sky-500";
    }

    return (
      <Badge variant="outline" className={cn("text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs", style)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
        {status || "Open"}
      </Badge>
    );
  };

  const getPriorityBadge = (priorityVal?: string) => {
    if (!priorityVal) return null;
    const cleanPriority = priorityVal.toLowerCase();
    let style = "bg-slate-50 text-slate-600 border-slate-200";

    if (cleanPriority === "high") {
      style = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
    } else if (cleanPriority === "medium") {
      style = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
    }

    return (
      <Badge variant="outline" className={cn("text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", style)}>
        {priorityVal}
      </Badge>
    );
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              {showCheckbox && (
                <th className="py-3 px-4 w-10 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                    className="h-3.5 w-3.5 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  />
                </th>
              )}
              <th className="py-3 px-4 font-bold text-foreground">Requisition / Job Title</th>
              <th className="py-3 px-4 font-bold text-foreground">Client</th>
              <th className="py-3 px-4 font-bold text-foreground">Location & Type</th>
              <th className="py-3 px-4 font-bold text-foreground">Priority</th>
              <th className="py-3 px-4 font-bold text-foreground">Status</th>
              <th className="py-3 px-4 font-bold text-foreground min-w-[160px]">Funnel Distribution</th>
              <th className="py-3 px-4 font-bold text-foreground text-center">Candidates</th>
              <th className="py-3 px-4 font-bold text-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {jobs.map((job) => {
              const isSelected = selectedPipelines.includes(job.id);
              const readableJobId = job.jobId?.jobId;
              const stageCounts = job.stageCounts || {};
              const totalCandidates = job.totalCandidates ?? stageCounts.total ?? 0;

              const activeStages = STAGES_LIST.map((stage) => ({
                key: stage.key,
                label: stage.label,
                count: (stageCounts as Record<string, number>)[stage.key] || 0,
                barColor: stage.barColor,
              })).filter((s) => s.count > 0);

              return (
                <tr
                  key={job.id}
                  onClick={() => router.push(`/reactruterpipeline/${job.id}`)}
                  className={cn(
                    "group transition-colors cursor-pointer hover:bg-muted/30",
                    isSelected && "bg-brand/[0.02]"
                  )}
                >
                  {showCheckbox && (
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectPipeline(job.id, !!checked)}
                        className="h-3.5 w-3.5 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                      />
                    </td>
                  )}

                  {/* Requisition & Title */}
                  <td className="py-3 px-4 max-w-[260px]">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-brand/5 border border-brand/10 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-foreground group-hover:text-brand transition-colors truncate">
                          {job.title}
                        </span>
                        {readableJobId && (
                          <span className="font-mono text-[9px] font-semibold text-muted-foreground uppercase">
                            {readableJobId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                      <Building2 className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span className="truncate max-w-[140px]">{job.clientName}</span>
                    </div>
                  </td>

                  {/* Location & Type */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 text-foreground/80">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[120px]">{job.location}</span>
                      </div>
                      {job.jobType && (
                        <span className="text-[9.5px] uppercase font-bold text-muted-foreground/70">
                          {job.jobType.replace("-", " ")}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    {getPriorityBadge(job.priority)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {getStatusBadge(job.pipelineStatus || job.jobId?.stage)}
                  </td>

                  {/* Funnel distribution bar */}
                  <td className="py-3 px-4 min-w-[160px]">
                    {totalCandidates > 0 && activeStages.length > 0 ? (
                      <div className="flex flex-col gap-1 w-full max-w-[180px]">
                        <div className="h-2 rounded-full bg-muted/60 overflow-hidden flex shadow-2xs">
                          {activeStages.map((stage) => (
                            <Tooltip key={stage.key}>
                              <TooltipTrigger asChild>
                                <div
                                  style={{ width: `${(stage.count / totalCandidates) * 100}%` }}
                                  className={cn("h-full hover:opacity-80 transition-opacity", stage.barColor)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs font-semibold px-2 py-1 bg-card text-foreground border border-border shadow-md">
                                <span>{stage.label}: <b>{stage.count}</b></span>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold">
                          <span>{activeStages.length} active stages</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No candidates</span>
                    )}
                  </td>

                  {/* Total Candidates */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 font-bold text-xs">
                      <Users className="h-3 w-3" />
                      <span>{totalCandidates}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold text-brand hover:bg-brand/10 hover:text-brand rounded-md gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/reactruterpipeline/${job.id}`);
                      }}
                    >
                      <span>Open</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
