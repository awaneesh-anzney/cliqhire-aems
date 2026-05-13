"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, Plus } from "lucide-react";
import { Candidate } from "@/services/candidateService";
import { Button } from "@/components/ui/button";
import { AddExistingCandidateDialog } from "@/components/common/add-existing-candidate-dialog";
import { api } from "@/lib/axios-config";
import { initializeAuth } from "@/lib/axios-config";

export interface JobCandidatesListRef {
  refresh: () => Promise<void>;
}

export function getCandidateDisplayName(candidate: Candidate) {
  const name = candidate.name || "Unknown Candidate";
  const title = candidate.currentJobTitle ? ` - ${candidate.currentJobTitle}` : "";
  return `${name}${title}`;
}

interface JobCandidatesListProps {
  jobId: string;
  jobTitle?: string;
  reloadToken?: number;
  onLoaded?: (count: number) => void;
}

export const JobCandidatesList = forwardRef<JobCandidatesListRef, JobCandidatesListProps>(
  ({ jobId, jobTitle = "this job", reloadToken, onLoaded }, ref) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const fetchCandidatesForJob = async () => {
      setLoading(true);
      try {
        // Ensure authentication is initialized
        await initializeAuth();
        
        const response = await api.get(`/api/jobs/${jobId}/candidates`);
        const list: Candidate[] = Array.isArray(response.data?.data) ? response.data.data : [];
        setCandidates(list);
        onLoaded?.(list.length);
      } catch (err) {
        console.error("Error fetching job candidates:", err);
        setCandidates([]);
        onLoaded?.(0);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCandidatesForJob();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId, reloadToken]);

    useImperativeHandle(ref, () => ({
      refresh: fetchCandidatesForJob,
    }));

    return (
      <div className="w-full">
           <div className="border-b py-2 px-6 grid grid-cols-[1.5fr_2.5fr_1.5fr_1fr_1fr_1.5fr] min-w-[900px] w-full text-sm font-medium text-muted-foreground">
              <div >Name</div>
              <div >Email</div>
              <div >Phone</div>
              <div >Status</div>
              <div >Experience</div>
              <div >Location</div>
            </div>
        <div className="overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2 flex-col">
                <Loader className="size-6 animate-spin" />
                <div className="text-center">Loading candidates...</div>
              </div>
            </div>
          ) : candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div
                key={candidate._id || Math.random().toString(36)}
                className="border-b hover:bg-muted py-3 px-4 cursor-pointer"
                onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
              >
               
                  <div className="grid grid-cols-[1.5fr_2.5fr_1.5fr_1fr_1fr_1.5fr] min-w-[900px] w-full">
                    <div className="font-medium">{getCandidateDisplayName(candidate)}</div>
                    <div>{candidate.email || "-"}</div>
                    <div>{candidate.phone || candidate.otherPhone || "-"}</div>
                    <div>{candidate.status || "-"}</div>
                    <div>{candidate.experience || candidate.totalRelevantExperience || "-"}</div>
                    <div>{candidate.location || candidate.country || "-"}</div>
                  </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <div>No candidates have been added to this job yet.</div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

JobCandidatesList.displayName = "JobCandidatesList";



