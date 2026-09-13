"use client";

import React, { useState, useEffect, useMemo } from "react";
import { JobStage } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Briefcase, Users, Search, ArrowUpRight, DollarSign, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Job, getJobs, updateJobById } from "@/services/jobService";
import { api, initializeAuth } from "@/lib/axios-config";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface JobsContentProps {
  clientId: string;
  clientName: string;
  setJobsAvailable: (jobsAvailable: boolean) => void;
}

const STAGE_FILTERS: (JobStage | "All")[] = [
  "All",
  "Open",
  "Active",
  "Onboarding",
  "Hired",
  "On Hold",
  "Closed",
];

const stageStyles: Record<string, string> = {
  Open: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Onboarding: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Hired: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  "On Hold": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Closed: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function JobsContent({ clientId, clientName, setJobsAvailable }: JobsContentProps) {
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<JobStage | "All">("All");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState<{
    jobId: string;
    newStage: JobStage;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      await initializeAuth();

      // 1. Try legacy endpoint first
      try {
        const legacy = await api.get(`/api/jobs/client/${clientId}`);
        const rLegacy: any = legacy || {};
        const legacyList = Array.isArray(rLegacy?.data?.data)
          ? (rLegacy.data.data as Job[])
          : Array.isArray(rLegacy?.data?.jobs)
            ? (rLegacy.data.jobs as Job[])
            : Array.isArray(rLegacy?.data)
              ? (rLegacy.data as Job[])
              : [];
        if (legacyList.length > 0) {
          setClientJobs(legacyList);
          setJobsAvailable(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // Continue to modern endpoints
      }

      // 2. Try server-side filter
      const responseWithFilter = await getJobs({ client: clientId, clientId: clientId, limit: 200 });
      let jobsData: Job[] = [];
      const r1: any = responseWithFilter || {};
      if (r1 && Array.isArray(r1.jobs)) {
        jobsData = r1.jobs as Job[];
      } else if (r1 && r1.success && Array.isArray(r1.data)) {
        jobsData = r1.data as Job[];
      } else if (r1 && r1.data && Array.isArray(r1.data.jobs)) {
        jobsData = r1.data.jobs as Job[];
      } else if (r1 && r1.data && Array.isArray(r1.data.data)) {
        jobsData = r1.data.data as Job[];
      } else if (r1 && Array.isArray(r1.data)) {
        jobsData = r1.data as Job[];
      }

      if (!jobsData || jobsData.length === 0) {
        // Fallback: fetch all and filter client-side
        const responseAll = await getJobs({ limit: 500 });
        const r2: any = responseAll || {};
        const allJobs = r2.jobs || r2.data || [];
        const filtered = allJobs.filter((job: any) => {
          const c = job.client;
          if (job.clientId && job.clientId === clientId) return true;
          if (!c) return false;
          if (typeof c === "string") return c === clientId;
          if (typeof c === "object") {
            if (c._id && c._id === clientId) return true;
            if (c.id && c.id === clientId) return true;
          }
          return false;
        });
        jobsData = filtered;
      }

      setClientJobs(jobsData || []);
      setJobsAvailable((jobsData?.length || 0) > 0);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setClientJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [clientId]);

  const handleStageChange = (jobId: string, newStage: JobStage) => {
    setPendingStageChange({ jobId, newStage });
    setConfirmOpen(true);
  };

  const confirmStageChange = async () => {
    if (!pendingStageChange) return;
    const { jobId, newStage } = pendingStageChange;
    try {
      setClientJobs((prev) =>
        prev.map((job) => (job._id === jobId ? { ...job, stage: newStage } : job)),
      );
      await initializeAuth();
      await updateJobById(jobId, { stage: newStage });
    } catch (error) {
      console.error("Error updating job stage:", error);
      fetchJobs();
    } finally {
      setPendingStageChange(null);
      setConfirmOpen(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return clientJobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobType?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = selectedStage === "All" || job.stage === selectedStage;
      return matchesSearch && matchesStage;
    });
  }, [clientJobs, searchQuery, selectedStage]);

  const formatSalary = (min?: number | string, max?: number | string) => {
    if (!min && !max) return null;
    const formatNum = (val: any) => (typeof val === "number" ? val.toLocaleString() : val);
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `From ${formatNum(min)}`;
    return `Up to ${formatNum(max)}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Stage Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {STAGE_FILTERS.map((st) => {
            const count =
              st === "All"
                ? clientJobs.length
                : clientJobs.filter((j) => j.stage === st).length;
            const isSelected = selectedStage === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStage(st)}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                )}
              >
                <span>{st}</span>
                <span
                  className={cn(
                    "text-[10px] px-1 rounded-md",
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4">Position Title</th>
              <th className="py-3 px-4">Job Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">Headcount</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Salary Range</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const displayStage = job.stage || "Open";
                const salaryStr = formatSalary(job.minimumSalary, job.maximumSalary);
                const locStr = Array.isArray((job as any).location)
                  ? (job as any).location.join(", ")
                  : (job as any).location || "N/A";

                return (
                  <tr
                    key={job._id}
                    onClick={() => router.push(`/jobs/${job._id}`)}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Briefcase className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate max-w-[240px] group-hover:text-primary transition-colors">
                          {job.jobTitle}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground capitalize">
                      {job.jobType || "Full-time"}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1 truncate max-w-[160px]" title={locStr}>
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{locStr}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-xs font-semibold text-foreground">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{job.headcount || 1}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold text-xs border px-2 py-0.5",
                          stageStyles[displayStage] || "bg-muted text-foreground border-border",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageChange(job._id, displayStage as JobStage);
                        }}
                      >
                        {displayStage}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                      {salaryStr || <span className="text-muted-foreground/40">—</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                        title="View Job Details"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {searchQuery ? "No matching jobs found" : "No jobs posted yet"}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {searchQuery
                        ? "Try adjusting your search keywords or filter stage."
                        : "Create a job requirement for this client to start tracking candidates."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid (Shown only on small screens) */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const displayStage = job.stage || "Open";
            const salaryStr = formatSalary(job.minimumSalary, job.maximumSalary);
            const locStr = Array.isArray((job as any).location)
              ? (job as any).location.join(", ")
              : (job as any).location || "N/A";

            return (
              <div
                key={job._id}
                onClick={() => router.push(`/jobs/${job._id}`)}
                className="bg-card rounded-xl border border-border/70 p-4 shadow-2xs space-y-3 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{job.jobTitle}</h4>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{job.jobType || "Full-time"}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold text-xs border px-2 py-0.5 shrink-0",
                      stageStyles[displayStage] || "bg-muted text-foreground",
                    )}
                  >
                    {displayStage}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1 truncate max-w-[160px]">
                    <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{locStr}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{job.headcount || 1} Headcount</span>
                  </div>
                </div>

                {salaryStr && (
                  <div className="text-xs font-mono text-muted-foreground">
                    Salary: <span className="font-semibold text-foreground">{salaryStr}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No jobs found</p>
          </div>
        )}
      </div>

      {/* Confirm Stage Change Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stage Change</AlertDialogTitle>
            <AlertDialogDescription>
              Update the job stage to{" "}
              <span className="font-bold text-foreground">{pendingStageChange?.newStage}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStageChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
