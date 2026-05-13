"use client";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { JobStage } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Job } from "@/services/jobService";
import { Loader } from "lucide-react";
import { api, initializeAuth } from "@/lib/axios-config";
import { mapBackendStageToUIStage } from "@/components/Recruiter-Pipeline/dummy-data";

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
  const [candidateJobs, setCandidateJobs] = useState<CandidateJobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCandidateJobs = async () => {
    setLoading(true);
    try {
      // Ensure authentication is initialized
      await initializeAuth();
      
      const response = await api.get(`/api/candidates/${candidateId}/jobs`);
      
      if (response.data?.status === "success" && Array.isArray(response.data?.data)) {
        // Transform the API response to match our interface, preferring provided fields
        const transformedJobs: CandidateJobApplication[] = await Promise.all(
          response.data.data.map(async (job: any, idx: number) => {
            // Prefer clientName from API; only fallback if missing
            let clientName = job.clientName ?? "";
            if (!clientName) {
              if (job.client && typeof job.client === 'string') {
                try {
                  const clientResponse = await api.get(`/api/clients/${job.client}`);
                  if (clientResponse.data?.status === "success") {
                    clientName = clientResponse.data?.data?.name || job.client;
                  } else {
                    clientName = job.client; // Fallback to client ID if fetch fails
                  }
                } catch (error) {
                  console.error("Error fetching client name:", error);
                  clientName = job.client; // Fallback to client ID
                }
              } else if (job.client && typeof job.client === 'object' && job.client.name) {
                clientName = job.client.name;
              }
            }

            const idCandidate = job._id || job.id || job.jobId || `${job.jobTitle || 'job'}-${clientName || 'client'}-${idx}`;
            const navId = job.jobId || job._id || job.id || "";

            return {
              _id: String(idCandidate),
              jobId: String(navId),
              jobTitle: job.jobTitle || "",
              clientName: clientName,
              location: job.location || "",
              jobType: job.jobType || "",
              minimumSalary: (job.minimumSalary ?? "0").toString(),
              maximumSalary: (job.maximumSalary ?? "0").toString(),
              experience: job.experience || "",
              stage: mapBackendStageToUIStage(job.stage || ""),
            };
          })
        );
        
        setCandidateJobs(transformedJobs);
      } else {
        setCandidateJobs([]);
      }
    } catch (error) {
      console.error("Error fetching candidate jobs:", error);
      setCandidateJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to add new jobs to the candidate's job list
  const addJobsToCandidate = async (jobIds: string[], jobData?: any[]) => {
    try {
      // After adding jobs, refresh the list from the API to get the updated data
      await fetchCandidateJobs();
      
      if (onJobsUpdated) {
        onJobsUpdated();
      }
    } catch (error) {
      console.error("Error adding jobs to candidate:", error);
    }
  };

  useEffect(() => {
    fetchCandidateJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  useImperativeHandle(ref, () => ({
    addJobsToCandidate,
  }));

  return (
    <>
      <div className="border-b py-2 px-6 ">
        <div className="flex items-center">
          <div className="grid grid-cols-8 w-full text-sm font-medium text-muted-foreground ">
            {["Job Title", "Client", "Location", "Job Type", "Minimum Salary", "Maximum Salary", "Experience", "Stage"].map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 flex-col">
              <Loader className="size-6 animate-spin" />
              <div className="text-center">Loading candidate jobs...</div>
            </div>
          </div>
        ) : candidateJobs.length > 0 ? (
          candidateJobs.map((job) => (
            <div
              key={job._id}
              className="border-b hover:bg-muted py-3 px-4 cursor-pointer"
              onClick={() => {
                if (job.jobId) {
                  router.push(`/jobs/${job.jobId}`);
                }
              }}
            >
              <div className="flex items-center">
                <div className="grid grid-cols-8 w-full">
                  <div className="font-medium">{job.jobTitle}</div>
                  <div>{job.clientName}</div>
                  <div>{job.location}</div>
                  <div>{job.jobType}</div>
                  <div>{job.minimumSalary}</div>
                  <div>{job.maximumSalary}</div>
                  <div>{job.experience}</div>
                  <div>{job.stage}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No job applications found for this candidate.
          </div>
        )}
      </div>
    </>
  );
});

JobsContent.displayName = 'JobsContent';
