"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  Download, 
  Briefcase, 
  ChevronLeft,
  RefreshCw,
  Sparkles,
  Layers,
  Coins
} from "lucide-react";
import { type Job } from "./dummy-data";
import { ExportCandidatesDialog } from "./ExportCandidatesDialog";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type Props = {
  job: Job;
  onAddCandidate: () => void;
  onRefresh?: () => void;
  isFetching?: boolean;
};

export function PipelineJobHeader({ job, onAddCandidate, onRefresh, isFetching }: Props) {
  const router = useRouter();
  const [isFormLinkCopied, setIsFormLinkCopied] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleCopyCandidateFormLink = async () => {
    const path = `${window.location.origin}/candidate?job=${encodeURIComponent(job.title)}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(path);
      } else {
        const ta = document.createElement("textarea");
        ta.value = path;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setIsFormLinkCopied(true);
      toast.success("Candidate application form link copied to clipboard!");
      window.setTimeout(() => setIsFormLinkCopied(false), 4000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

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
      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs", style)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
        {status || "Open"}
      </Badge>
    );
  };

  const readableJobId = job.jobId?.jobId;
  const clientId = job.jobId?.client?._id || (typeof job.jobId?.client === 'string' ? job.jobId.client : null);

  return (
    <div className="relative overflow-hidden bg-card px-4 py-2.5 border-b border-border/80">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative z-10">
        
        {/* Left: Return Button + Job Title & Meta Info */}
        <div className="flex items-start gap-2.5 min-w-0">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/reactruterpipeline')}
            className="h-8 w-8 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all border-border shadow-2xs group shrink-0 mt-0.5"
            title="Return to Pipelines"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </Button>

          <div className="flex flex-col min-w-0 gap-0.5">
            {/* Title Line */}
            <div className="flex items-center gap-2 flex-wrap">
              {readableJobId && (
                <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                  {readableJobId}
                </span>
              )}

              <h1 
                className="text-sm font-black text-foreground tracking-tight cursor-pointer hover:text-brand transition-colors truncate max-w-[280px] sm:max-w-[420px]"
                onClick={() => job.jobId?._id && router.push(`/jobs/${job.jobId._id}`)}
                title="View Job Details"
              >
                {job.title}
              </h1>

              {getPipelineStatusBadge(job.pipelineStatus || job.jobId?.stage)}

              {/* Client Badge */}
              <div 
                onClick={() => clientId && router.push(`/clients/${clientId}`)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/70 border border-border/70 text-[10px] font-bold text-foreground/80 cursor-pointer hover:bg-brand/10 hover:text-brand hover:border-brand/25 transition-all shrink-0"
              >
                <Building2 className="h-2.5 w-2.5 text-brand" />
                <span className="truncate max-w-[130px]">{job.clientName}</span>
              </div>
            </div>

            {/* Sub-Meta Row: Location, Salary, Type, Headcount, Team */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1 text-foreground/80">
                <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate max-w-[130px]">{job.location}</span>
              </div>

              {job.salaryRange && (
                <>
                  <span className="text-border">•</span>
                  <div className="flex items-center gap-1 text-foreground/80">
                    <Coins className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{job.salaryRange}</span>
                  </div>
                </>
              )}

              {job.jobType && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-muted/60 px-1.5 py-0.2 rounded text-muted-foreground">
                    {job.jobType.replace("-", " ")}
                  </span>
                </>
              )}

              {job.headcount && job.headcount > 0 && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Target: <b className="text-foreground">{job.headcount} Hires</b>
                  </span>
                </>
              )}

              {/* Team Members Tag */}
              {job.jobTeamMembers && job.jobTeamMembers.length > 0 && (
                <>
                  <span className="text-border hidden sm:inline">•</span>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {job.jobTeamMembers.slice(0, 2).map((member: any) => (
                      <Tooltip key={member.position}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-[10px] bg-muted/40 border border-border/60 px-1.5 py-0.2 rounded-md cursor-help">
                            <span className="font-extrabold text-brand uppercase text-[8.5px]">
                              {member.position === 'hiringManager' ? 'HM' : 'RC'}:
                            </span>
                            <span className="text-muted-foreground font-semibold truncate max-w-[70px]">
                              {member.users?.[0]?.firstName || 'Assignee'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs font-semibold px-2 py-1 bg-card text-foreground border border-border shadow-md">
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">{member.positionLabel}</span>
                          <span>{member.users?.map((u: any) => u.name || u.firstName || u.email).join(", ")}</span>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap self-end lg:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 px-2.5 rounded-lg border-border hover:bg-muted font-bold text-xs shadow-2xs flex items-center gap-1"
              title="Refresh Pipeline"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", isFetching && "animate-spin text-brand")} />
              <span className="hidden sm:inline">Sync</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExportDialogOpen(true)}
            className="h-8 px-2.5 rounded-lg border-border hover:bg-muted font-bold text-xs shadow-2xs flex items-center gap-1"
            title="Export candidate list"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyCandidateFormLink}
            className="h-8 px-2.5 rounded-lg border-border hover:bg-muted font-bold text-xs shadow-2xs flex items-center gap-1"
            title="Copy Candidate Application Form Link"
          >
            {isFormLinkCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">{isFormLinkCopied ? "Copied" : "Form Link"}</span>
          </Button>

          <Button 
            onClick={onAddCandidate} 
            size="sm" 
            className="h-8 px-3 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-sm shadow-brand/20 flex items-center gap-1.5 transition-all active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      <ExportCandidatesDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        pipelineId={job.id}
        jobTitle={job.title}
      />
    </div>
  );
}
