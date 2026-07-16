"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { cvSubmissionService } from "@/services/cvSubmissionService";
import { format } from "date-fns";
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  History,
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center justify-center p-8 bg-card border border-border rounded-xl mb-6">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !data?.data) {
    return null; // Don't show if there's an error or no data
  }

  const summary = data.data;

  // Don't render the widget if no CVs have been assigned yet
  if (summary.totalAssigned === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between p-5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Send className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">CV Submission SLA Summary</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Internal to Client SLA tracking</p>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total Assigned */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Assigned</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{summary.totalAssigned}</span>
            <span className="text-xs text-muted-foreground font-medium">CVs</span>
          </div>
        </div>

        {/* KPI: On-Time Rate */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">On-Time Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              "text-2xl font-bold",
              summary.onTimePercentage >= 80 ? "text-emerald-600" : summary.onTimePercentage >= 50 ? "text-amber-600" : "text-red-600"
            )}>
              {summary.onTimePercentage}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {summary.onTimeCount} on time, {summary.lateCount} late
          </p>
        </div>

        {/* KPI: Currently Pending */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Currently Pending</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{summary.currentlyPending}</span>
            <Clock className="h-4 w-4 text-amber-600/50" />
          </div>
        </div>

        {/* KPI: Currently Overdue */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Currently Overdue</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{summary.currentlyOverdue}</span>
            <AlertTriangle className="h-4 w-4 text-red-600/50" />
          </div>
        </div>
      </div>

      {summary.delayReasons && summary.delayReasons.length > 0 && (
        <div className="px-5 pb-5">
          <div className="bg-muted/20 border border-border rounded-xl p-4">
            <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Recent Delay Reasons
            </h5>
            <ScrollArea className="h-[120px] pr-4">
              <div className="space-y-3">
                {summary.delayReasons.map((reasonItem: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-foreground">{reasonItem.candidateName}</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                        {format(new Date(reasonItem.at), "MMM dd, hh:mm a")}
                      </span>
                    </div>
                    <p className="text-muted-foreground bg-muted/50 p-2 rounded-lg italic">
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
