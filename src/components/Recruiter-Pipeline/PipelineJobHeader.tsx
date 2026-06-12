"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, HandCoins, MapPin, Plus, Users, Copy, Check, Download, Briefcase, User2, ShieldCheck, ChevronLeft } from "lucide-react";
import { type Job } from "./dummy-data";
import { ExportCandidatesDialog } from "./ExportCandidatesDialog";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  job: Job;
  onAddCandidate: () => void;
};

export function PipelineJobHeader({ job, onAddCandidate }: Props) {
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
      window.setTimeout(() => setIsFormLinkCopied(false), 5000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="relative overflow-hidden bg-card px-6 py-3 border-b border-border">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Back Button & Briefcase Icon */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="h-9 w-9 rounded-lg bg-muted/50 hover:bg-brand/10 hover:text-brand transition-all border border-border group shrink-0"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </Button>

            <div className="h-9 w-9 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>

          {/* Job Meta Section */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 
                className="text-lg font-bold text-foreground tracking-tight cursor-pointer hover:text-brand transition-colors truncate max-w-[320px]"
                onClick={() => job.jobId?._id && router.push(`/jobs/${job.jobId._id}`)}
              >
                {job.title}
              </h1>
              <div 
                onClick={() => {
                  const clientId = job.jobId?.client?._id || (typeof job.jobId?.client === 'string' ? job.jobId.client : null);
                  if (clientId) router.push(`/clients/${clientId}`);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted border border-border/80 text-[10px] font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-brand/5 hover:text-brand hover:border-brand/20 transition-all shrink-0"
              >
                <Building2 className="h-3 w-3" />
                <span>{job.clientName}</span>
              </div>
            </div>

            {/* Secondary Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>{job.location}</span>
              </div>
              <div className="h-3 w-px bg-border/80 hidden sm:block" />
              <div className="flex items-center gap-1">
                <HandCoins className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>{job.salaryRange || "Competitive"}</span>
              </div>
              <div className="h-3 w-px bg-border/80 hidden sm:block" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" />
                <span className="text-emerald-600 font-medium">{job.jobType}</span>
              </div>
              <div className="h-3 w-px bg-border/80 hidden sm:block" />
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-purple-500/80" />
                <span className="text-purple-600 font-medium">{job.totalCandidates || job.candidates.length} Candidates</span>
              </div>
              
              {/* Team Labels */}
              {job.jobTeamMembers && job.jobTeamMembers.length > 0 && (
                <>
                  <div className="h-3 w-px bg-border/80 hidden lg:block" />
                  <div className="flex items-center gap-3">
                    {job.jobTeamMembers.slice(0, 2).map((member: any) => (
                      <Tooltip key={member.position}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <div className="h-4 w-4 rounded bg-muted border border-border/80 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                              {member.position === 'hiringManager' ? 'HM' : 'RC'}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium max-w-[80px] truncate">
                              {member.users?.[0]?.firstName || 'Assignee'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
                          <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{member.positionLabel}</span>
                          <span>{member.users?.map((u: any) => u.name || u.email).join(", ")}</span>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Hub */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExportDialogOpen(true)}
            className="h-9 px-3 rounded-lg border-border text-xs font-semibold hover:bg-muted transition-all shadow-sm shrink-0 flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>Export</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyCandidateFormLink}
            className="h-9 px-3 rounded-lg border-border text-xs font-semibold hover:bg-muted transition-all shadow-sm shrink-0 flex items-center gap-2"
          >
            {isFormLinkCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{isFormLinkCopied ? "Copied" : "Form Link"}</span>
          </Button>
          <Button 
            onClick={onAddCandidate} 
            size="sm" 
            className="h-9 px-4 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold transition-all shadow-md shadow-brand/10 shrink-0 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
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
