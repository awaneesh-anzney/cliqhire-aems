"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Building2,
  Users2,
  DollarSign,
  ArrowRight,
  Copy,
  Check,
  Clock,
  User,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { JobStageBadge } from "@/components/jobs/job-stage-badge";
import { JobStage } from "@/types/job";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface JobCardItem {
  _id: string;
  jobId: string;
  jobTitle: string;
  jobType?: string;
  location?: string | string[];
  headcount?: number;
  stage?: string;
  salaryCurrency?: string;
  maximumSalary?: number;
  minimumSalary?: number;
  client?: { name?: string } | string;
  createdBy?: { name?: string } | string;
  createdAt?: string;
}

interface JobCardViewProps {
  jobs: JobCardItem[];
  selectedRows: Set<string>;
  onToggleSelect: (id: string) => void;
  onStageChange: (id: string, stage: JobStage) => void;
  canModify?: boolean;
  canDelete?: boolean;
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

export const JobCardView: React.FC<JobCardViewProps> = ({
  jobs,
  selectedRows,
  onToggleSelect,
  onStageChange,
  canModify = false,
  canDelete = false,
}) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied Job ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3 overflow-y-auto custom-scrollbar flex-1 min-h-0">
      {jobs.map((job) => {
        const isSelected = selectedRows.has(job._id);
        const clientName =
          typeof job.client === "object" ? job.client?.name : job.client || "—";
        const creatorName =
          typeof job.createdBy === "object"
            ? job.createdBy?.name
            : job.createdBy || "System";
        const locationStr = Array.isArray(job.location)
          ? job.location.join(", ")
          : job.location ?? "Global";

        return (
          <div
            key={job._id}
            onClick={() => router.push(`/jobs/${job._id}`)}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
              "bg-card/90 hover:bg-card hover:shadow-md hover:border-primary/40",
              isSelected
                ? "border-primary/60 bg-primary/[0.03] ring-1 ring-primary/20 shadow-xs"
                : "border-border/80"
            )}
          >
            {/* Top section */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  {canDelete && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-1"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(job._id)}
                        className="rounded-md border-border"
                      />
                    </div>
                  )}

                  {/* Job Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs bg-gradient-to-br",
                      getJobGradient(job.jobTitle)
                    )}
                  >
                    {getInitials(job.jobTitle)}
                  </div>

                  {/* Title and ID */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {job.jobTitle}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {job.jobId && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, job.jobId)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/60 transition-colors"
                        >
                          {copiedId === job.jobId ? (
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-60" />
                          )}
                          <span>{job.jobId}</span>
                        </button>
                      )}

                      {job.jobType && (
                        <span className="text-[10px] capitalize text-muted-foreground font-medium truncate">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Badge & Salary */}
              <div
                className="flex items-center justify-between gap-2 flex-wrap pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <JobStageBadge
                  stage={toJobStage(job.stage)}
                  onStageChange={(newStage) => onStageChange(job._id, newStage)}
                  disabled={!canModify}
                />

                {(job.maximumSalary || job.minimumSalary) && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/60 text-[11px] font-semibold text-foreground">
                    <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>
                      {job.salaryCurrency || "$"}
                      {job.maximumSalary ?? job.minimumSalary}
                    </span>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate text-[11px] font-medium text-foreground/80">
                    {clientName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate text-[11px] font-medium text-foreground/80">
                    {locationStr}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Users2 className="w-3.5 h-3.5 text-indigo-500/80 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/80">
                    {job.headcount ?? 1} Headcount
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/80 capitalize truncate">
                    {job.jobType || "Full-time"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Creator + View Link */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[130px]">
                <User className="w-3 h-3 shrink-0" />
                <span className="truncate">{creatorName}</span>
              </div>

              <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>View Job</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JobCardView;
