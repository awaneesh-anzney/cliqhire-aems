"use client";
import React, { forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink } from "lucide-react";
import { api, initializeAuth } from "@/lib/axios-config";
import { mapBackendStageToUIStage } from "@/components/Recruiter-Pipeline/dummy-data";
import { useQuery } from "@tanstack/react-query";
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

interface CandidateJobApplication {
  _id: string;
  jobId: string;
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
    });

    useImperativeHandle(ref, () => ({
      addJobsToCandidate: async (jobIds: string[], jobData?: any[]) => {
        try {
          await initializeAuth();
          await api.post(`/api/candidates/${candidateId}/jobs`, { jobIds, jobData });
          refetch();
          if (onJobsUpdated) onJobsUpdated();
        } catch (error) {
          console.error("Error adding jobs to candidate:", error);
          throw error;
        }
      },
    }));

    const getStageBadgeColor = (stage: string) => {
      switch (stage.toLowerCase()) {
        case "active":
        case "screening":
          return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
        case "interview":
        case "client review":
          return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        case "offered":
        case "hired":
          return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        case "rejected":
        case "archived":
          return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
        default:
          return "bg-muted text-muted-foreground border-border/50";
      }
    };

    const getJobTypeBadgeColor = (jobType: string) => {
      switch (jobType.toLowerCase()) {
        case "full-time":
          return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        case "part-time":
          return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
        case "contract":
          return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        default:
          return "bg-muted text-muted-foreground border-border/50";
      }
    };

    const formatSalary = (min: string, max: string) => {
      const isZero = (val: string) => !val || val === "0";
      if (isZero(min) && isZero(max)) return "Not specified";
      if (isZero(max)) return `From $${min}`;
      if (isZero(min)) return `Up to $${max}`;
      return `$${min} - $${max}`;
    };

    return (
      <div className="w-full flex flex-col gap-2.5">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/70 bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">Applied Jobs</h3>
              <p className="text-[10px] text-muted-foreground font-medium">
                Jobs & pipelines linked to {candidateName} ({candidateJobs.length})
              </p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="font-semibold text-foreground py-2.5 text-xs w-[35%]">Job Details</TableHead>
                <TableHead className="font-semibold text-foreground py-2.5 text-xs">Client</TableHead>
                <TableHead className="font-semibold text-foreground py-2.5 text-xs">Compensation</TableHead>
                <TableHead className="font-semibold text-foreground py-2.5 text-xs">Stage</TableHead>
                <TableHead className="text-right font-semibold text-foreground py-2.5 text-xs pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/40">
                    <TableCell className="py-2.5">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-4">
                      <Skeleton className="h-7 w-20 ml-auto rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : candidateJobs.length > 0 ? (
                candidateJobs.map((job) => (
                  <TableRow
                    key={job._id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer border-b border-border/40"
                    onClick={() => {
                      if (job.jobId) {
                        router.push(`/jobs/${job.jobId}`);
                      }
                    }}
                  >
                    <TableCell className="py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {job.jobTitle}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <div className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground/70" />
                            <span className="truncate max-w-[120px]">{job.location}</span>
                          </div>
                          <span className="text-border">•</span>
                          <div className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground/70" />
                            <span>{job.experience}</span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-medium py-0 px-1.5 border ${getJobTypeBadgeColor(job.jobType)}`}>
                            {job.jobType}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {job.clientName.substring(0, 1).toUpperCase() || "C"}
                        </div>
                        <span className="font-medium text-xs text-foreground line-clamp-1">
                          {job.clientName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 align-middle">
                      <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {formatSalary(job.minimumSalary, job.maximumSalary)}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 align-middle">
                      <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider border py-0.5 px-2 ${getStageBadgeColor(job.stage)}`}>
                        {job.stage}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 text-right align-middle pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (job.jobId) {
                            router.push(`/jobs/${job.jobId}`);
                          }
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto gap-2">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-xs text-foreground">No Jobs Associated</h4>
                      <p className="text-[11px] text-muted-foreground">
                        This candidate has not been attached to any jobs or recruitment pipelines yet.
                      </p>
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
