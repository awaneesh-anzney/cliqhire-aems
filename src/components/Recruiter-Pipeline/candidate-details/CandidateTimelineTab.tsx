"use client";

import React from "react";
import { 
  History, 
  Calendar, 
  User2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles
} from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeForDisplay } from "@/components/Recruiter-Pipeline/pipeline-stage-details/stage-fields";

interface CandidateTimelineTabProps {
  candidate: Candidate;
}

export function CandidateTimelineTab({ candidate }: CandidateTimelineTabProps) {
  const stageHistory = candidate.stageHistory || [];
  const rejectionHistory = candidate.rejectionHistory || [];
  const hasEvents = stageHistory.length > 0 || rejectionHistory.length > 0 || Boolean(candidate.appliedDate || candidate.addedAt);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-3.5 sm:p-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs tracking-tight uppercase">
            <History className="h-3.5 w-3.5 text-brand" />
            <span>Candidate Journey Timeline & Audit Trail</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0">
            {stageHistory.length + rejectionHistory.length} Event(s)
          </Badge>
        </div>

        {!hasEvents ? (
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-dashed border-border/70 bg-muted/20 text-center gap-1.5">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">No Timeline Events</p>
            <p className="text-[11px] text-muted-foreground">
              Stage transitions and actions will appear here as the candidate advances through the pipeline.
            </p>
          </div>
        ) : (
          <div className="relative pl-5 sm:pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/70">
            {/* 1. Rejection Events (if any) */}
            {rejectionHistory.map((rej, index) => (
              <div key={`rej-${index}`} className="relative group">
                <div className="absolute -left-5 sm:-left-6 top-1.5 h-4.5 w-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-background shadow-xs">
                  <XCircle className="h-3 w-3" />
                </div>

                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[9px] font-semibold uppercase px-1.5 py-0">
                        Disqualified
                      </Badge>
                      <span className="text-[11px] font-bold text-foreground">
                        Stage: {rej.stage}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {rej.rejectedAt ? formatDateTimeForDisplay(rej.rejectedAt) : "Date unknown"}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-0.5 text-foreground/90">
                    <p>
                      <strong className="text-foreground font-semibold">Reason:</strong>{" "}
                      {rej.rejectionReason || "No reason specified"}
                    </p>
                    {rej.feedback && (
                      <p className="text-muted-foreground italic">
                        <strong className="text-foreground font-semibold not-italic">Feedback:</strong>{" "}
                        {rej.feedback}
                      </p>
                    )}
                  </div>

                  {rej.rejectedBy && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-rose-500/10">
                      <User2 className="h-2.5 w-2.5" />
                      <span>Actioned by: <strong>{rej.rejectedBy.name}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 2. Stage Transition Events */}
            {stageHistory.map((entry, index) => (
              <div key={`hist-${index}`} className="relative group">
                <div className="absolute -left-5 sm:-left-6 top-1.5 h-4.5 w-4.5 rounded-full bg-brand text-white flex items-center justify-center border-2 border-background shadow-xs">
                  <CheckCircle2 className="h-3 w-3" />
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex flex-col gap-1.5 transition-all hover:bg-card hover:shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-[10px] font-bold px-1.5 py-0">
                        {entry.stage}
                      </Badge>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Status: <strong className="text-foreground">{entry.status || "Active"}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {entry.movedAt ? formatDateTimeForDisplay(entry.movedAt) : "Date recorded"}
                    </span>
                  </div>

                  {entry.notes && (
                    <div className="p-2 rounded-md bg-card border border-border/50 text-[11px] text-foreground/90 italic">
                      <span className="font-semibold text-foreground not-italic mr-1">Note:</span>
                      &quot;{entry.notes}&quot;
                    </div>
                  )}

                  {entry.movedBy && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                      <User2 className="h-2.5 w-2.5 text-muted-foreground" />
                      <span>Updated by: <strong className="text-foreground">{entry.movedBy.name}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 3. Candidate Application / Sourced Milestone */}
            {(candidate.appliedDate || candidate.addedAt) && (
              <div className="relative group">
                <div className="absolute -left-5 sm:-left-6 top-1.5 h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-background shadow-xs">
                  <Sparkles className="h-3 w-3" />
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold uppercase px-1.5 py-0">
                        Sourced & Attached
                      </Badge>
                      <span className="text-[11px] font-bold text-foreground">
                        Entered Recruitment Funnel
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDateTimeForDisplay(candidate.appliedDate || candidate.addedAt || "")}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Candidate profile connected to requisition via{" "}
                    <strong className="text-foreground font-semibold">{candidate.source || "Organic Pipeline"}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
