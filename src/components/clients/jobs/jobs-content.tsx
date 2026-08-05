
"use client";
import React, { useState, useEffect } from "react";
import { JobStage } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MapPin, Briefcase, IndianRupee, Layers, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Job, getJobs, updateJobById } from "@/services/jobService";
import { api, initializeAuth } from "@/lib/axios-config";

interface JobsContentProps {
  clientId: string;
  clientName: string;
  setJobsAvailable: (jobsAvailable: boolean) => void;
}

const jobStages: JobStage[] = [
  "Open",
  "Active",
  "Onboarding",
  "Hired",
  "On Hold",
  "Closed",
];

const stageColors: Record<JobStage, string> = {
  Open: "bg-blue-100 text-blue-800",
  Onboarding: "bg-purple-100 text-purple-800",
  Active: "bg-yellow-100 text-yellow-800",
  Hired: "bg-green-200 text-green-900",
  "On Hold": "bg-muted text-foreground",
  Closed: "bg-red-100 text-red-800",
};

function ConfirmStageChangeDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Stage Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to update the job stage? This action will be saved immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function JobsContent({ clientId, clientName, setJobsAvailable }: JobsContentProps) {
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState<{
    jobId: string;
    newStage: JobStage;
  } | null>(null);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      // Ensure authentication is initialized
      await initializeAuth();

      // 0) Prefer legacy endpoint if available
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
          console.debug('[JobsContent] Using legacy endpoint results:', legacyList.length);
          setClientJobs(legacyList);
          setJobsAvailable(true);
          return;
        }
      } catch (e) {
        // ignore and try modern endpoints
      }

      // Try server-side filter first
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
        if (r2 && Array.isArray(r2.jobs)) {
          jobsData = r2.jobs as Job[];
        } else if (r2 && r2.success && Array.isArray(r2.data)) {
          jobsData = r2.data as Job[];
        } else if (r2 && r2.data && Array.isArray(r2.data.jobs)) {
          jobsData = r2.data.jobs as Job[];
        } else if (r2 && r2.data && Array.isArray(r2.data.data)) {
          jobsData = r2.data.data as Job[];
        } else if (r2 && Array.isArray(r2.data)) {
          jobsData = r2.data as Job[];
        } else {
          jobsData = [];
        }

        // Filter by clientId supporting multiple shapes
        let filtered = jobsData.filter((job: any) => {
          const c = job.client;
          if (job.clientId && typeof job.clientId === 'string') {
            if (job.clientId === clientId) return true;
          }
          if (!c) return false;
          if (typeof c === 'string') return c === clientId;
          if (typeof c === 'object') {
            if (c._id && c._id === clientId) return true;
            if (c.id && c.id === clientId) return true;
          }
          return false;
        });

        // If still empty, try filtering by clientName
        if (!filtered.length && clientName) {
          const targetName = (clientName || '').toLowerCase().trim();
          filtered = jobsData.filter((job: any) => {
            const c = job.client;
            if (typeof c === 'object' && c?.name) {
              return String(c.name).toLowerCase().trim() === targetName;
            }
            return false;
          });
        }

        // If still empty after filtering by ID/name, try legacy endpoint
        if (!filtered.length) {
          try {
            const legacy = await api.get(`/api/jobs/client/${clientId}`);
            const r3: any = legacy || {};
            if (r3?.data?.status === 'success' && Array.isArray(r3?.data?.data)) {
              filtered = r3.data.data as Job[];
            } else if (Array.isArray(r3?.data?.jobs)) {
              filtered = r3.data.jobs as Job[];
            } else if (Array.isArray(r3?.data)) {
              filtered = r3.data as Job[];
            }
          } catch (e) {
            // ignore; will fall back to empty
          }
        }

        jobsData = filtered;
      }

      // Diagnostics
      console.debug('[JobsContent] clientId:', clientId, 'clientName:', clientName);
      console.debug('[JobsContent] jobs found:', jobsData?.length || 0);
      if ((jobsData?.length || 0) > 0) {
        console.debug('[JobsContent] sample job client field:', (jobsData as any)[0]?.client);
      }

      setClientJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setClientJobs([]);
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
      // Update local state immediately for better UX
      setClientJobs((prev) =>
        prev.map((job) => (job._id === jobId ? { ...job, stage: newStage } : job)),
      );

      // Ensure authentication is initialized
      await initializeAuth();

      // Make API call to update the stage
      await updateJobById(jobId, { stage: newStage });

      // Refresh jobs list for this client
      const response = await getJobs({ client: clientId, limit: 100 });
      if (response && Array.isArray((response as any).jobs)) {
        setClientJobs(((response as any).jobs) as Job[]);
      } else if (response && Array.isArray((response as any).data)) {
        // Fallback for alternative response shapes
        setClientJobs(((response as any).data) as Job[]);
      } else {
        setClientJobs([]);
      }
    } catch (error) {
      console.error("Error updating job stage:", error);
      // Revert the local state if the API call fails
      setClientJobs((prev) =>
        prev.map((job) => (job._id === jobId ? { ...job, stage: job.stage } : job)),
      );
    } finally {
      setPendingStageChange(null);
      setConfirmOpen(false);
    }
  };

  return (

<>
  {/* Excel Grid Container */}
  <div className="w-full overflow-x-auto rounded-lg border border-border/70 bg-card/50 shadow-sm">
    <table className="w-full text-left text-sm border-collapse">
      
      {/* Excel Sheet Header */}
      <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-border/70 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider select-none">
        <tr className="divide-x divide-border/70">
          <th className="py-2.5 px-3.5 font-semibold">Position Name</th>
          <th className="py-2.5 px-3.5 font-semibold">Job Type</th>
          <th className="py-2.5 px-3.5 font-semibold">Location</th>
          <th className="py-2.5 px-3.5 font-semibold text-center">Headcount</th>
          <th className="py-2.5 px-3.5 font-semibold">Stage</th>
          <th className="py-2.5 px-3.5 font-semibold">Min Salary</th>
          <th className="py-2.5 px-3.5 font-semibold">Max Salary</th>
        </tr>
      </thead>

      {/* Excel Sheet Cells (Divided Grid Lines) */}
      <tbody className="divide-y divide-border/70">
        {clientJobs && clientJobs.length > 0 ? (
          clientJobs.map((job) => {
            const displayStage: JobStage = (job.stage as JobStage) || "Open";

            return (
              <tr
                key={job._id}
                onClick={() => router.push(`/jobs/${job._id}`)}
                className="group divide-x divide-border/70 transition-colors hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 cursor-pointer"
              >
                {/* Position Name */}
                <td className="py-2.5 px-3.5 font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[200px]">{job.jobTitle}</span>
                  </div>
                </td>

                {/* Job Type */}
                <td className="py-2.5 px-3.5 text-xs text-slate-600 dark:text-slate-300 capitalize">
                  {job.jobType || "N/A"}
                </td>

                {/* Location */}
                <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 text-xs max-w-[150px] truncate" title={Array.isArray((job as any).location) ? (job as any).location.join(", ") : (job as any).location}>
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>
                      {Array.isArray((job as any).location)
                        ? (job as any).location.join(", ")
                        : (job as any).location || "N/A"}
                    </span>
                  </div>
                </td>

                {/* Headcount */}
                <td className="py-2.5 px-3.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span>{job.headcount || 0}</span>
                  </div>
                </td>

                {/* Stage Badge */}
                <td className="py-2.5 px-3.5">
                  <Badge
                    className={`${stageColors[displayStage]} cursor-pointer border-none shadow-none font-medium text-[11px] px-2 py-0.5 rounded`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStageChange(job._id, displayStage);
                    }}
                  >
                    {displayStage}
                  </Badge>
                </td>

                {/* Min Salary */}
                <td className="py-2.5 px-3.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {job.minimumSalary ? (
                    typeof job.minimumSalary === "number" ? (
                      `${job.minimumSalary.toLocaleString()}`
                    ) : (
                      job.minimumSalary
                    )
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>

                {/* Max Salary */}
                <td className="py-2.5 px-3.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {job.maximumSalary ? (
                    typeof job.maximumSalary === "number" ? (
                      `${job.maximumSalary.toLocaleString()}`
                    ) : (
                      job.maximumSalary
                    )
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          /* Empty State */
          <tr>
            <td colSpan={7} className="py-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="p-3 rounded-full bg-muted text-slate-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">No jobs posted yet</p>
                <p className="text-[11px] text-muted-foreground">Create a new job requirement to view it here.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Modal Dialog */}
  <ConfirmStageChangeDialog
    open={confirmOpen}
    onOpenChange={setConfirmOpen}
    onConfirm={confirmStageChange}
  />
</>
  );
}

