"use client";

import React from "react";
import { TableCell } from "@/components/ui/table";
import { JobStageBadge } from "@/components/jobs/job-stage-badge";
import { JobStage } from "@/types/job";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Building2,
  Users2,
  DollarSign,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { JobCardItem } from "@/components/jobs/JobCardView";

interface JobTableRowProps {
  job: JobCardItem;
  onStageChange: (jobId: string, newStage: JobStage) => void;
  canModify?: boolean;
}

function getInitials(title: string = ""): string {
  const parts = title.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "JB";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getJobGradient(title: string = ""): string {
  const gradients = [
    "from-indigo-600 to-blue-600",
    "from-blue-600 to-cyan-600",
    "from-violet-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const toJobStage = (stage?: string): JobStage => {
  const validStages: JobStage[] = ["Open", "Hired", "On Hold", "Closed", "Active", "Onboarding"];
  return validStages.includes(stage as JobStage) ? (stage as JobStage) : "Open";
};

export const JobTableRow: React.FC<JobTableRowProps> = ({
  job,
  onStageChange,
  canModify = false,
}) => {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const clientName =
    typeof job.client === "object" ? job.client?.name : job.client || "—";
  const creatorName =
    typeof job.createdBy === "object"
      ? job.createdBy?.name
      : job.createdBy || "System";
  const locationStr = Array.isArray(job.location)
    ? job.location.join(", ")
    : job.location ?? "Global";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.jobId) return;
    navigator.clipboard.writeText(job.jobId);
    setCopied(true);
    toast.success(`Copied Job ID: ${job.jobId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Job ID */}
      <TableCell className="px-3 py-2.5">
        {job.jobId ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopyId}
                className="group/id inline-flex items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/70 px-1.5 py-0.5 rounded-md border border-border/50 transition-colors"
              >
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                )}
                <span className="truncate max-w-[80px]">{job.jobId}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
              Click to copy: {job.jobId}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Position Title + Avatar */}
      <TableCell className="px-3 py-2.5">
        <div
          onClick={() => router.push(`/jobs/${job._id}`)}
          className="cursor-pointer group/title flex items-center gap-2.5 max-w-[240px]"
        >
          {/* Initials Avatar */}
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-2xs bg-gradient-to-br",
              getJobGradient(job.jobTitle)
            )}
          >
            {getInitials(job.jobTitle)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground group-hover/title:text-primary transition-colors truncate">
                {job.jobTitle}
              </span>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 group-hover/title:text-primary transition-all shrink-0" />
            </div>
            {job.jobType && (
              <span className="text-[10px] text-muted-foreground capitalize font-medium">
                {job.jobType}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Client */}
      <TableCell className="px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 overflow-hidden max-w-[130px] cursor-help">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span className="text-xs font-medium text-foreground/80 truncate">
                {clientName}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {clientName !== "—" ? clientName : "No Client Specified"}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Location */}
      <TableCell className="px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 overflow-hidden max-w-[120px] cursor-help">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span className="text-xs font-medium text-foreground/80 truncate">
                {locationStr}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {locationStr}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Headcount */}
      <TableCell className="px-3 py-2.5 text-center">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/40 border border-border/70">
          <Users2 className="w-3 h-3 text-indigo-500 shrink-0" />
          <span className="text-[11px] font-semibold text-foreground">
            {job.headcount ?? 1}
          </span>
        </div>
      </TableCell>

      {/* Stage */}
      <TableCell className="px-3 py-2.5">
        <JobStageBadge
          stage={toJobStage(job.stage)}
          onStageChange={(newStage) => onStageChange(job._id, newStage)}
          disabled={!canModify}
        />
      </TableCell>

      {/* Salary Range */}
      <TableCell className="px-3 py-2.5 text-center">
        {job.maximumSalary || job.minimumSalary ? (
          <div className="flex flex-col items-center leading-none gap-0.5">
            <span className="text-xs font-semibold text-foreground">
              {job.salaryCurrency || "$"} {job.maximumSalary ?? job.minimumSalary}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
              Max Range
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Created By */}
      <TableCell className="px-3 py-2.5 text-right pr-4">
        <span className="text-xs font-medium text-muted-foreground block truncate max-w-[120px] ml-auto">
          {creatorName}
        </span>
      </TableCell>
    </>
  );
};

export default JobTableRow;
