"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useCandidateTracking } from "@/hooks/useCandidateTracking";
import { Loader2, AlertCircle, Building2, Briefcase, Activity, CalendarClock, ExternalLink, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CandidateTrackingContent({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useCandidateTracking(candidateId, { page, limit });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading tracking history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 bg-red-50/50 rounded-xl border border-red-100 dark:bg-red-950/10 dark:border-red-900/20 p-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {(error as Error)?.message || "Failed to load tracking data"}
        </p>
      </div>
    );
  }

  const pipelines = data?.data || [];
  const hireStatus = data?.candidateHireStatus;
  const pagination = data?.pagination;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "hired": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "rejected": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "on hold": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "sourcing": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      case "screening": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "interview": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "offer": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
      case "hired": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Global Hire Status Banner */}
      {hireStatus?.isHired && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Candidate is already Hired
            </h4>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              This candidate was hired on {hireStatus.hiredIn?.hiredAt ? new Date(hireStatus.hiredIn.hiredAt).toLocaleDateString() : "an unknown date"}. 
              They are locked and cannot be added to new pipelines.
            </p>
          </div>
        </div>
      )}

      {/* Pipeline List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {pipelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
            <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No tracking history</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This candidate has not been added to any pipelines yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pipelines.map((record) => (
              <div
                key={record.pipelineId}
                onClick={() => router.push(`/reactruterpipeline/${record.pipelineId}/candidate/${candidateId}/summary`)}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                {/* Left: Client & Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-foreground truncate">
                      {record.client?.name || "Unknown Client"}
                    </span>
                    <span className="text-muted-foreground/50 text-[10px]">•</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {record.client?.industry || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <h4 className="text-sm font-semibold text-primary truncate">
                      {record.job?.jobTitle || "Untitled Job"}
                    </h4>
                    {record.job?.jobId && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-mono font-bold">
                        {record.job.jobId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: Stage & Status */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 min-w-0 shrink-0">
                  <div className="flex flex-col gap-1 w-24">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Pipeline
                    </span>
                    <Badge variant="outline" className={`justify-center h-5 text-[10px] px-1.5 border ${getStatusColor(record.pipelineStatus)}`}>
                      {record.pipelineStatus}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 w-24">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Current Stage
                    </span>
                    <Badge variant="secondary" className={`justify-center h-5 text-[10px] px-1.5 border-transparent ${getStageColor(record.currentStage)}`}>
                      {record.currentStage}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 w-24">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Last Updated
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                      <CalendarClock className="h-3 w-3 text-muted-foreground" />
                      {record.lastUpdated ? formatDistanceToNow(new Date(record.lastUpdated), { addSuffix: true }) : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex items-center justify-end shrink-0 pl-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 rounded-full transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50 shrink-0">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="text-foreground">{(page - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(page * limit, pagination.totalItems)}</span> of <span className="text-foreground">{pagination.totalItems}</span> pipelines
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="h-8 px-3 text-xs"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold w-8 text-center">{page}</span>
              <span className="text-xs text-muted-foreground">/ {pagination.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
