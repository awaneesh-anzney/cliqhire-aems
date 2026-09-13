"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { cvSubmissionService } from "@/services/cvSubmissionService";
import { format } from "date-fns";
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  History,
  Loader2 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface JobCvSubmissionSummaryProps {
  jobId: string;
}

export function JobCvSubmissionSummary({ jobId }: JobCvSubmissionSummaryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cv-submission-job-summary", jobId],
    queryFn: () => cvSubmissionService.getJobSummary(jobId),
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-card border border-border/70 rounded-xl mb-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return null;
  }

  const summary = data.data;

  // Don't render if no CVs assigned
  if (summary.totalAssigned === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border/70 shadow-xs overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary">
            <Send className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">CV Submission SLA Summary</h4>
            <p className="text-[10px] text-muted-foreground font-medium">Internal to Client SLA tracking</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI: Total Assigned */}
        <div className="bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Assigned</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-foreground">{summary.totalAssigned}</span>
            <span className="text-[11px] text-muted-foreground">CVs</span>
          </div>
        </div>

        {/* KPI: On-Time Rate */}
        <div className="bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">On-Time Rate</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={cn(
              "text-lg sm:text-xl font-bold",
              summary.onTimePercentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : summary.onTimePercentage >= 50 ? "text-amber-600 dark:text-amber-400" : "text-destructive"
            )}>
              {summary.onTimePercentage}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {summary.onTimeCount} on time, {summary.lateCount} late
          </p>
        </div>

        {/* KPI: Currently Pending */}
        <div className="bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Currently Pending</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">{summary.currentlyPending}</span>
            <Clock className="h-3.5 w-3.5 text-amber-600/60 dark:text-amber-400/60" />
          </div>
        </div>

        {/* KPI: Currently Overdue */}
        <div className="bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Currently Overdue</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-destructive">{summary.currentlyOverdue}</span>
            <AlertTriangle className="h-3.5 w-3.5 text-destructive/60" />
          </div>
        </div>
      </div>

      {summary.delayReasons && summary.delayReasons.length > 0 && (
        <div className="px-3 pb-3">
          <div className="bg-muted/20 border border-border/50 rounded-lg p-2.5">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <History className="h-3 w-3" /> Recent Delay Reasons
            </h5>
            <ScrollArea className="h-[90px] pr-2">
              <div className="space-y-2">
                {summary.delayReasons.map((reasonItem: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-0.5 text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-foreground text-[11px]">{reasonItem.candidateName}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {format(new Date(reasonItem.at), "MMM dd, hh:mm a")}
                      </span>
                    </div>
                    <p className="text-muted-foreground bg-muted/40 p-1.5 rounded text-[11px] italic">
                      &quot;{reasonItem.reason}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
