"use client";

import { Loader, MapPin, Building2 } from "lucide-react";
import { getJobById } from "@/services/jobService";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { JobTabs } from "@/components/jobs/job-tabs";
import { JobData } from "@/components/jobs/types";
import { AddExistingCandidateDialog } from "@/components/common/add-existing-candidate-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInPostDialog } from "@/components/jobs/linkedin-post-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionContext";

interface PageProps {
  params: { id: string };
}

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
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    // Normalize API response to a single job object
    select: (res: any) =>
      (Array.isArray(res?.data) ? res.data[0] : res?.data) as JobData | undefined,
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center justify-center gap-2 flex-col">
          <Loader className="size-6 animate-spin" />
          <div className="text-center">Loading jobs...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        Error: {error instanceof Error ? error.message : "Failed to load job"}
      </div>
    );
  }

  if (!job) {
    return notFound();
  }

  if (!canViewJobs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          You do not have permission to view this job.
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["job", id] });
  };

  // Header values from summary
  const jobTitle = job.jobTitle || "Untitled Job";
  const location = Array.isArray(job.location)
    ? job.location.join(", ")
    : job.location || "No location";
  const stage = job.stage || "No stage";

  // Copy the stageColors mapping from JobStageBadge
  const stageColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-800",
    Sourcing: "bg-purple-100 text-purple-800",
    Screening: "bg-yellow-100 text-yellow-800",
    Interviewing: "bg-orange-100 text-orange-800",
    Shortlisted: "bg-indigo-100 text-indigo-800",
    Offer: "bg-pink-100 text-pink-800",
    Hired: "bg-green-100 text-green-800",
    "On Hold": "bg-muted text-foreground",
    Cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">{jobTitle}</h1>
                  <span className="text-xl text-muted-foreground font-medium font-mono">#{job.jobId}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={`${stageColors[stage] || "bg-muted text-foreground"} border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider`}
                >
                  {stage}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 group cursor-pointer hover:text-brand transition-colors">
                  <div className="p-1.5 bg-muted rounded-md group-hover:bg-brand/10 transition-colors">
                    <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
                  </div>
                  <span className="font-medium text-foreground">{job.client?.name || "Unknown Client"}</span>
                </div>

                <div className="flex items-center gap-2 group border-l border-border pl-6">
                  <div className="p-1.5 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>{location}</span>
                </div>


                <div className="flex items-center gap-2 border-l border-border pl-6">
                  <div className="p-1.5 bg-muted rounded-md">
                    <Loader className={`h-4 w-4 text-brand cursor-pointer hover:rotate-180 transition-transform duration-500 ${isLoading ? "animate-spin" : ""}`} onClick={handleRefresh} />
                  </div>
                  <span className="text-muted-foreground">Last updated: Just now</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LinkedInPostDialog job={job} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <JobTabs
        jobId={id}
        jobData={job}
        reloadToken={reloadToken}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canModify={canModifyJobs}
      />

      {/* Add Candidate Dialog (Existing Candidate selection) */}
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
