"use client";

import { useJobStageHistory } from "@/hooks/useJobs";
import { Loader2, Calendar, Clock, User, AlertCircle, History } from "lucide-react";
import { format } from "date-fns";
import { JobStageBadge } from "@/components/jobs/job-stage-badge";
import { JobStage } from "@/types/job";

interface HistoryContentProps {
  jobId: string;
}

export function HistoryContent({ jobId }: HistoryContentProps) {
  const { data, isLoading, isError } = useJobStageHistory(jobId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-rose-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Failed to load history.</p>
      </div>
    );
  }

  const historyData = data?.data || [];
  const totalDaysByStage = data?.totalDaysByStage || {};

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      
      {/* Summary Cards */}
      {Object.keys(totalDaysByStage).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(totalDaysByStage).map(([stage, days]) => (
            <div key={stage} className="bg-card border border-border rounded-xl p-3 shadow-sm flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">{stage}</span>
              <span className="text-lg font-black text-foreground">{days as number} <span className="text-xs font-medium text-muted-foreground">days</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-foreground tracking-tight">Stage History</h2>
        </div>
        
        {historyData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No history available.</div>
        ) : (
          <div className="relative border-l border-border ml-3 space-y-8 pb-4">
            {historyData.map((item: any) => {
              const isActive = item.endedAt === null;
              
              return (
                <div key={item._id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${isActive ? 'bg-emerald-500 border-emerald-200' : 'bg-muted-foreground border-card'}`} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <JobStageBadge stage={item.stage as JobStage} disabled />
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Current Stage
                          </span>
                        )}
                      </div>
                      
                      {item.reason && (
                        <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3 mt-2">
                          "{item.reason}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                        {item.changedBy ? (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{item.changedBy.firstName} {item.changedBy.lastName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>System</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(item.startedAt), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.durationDays} days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground sm:text-right whitespace-nowrap bg-muted/30 px-2 py-1 rounded-md">
                      {format(new Date(item.startedAt), 'h:mm a')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
