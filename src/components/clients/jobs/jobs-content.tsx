
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
      <div className="border-b py-2 px-4">
        <div className="flex items-center">
          {/* <Checkbox id="selectAll" className="mr-4 border-border" /> */}
          <div className="grid grid-cols-7 w-full text-sm font-medium text-muted-foreground">
            {[
              "Position Name",
              "Job Type",
              "Location",
              "Headcount",
              "Stage",
              "Minimum Salary",
              "Maximum Salary",
            ].map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        {clientJobs && clientJobs.length > 0 ? (
          clientJobs.map((job) => (
            <div
              key={job._id}
              className="border-b hover:bg-muted py-3 px-4 cursor-pointer"
              onClick={() => router.push(`/jobs/${job._id}`)}
            >
              <div className="flex items-center">
                {/* <Checkbox id={`job-${job._id}`} className="mr-4 border-border" /> */}
                <div className="grid grid-cols-7  w-full px-0 mx-0">
                  <div className="font-medium">{job.jobTitle}</div>
                  <div className="capitalize">{job.jobType || "N/A"}</div>
                  <div>
                    {Array.isArray((job as any).location)
                      ? (job as any).location.join(", ")
                      : (job as any).location || "N/A"}
                  </div>
                  <div>{job.headcount}</div>
                  <div>
                    {(() => {
                      const displayStage: JobStage = (job.stage as JobStage) || "Open";
                      return (
                        <Badge
                          className={`${stageColors[displayStage]} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStageChange(job._id, displayStage);
                          }}
                        >
                          {displayStage}
                        </Badge>
                      );
                    })()}
                  </div>
                  <div>{job.minimumSalary}</div>
                  <div>{job.maximumSalary}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No jobs found. Create a new job requirement.
          </div>
        )}
      </div>

      <ConfirmStageChangeDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmStageChange}
      />
    </>
  );
}

