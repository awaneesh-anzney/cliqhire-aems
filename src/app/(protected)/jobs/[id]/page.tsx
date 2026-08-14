"use client";

import { Loader, MapPin, Building2, RefreshCw,Briefcase } from "lucide-react";
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
import Link from "next/link";

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

{/* Modern Clean Job Header */}
<header className="border-b border-emerald-900/10 bg-card/80 backdrop-blur-md px-6 py-4">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    {/* Left Side: Job Title & Key Metadata */}
    <div className="space-y-2">
      
      {/* Title + Icon + Job ID + Stage Badge */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Job Title with Icon & Vibrant Gradient Color (No Black) */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            {jobTitle}
          </h1>
        </div>

        {/* Job ID Badge */}
        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
          #{job.jobId}
        </span>

        {/* Stage Badge */}
        <Badge
          variant="secondary"
          className={`${
            stageColors[stage] || "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
          } border-none px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md`}
        >
          {stage}
        </Badge>
      </div>

      {/* Client + Location + Last Updated Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium pl-0.5">
        
        {/* Client Link */}
        <Link 
          href={`/clients/${job.client?._id}`}
          className="inline-flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 hover:text-emerald-600 transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{job.client?.name || "Unknown Client"}</span>
        </Link>

        <span className="text-emerald-900/20">•</span>

        {/* Location */}
        <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span>{location}</span>
        </div>

        <span className="text-emerald-900/20">•</span>

        {/* Refresh / Last Updated */}
        <button
          onClick={handleRefresh}
          type="button"
          className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors group cursor-pointer"
        >
          <RefreshCw 
            className={`h-3.5 w-3.5 text-emerald-600 group-hover:rotate-180 transition-transform duration-500 ${
              isLoading ? "animate-spin" : ""
            }`} 
          />
          <span>Updated: Just now</span>
        </button>

      </div>
    </div>

    {/* Right Side: Action Buttons */}
    <div className="flex items-center gap-3 shrink-0">
      <LinkedInPostDialog job={job} />
    </div>

  </div>
</header>

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
