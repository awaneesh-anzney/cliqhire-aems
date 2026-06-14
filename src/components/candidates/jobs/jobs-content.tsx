"use client";
import React, { forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink } from "lucide-react";
import { api, initializeAuth } from "@/lib/axios-config";
import { mapBackendStageToUIStage } from "@/components/Recruiter-Pipeline/dummy-data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface JobsContentRef {
  addJobsToCandidate: (jobIds: string[], jobData?: any[]) => Promise<void>;
}

export interface JobsContentProps {
  candidateId: string;
  candidateName: string;
  onJobsUpdated?: () => void;
}

// Interface for the job application display (subset of Job data)
interface CandidateJobApplication {
  _id: string;
  jobId: string; // Actual job ID for navigation
  jobTitle: string;
  clientName: string;
  location: string;
  jobType: string;
  minimumSalary: string;
  maximumSalary: string;
  experience: string;
  stage: string;
}

export const JobsContent = forwardRef<JobsContentRef, JobsContentProps>(
  ({ candidateId, candidateName, onJobsUpdated }, ref) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const fetchCandidateJobs = async (): Promise<CandidateJobApplication[]> => {
      await initializeAuth();
      const response = await api.get(`/api/candidates/${candidateId}/jobs`);

      if (response.data?.status === "success" && Array.isArray(response.data?.data)) {
        const transformedJobs: CandidateJobApplication[] = await Promise.all(
          response.data.data.map(async (job: any, idx: number) => {
            let clientName = job.clientName ?? "";
            if (!clientName) {
              if (job.client && typeof job.client === "string") {
                try {
                  const clientResponse = await api.get(`/api/clients/${job.client}`);
                  if (clientResponse.data?.status === "success") {
                    clientName = clientResponse.data?.data?.name || job.client;
                  } else {
                    clientName = job.client;
                  }
                } catch (error) {
                  console.error("Error fetching client name:", error);
                  clientName = job.client;
                }
              } else if (job.client && typeof job.client === "object" && job.client.name) {
                clientName = job.client.name;
              }
            }

            const idCandidate =
              job._id || job.id || job.jobId || `${job.jobTitle || "job"}-${clientName || "client"}-${idx}`;
            const navId = job.jobId || job._id || job.id || "";

            return {
              _id: String(idCandidate),
              jobId: String(navId),
              jobTitle: job.jobTitle || job.title || "Untitled Job",
              clientName: clientName || "Unknown Client",
              location: job.location || "Remote",
              jobType: job.jobType || job.type || "Full-time",
              minimumSalary: (job.minimumSalary ?? "0").toString(),
              maximumSalary: (job.maximumSalary ?? "0").toString(),
              experience: job.experience || "Not specified",
              stage: mapBackendStageToUIStage(job.stage || job.currentStage || "Active"),
            };
          })
        );
        return transformedJobs;
      }
      return [];
    };

    const { data: candidateJobs = [], isLoading, refetch } = useQuery({
      queryKey: ["candidateJobs", candidateId],
      queryFn: fetchCandidateJobs,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Function to add new jobs to the candidate's job list
    const addJobsToCandidate = async (jobIds: string[], jobData?: any[]) => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["candidateJobs", candidateId] });
        if (onJobsUpdated) {
          onJobsUpdated();
        }
      } catch (error) {
        console.error("Error adding jobs to candidate:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      addJobsToCandidate,
    }));

    const getStageBadgeColor = (stage: string) => {
      const lowerStage = stage.toLowerCase();
      if (lowerStage.includes("reject")) return "bg-red-100 text-red-800 border-red-200";
      if (lowerStage.includes("offer") || lowerStage.includes("hired"))
        return "bg-green-100 text-green-800 border-green-200";
      if (lowerStage.includes("interview")) return "bg-purple-100 text-purple-800 border-purple-200";
      return "bg-blue-100 text-blue-800 border-blue-200";
    };

    const getJobTypeBadgeColor = (type: string) => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes("contract")) return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100";
      if (lowerType.includes("part")) return "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100";
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100";
    };

    const formatSalary = (min: string, max: string) => {
      const isZero = (val: string) => !val || val === "0" || val === "";
      if (isZero(min) && isZero(max)) return "Not Disclosed";
      if (isZero(max)) return `From $${min}`;
      if (isZero(min)) return `Up to $${max}`;
      return `$${min} - $${max}`;
    };

    return (
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand" />
              Applied Jobs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Jobs and pipelines that {candidateName} is associated with.
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm mt-2">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground py-4 w-[35%]">Job Details</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Client</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Compensation</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Status / Stage</TableHead>
                <TableHead className="text-right font-semibold text-foreground py-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <Skeleton className="h-9 w-24 ml-auto rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : candidateJobs.length > 0 ? (
                candidateJobs.map((job) => (
                  <TableRow
                    key={job._id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (job.jobId) {
                        router.push(`/jobs/${job.jobId}`);
                      }
                    }}
                  >
                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium text-base text-foreground group-hover:text-brand transition-colors line-clamp-1">
                          {job.jobTitle}
                        </span>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{job.experience}</span>
                          </div>
                          <Badge variant="secondary" className={`font-medium ${getJobTypeBadgeColor(job.jobType)}`}>
                            {job.jobType}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top">
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {job.clientName.substring(0, 1).toUpperCase() || "C"}
                        </div>
                        <span className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
                          {job.clientName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        {formatSalary(job.minimumSalary, job.maximumSalary)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="mt-1.5">
                        <Badge variant="outline" className={`font-semibold border shadow-sm ${getStageBadgeColor(job.stage)}`}>
                          {job.stage}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-right align-top">
                      <div className="mt-1 flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 border shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (job.jobId) {
                              router.push(`/jobs/${job.jobId}`);
                            }
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                          View Job
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-[350px] text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto gap-4">
                      <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-lg text-foreground tracking-tight">No Jobs Found</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                          This candidate has not applied to any jobs and is not part of any recruiter pipeline yet.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);

JobsContent.displayName = "JobsContent";
