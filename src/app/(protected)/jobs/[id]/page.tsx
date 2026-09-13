"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  Building2,
  RefreshCw,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Users,
  Calendar,
} from "lucide-react";

import { getJobById } from "@/services/jobService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobTabs } from "@/components/jobs/job-tabs";
import { JobData } from "@/components/jobs/types";
import { AddExistingCandidateDialog } from "@/components/common/add-existing-candidate-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInPostDialog } from "@/components/jobs/linkedin-post-dialog";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

// Subtle, modern semantic stage colors matching design tokens
const stageColors: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  Sourcing: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  Screening: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  Interviewing: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  Shortlisted: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  Offer: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  Hired: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  "On Hold": "bg-muted text-muted-foreground border-border/50",
  Cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

export default function JobPage({ params }: PageProps) {
  const { id } = params;
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewJobs = isAdmin || hasPermission("jobs", "view");
  const canModifyJobs = isAdmin || hasPermission("jobs", "edit");

  const queryClient = useQueryClient();
  const {
    data: job,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    select: (res: any) =>
      (Array.isArray(res?.data) ? res.data[0] : res?.data) as JobData | undefined,
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading job details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <p className="text-sm font-semibold text-destructive">
          Error: {error instanceof Error ? error.message : "Failed to load job"}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!job) {
    return notFound();
  }

  if (!canViewJobs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-sm text-muted-foreground">
          You do not have permission to view this job.
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["job", id] });
  };

  const jobTitle = job.jobTitle || "Untitled Job";
  const location = Array.isArray(job.location)
    ? job.location.join(", ")
    : job.location || "No location";
  const stage = job.stage || "No stage";

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Top Breadcrumbs & Header Bar */}
      <header className="border-b border-border/70 bg-card/75 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 transition-colors">
        {/* Navigation Breadcrumb Row */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 overflow-hidden">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium text-[11px]"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Jobs</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground font-semibold">
            #{job.jobId}
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="truncate text-foreground font-semibold text-[11px] max-w-[200px] sm:max-w-md">
            {jobTitle}
          </span>
        </div>

        {/* Main Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Title + Key Meta Chips */}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[280px] sm:max-w-md md:max-w-xl">
                {jobTitle}
              </h1>

              {/* Job ID Chip */}
              <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono font-semibold text-muted-foreground border border-border/60">
                #{job.jobId}
              </span>

              {/* Stage Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border",
                  stageColors[stage] || "bg-muted text-foreground border-border"
                )}
              >
                {stage}
              </Badge>

              {/* Headcount Chip */}
              {job.headcount && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 text-[10px] font-semibold text-muted-foreground border border-border/50">
                  <Users className="h-3 w-3 text-muted-foreground/70" />
                  <span>{job.headcount} pos</span>
                </span>
              )}
            </div>

            {/* Meta row: Client, Location, Refresh */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {/* Client Link */}
              {job.client?._id ? (
                <Link
                  href={`/clients/${job.client._id}`}
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors font-medium text-[11px] group"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="font-medium underline-offset-2 group-hover:underline">
                    {job.client?.name || "Client"}
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{job.client?.name || "Client"}</span>
                </span>
              )}

              <span className="text-border">•</span>

              {/* Location */}
              <div className="inline-flex items-center gap-1 text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[220px]">{location}</span>
              </div>

              <span className="text-border hidden sm:inline">•</span>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                type="button"
                className="inline-flex items-center gap-1 text-[11px] hover:text-foreground transition-colors group cursor-pointer"
                title="Refresh job data"
              >
                <RefreshCw
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-500 group-hover:text-foreground",
                    isFetching && "animate-spin text-primary"
                  )}
                />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <LinkedInPostDialog job={job} />
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <JobTabs
        jobId={id}
        jobData={job}
        reloadToken={reloadToken}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canModify={canModifyJobs}
      />

      {/* Add Existing Candidate Dialog */}
      <AddExistingCandidateDialog
        jobId={id}
        jobTitle={jobTitle}
        open={addCandidateOpen}
        onOpenChange={setAddCandidateOpen}
        onCandidatesAdded={async () => {
          setActiveTab("candidates");
          setReloadToken((t) => t + 1);
          await handleRefresh();
        }}
      />
    </div>
  );
}
