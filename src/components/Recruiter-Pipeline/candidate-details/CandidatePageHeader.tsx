"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { type Candidate, type Job } from "@/components/Recruiter-Pipeline/dummy-data";
import { PipelineStageBadge } from "@/components/Recruiter-Pipeline/pipeline-stage-badge";
import { StatusBadge } from "@/components/Recruiter-Pipeline/status-badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CandidatePageHeaderProps {
  candidate: Candidate;
  job?: Job | null;
  pipelineId: string;
  onStageChange?: (candidate: Candidate, newStage: string) => void;
  onStatusChange?: (candidate: Candidate, newStatus: string) => void;
  canModify?: boolean;
}

export function CandidatePageHeader({
  candidate,
  job,
  pipelineId,
  onStageChange,
  onStatusChange,
  canModify = true,
}: CandidatePageHeaderProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const stagesWithStatus = [
    "Sourcing",
    "Screening",
    "Client Review",
    "Interview",
    "Verification",
    "Onboarding",
  ];

  const jobTitle = job?.title || job?.jobId?.jobTitle || job?.jobPosition || "Requisition Pipeline";
  const initials = candidate.name
    ? candidate.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CA";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs p-3 sm:p-3.5 transition-all">
      {/* Soft Decorative Ambient Background */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left Side: Avatar & Candidate Identity */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            {/* Avatar with Status Indicator Ring */}
            <div className="relative shrink-0 group">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border/60 shadow-xs ring-1 ring-border/50 transition-all duration-300 group-hover:scale-105">
                <AvatarImage src={candidate.avatar} alt={candidate.name} className="object-cover" />
                <AvatarFallback className="rounded-xl text-sm font-bold bg-brand/10 text-brand uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center shadow-xs",
                  candidate.status === "Disqualified" ? "bg-rose-500" : "bg-emerald-500"
                )}
                title={candidate.status === "Disqualified" ? "Disqualified" : "Active in Pipeline"}
              >
                <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Candidate Name, Role & Meta */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1
                  onClick={() => {
                    if (!candidate.isTempCandidate && candidate.id) {
                      router.push(`/candidates/${candidate.id}`);
                    }
                  }}
                  className={cn(
                    "text-base sm:text-lg font-bold tracking-tight text-foreground transition-colors",
                    !candidate.isTempCandidate && "hover:text-brand cursor-pointer"
                  )}
                  title={!candidate.isTempCandidate ? "Click to view master profile" : undefined}
                >
                  {candidate.name || "Anonymous Candidate"}
                </h1>

                {candidate.isTempCandidate ? (
                  <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0">
                    Temp Lead
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-[9px] font-medium border-border/70 px-1.5 py-0">
                    ID: {candidate.id?.slice(-6) || "N/A"}
                  </Badge>
                )}
              </div>

              {/* Position, Company & Source */}
              <div className="flex flex-wrap items-center gap-y-0.5 gap-x-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1 text-foreground font-medium">
                  <Briefcase className="h-3 w-3 text-brand shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {candidate.currentJobTitle || "Independent Professional"}
                  </span>
                </div>

                {(candidate.currentCompanyName || candidate.previousCompanyName) && (
                  <>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {candidate.currentCompanyName || candidate.previousCompanyName}
                      </span>
                    </div>
                  </>
                )}

                {candidate.source && (
                  <>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{candidate.source}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Contact Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {candidate.email && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/70 text-[10px] text-muted-foreground hover:text-foreground transition-colors group/chip">
                    <Mail className="h-2.5 w-2.5 text-brand/80 shrink-0" />
                    <a href={`mailto:${candidate.email}`} className="hover:underline truncate max-w-[180px]">
                      {candidate.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(candidate.email!, "Email")}
                      className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded transition-colors"
                      title="Copy email"
                    >
                      {copiedField === "Email" ? (
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                )}

                {candidate.phone && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/70 text-[10px] text-muted-foreground hover:text-foreground transition-colors group/chip">
                    <Phone className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-mono text-[10px]">
                      {formatPhoneNumber(candidate.phone, candidate.countryCode)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(candidate.phone!, "Phone")}
                      className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded transition-colors"
                      title="Copy phone number"
                    >
                      {copiedField === "Phone" ? (
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                )}

                {candidate.location && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/70 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 text-rose-500/80 shrink-0" />
                    <span className="truncate max-w-[140px]">{candidate.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Stage Controls & Actions */}
          <div className="flex flex-wrap lg:flex-col lg:items-end justify-between items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
            {/* Interactive Stage & Status Pickers */}
            <div className="flex items-center gap-1.5">
              <div className="scale-90 origin-right">
                <PipelineStageBadge
                  stage={candidate.currentStage}
                  onStageChange={
                    canModify && onStageChange
                      ? (newStage: string) => onStageChange(candidate, newStage)
                      : undefined
                  }
                />
              </div>

              {stagesWithStatus.includes(candidate.currentStage) && (
                <div className="scale-90 origin-right">
                  <StatusBadge
                    status={candidate.status as any}
                    stage={candidate.currentStage}
                    onStatusChange={
                      canModify && onStatusChange
                        ? (newStatus: string) => onStatusChange(candidate, newStatus)
                        : undefined
                    }
                  />
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              {candidate.resume && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(candidate.resume, "_blank")}
                  className="h-7 px-2.5 rounded-lg border-border/80 text-[11px] font-semibold hover:bg-muted transition-all shadow-xs"
                >
                  <FileText className="h-3 w-3 mr-1 text-brand" />
                  Resume
                  <ExternalLink className="h-2.5 w-2.5 ml-1 text-muted-foreground" />
                </Button>
              )}

              {pipelineId && !candidate.isTempCandidate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/reactruterpipeline/${pipelineId}/candidate/${candidate.id}/summary`)
                  }
                  className="h-7 px-2.5 rounded-lg border-border/80 text-[11px] font-semibold hover:bg-muted transition-all shadow-xs group"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500 group-hover:scale-110 transition-transform" />
                  Journey
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
