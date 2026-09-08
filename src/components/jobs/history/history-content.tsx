"use client";

import { useJobStageHistory } from "@/hooks/useJobs";
import { Loader2, Calendar, Clock, User, AlertCircle, History } from "lucide-react";
import { format } from "date-fns";
import { JobStageBadge } from "@/components/jobs/job-stage-badge";
import { JobStage } from "@/types/job";
import { Badge } from "@/components/ui/badge";

interface HistoryContentProps {
  jobId: string;
}

export function HistoryContent({ jobId }: HistoryContentProps) {
  const { data, isLoading, isError } = useJobStageHistory(jobId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-destructive gap-2">
        <AlertCircle className="h-6 w-6" />
        <p className="text-xs font-medium">Failed to load stage history.</p>
      </div>
    );
  }

  const historyData = data?.data || [];
  const totalDaysByStage = data?.totalDaysByStage || {};

  return (
    <div className="space-y-2.5">
      {/* Summary KPI chips of days per stage */}
      {Object.keys(totalDaysByStage).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(totalDaysByStage).map(([stage, days]) => (
            <div 
              key={stage} 
              className="bg-card border border-border/60 rounded-lg p-2 shadow-xs flex flex-col items-center justify-center text-center"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate w-full">
                {stage}
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {days as number} <span className="text-[10px] font-normal text-muted-foreground">days</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Card */}
      <div className="bg-card border border-border/70 rounded-xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border/60 bg-muted/25">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
            <History className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">Stage History & Audit Log</h3>
        </div>
        
        {/* Content */}
        <div className="p-3 sm:p-4">
          {historyData.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No stage history recorded yet.
            </div>
          ) : (
            <div className="relative border-l border-border/70 ml-2 space-y-4 pb-2">
              {historyData.map((item: any) => {
                const isActive = item.endedAt === null;
                
                return (
                  <div key={item._id} className="relative pl-5">
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                        isActive 
                          ? 'bg-primary border-primary/30' 
                          : 'bg-muted-foreground/50 border-card'
                      }`} 
                    />
                    
                    <div className="bg-muted/15 border border-border/40 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <JobStageBadge stage={item.stage as JobStage} disabled />
                          {isActive && (
                            <Badge 
                              variant="outline" 
                              className="text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border-primary/20 py-0 px-1.5"
                            >
                              Current Stage
                            </Badge>
                          )}
                        </div>

                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(item.startedAt), 'MMM d, yyyy · h:mm a')}
                        </span>
                      </div>
                      
                      {item.reason && (
                        <p className="text-xs text-foreground/80 italic bg-muted/30 p-2 rounded border border-border/30">
                          &quot;{item.reason}&quot;
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground/70" />
                          <span>
                            {item.changedBy 
                              ? `${item.changedBy.firstName || ""} ${item.changedBy.lastName || ""}`.trim() 
                              : "System"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          <span>{item.durationDays} day{item.durationDays !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
