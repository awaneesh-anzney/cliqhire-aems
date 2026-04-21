"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PipelineJobCard } from "@/components/Recruiter-Pipeline/pipeline-job-card";
import { type Job, type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { headhunterService } from "@/services/headhunterService";
import { useAuth } from "@/contexts/AuthContext";

export const HeadhunterPipeline: React.FC<{ jobs?: Job[] }> = ({ jobs: incomingJobs = [] }) => {
  const [jobs, setJobs] = useState<Job[]>(incomingJobs);
  const { user } = useAuth();
  const userId = user?._id || (user as any)?.profile?._id || "";

  useEffect(() => {
    setJobs(incomingJobs.map(j => ({ ...j })));
  }, [incomingJobs]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [jobNameFilter, setJobNameFilter] = useState("");
  const [clientNameFilter, setClientNameFilter] = useState("");
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);

  const getFilteredAndSortedJobs = () => {
    let filteredJobs = [...jobs];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job => {
        if (job.title.toLowerCase().includes(searchLower)) return true;
        if (job.clientName.toLowerCase().includes(searchLower)) return true;
        if (job.candidates && job.candidates.some(candidate => candidate.name.toLowerCase().includes(searchLower))) return true;
        if (job.notes?.toLowerCase().includes(searchLower)) return true;
        return false;
      });
    }

    if (jobNameFilter.trim() || clientNameFilter.trim()) {
      const jobLower = jobNameFilter.trim().toLowerCase();
      const clientLower = clientNameFilter.trim().toLowerCase();
      filteredJobs = filteredJobs.filter(job => {
        const jobMatch = jobLower ? job.title.toLowerCase().includes(jobLower) : true;
        const clientMatch = clientLower ? job.clientName.toLowerCase().includes(clientLower) : true;
        return jobMatch && clientMatch;
      });
    }

    if (statusFilter !== "all") {
      filteredJobs = filteredJobs.filter(job => {
        switch (statusFilter) {
          case "active":
            return job.jobId?.stage && job.jobId.stage.toLowerCase() !== "closed";
          case "completed":
            return job.jobId?.stage && job.jobId.stage.toLowerCase() === "closed";
          case "paused":
            return job.jobId?.stage && (
              job.jobId.stage.toLowerCase().includes("hold") ||
              job.jobId.stage.toLowerCase().includes("pause") ||
              job.jobId.stage.toLowerCase().includes("suspended")
            );
          default:
            return true;
        }
      });
    }

    filteredJobs.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "candidates":
          return (b.totalCandidates || 0) - (a.totalCandidates || 0);
        case "client":
          return a.clientName.localeCompare(b.clientName);
        case "date":
        default:
          return 0;
      }
    });

    return filteredJobs;
  };

  const toggleJobExpansion = async (jobId: string) => {
    setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, isExpanded: !j.isExpanded } : j)));
    const job = jobs.find(j => j.id === jobId);
    const willExpand = !(job?.isExpanded);
    if (willExpand && userId) {
      setLoadingJobId(jobId);
      try {
        const raw = await headhunterService.getHeadhunterCandidates(userId, { jobId });
        const mapped: Candidate[] = (Array.isArray(raw) ? raw : []).map((hh: any, idx: number) => ({
          id: hh.candidateId || hh._id || hh.id || hh.email || `${hh.name || ""}-${hh.phone || idx}`,
          name: hh.name || "",
          source: "Headhunter",
          currentStage: "Sourcing",
          email: hh.email || "",
          phone: hh.phone || "",
          experience: hh.experience || "",
          currentSalary: hh.currentSalary ?? undefined,
          currentSalaryCurrency: hh.currentSalaryCurrency || undefined,
          expectedSalary: hh.expectedSalary ?? undefined,
          expectedSalaryCurrency: hh.expectedSalaryCurrency || undefined,
          skills: Array.isArray(hh.skills) ? hh.skills : undefined,
          linkedin: hh.linkedin || undefined,
          resume: hh.resume || hh.resumeUrl || undefined,
          subStatus: hh.status || "Pending",
          location: hh.location || "",
          gender: hh.gender || "",
          dateOfBirth: hh.dateOfBirth || "",
          willingToRelocate: hh.willingToRelocate || "",
          description: hh.description || "",
          softSkill: Array.isArray(hh.softSkill) ? hh.softSkill : [],
          technicalSkill: Array.isArray(hh.technicalSkill) ? hh.technicalSkill : [],
          rejectionDate: hh.rejectedDate || hh.rejectionDate || undefined,
          rejectionReason: hh.rejectionReason || undefined,
          rejectionReason1: hh.rejectionReason1 || undefined,
        }));
        setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, candidates: mapped } : j)));
      } catch (e) {
        // silently fail for now; UI remains with no candidates
      } finally {
        setLoadingJobId(null);
      }
    }
  };

  const refreshJobCandidates = async (jobId: string) => {
    if (!userId) return;
    setLoadingJobId(jobId);
    try {
      const raw = await headhunterService.getHeadhunterCandidates(userId, { jobId });
      const mapped: Candidate[] = (Array.isArray(raw) ? raw : []).map((hh: any, idx: number) => ({
        id: hh.candidateId || hh._id || hh.id || hh.email || `${hh.name || ""}-${hh.phone || idx}`,
        name: hh.name || "",
        source: "Headhunter",
        currentStage: "Sourcing",
        email: hh.email || "",
        phone: hh.phone || "",
        location: hh.location || "",
        experience: hh.experience || "",
        currentSalary: hh.currentSalary ?? undefined,
        currentSalaryCurrency: hh.currentSalaryCurrency || undefined,
        expectedSalary: hh.expectedSalary ?? undefined,
        expectedSalaryCurrency: hh.expectedSalaryCurrency || undefined,
        skills: Array.isArray(hh.skills) ? hh.skills : undefined,
        linkedin: hh.linkedin || undefined,
        resume: hh.resume || hh.resumeUrl || undefined,
        subStatus: hh.status || "Pending",
        gender: hh.gender || "",
        dateOfBirth: hh.dateOfBirth || "",
        willingToRelocate: hh.willingToRelocate || "",
        description: hh.description || "",
        softSkill: Array.isArray(hh.softSkill) ? hh.softSkill : [],
        technicalSkill: Array.isArray(hh.technicalSkill) ? hh.technicalSkill : [],
        rejectionDate: hh.rejectedDate || hh.rejectionDate || undefined,
        rejectionReason: hh.rejectionReason || undefined,
        rejectionReason1: hh.rejectionReason1 || undefined,
      }));
      setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, candidates: mapped } : j)));
    } catch (e) {
      // ignore errors
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleCandidateUpdate = (jobId: string, updatedCandidate: any) => {
    if (!updatedCandidate || !updatedCandidate.id) {
      void refreshJobCandidates(jobId);
      return;
    }
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        candidates: j.candidates.map(c => c.id === updatedCandidate.id ? { ...c, ...updatedCandidate } : c),
      };
    }));
  };
  const updateCandidateStage = async (_jobId: string, _candidateId: string, _newStage: string) => { };

  const filteredJobs = getFilteredAndSortedJobs();

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs, candidates, or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Input
            placeholder="Job name"
            value={jobNameFilter}
            onChange={(e) => setJobNameFilter(e.target.value)}
            className="w-[200px]"
          />
          <Input
            placeholder="Client name"
            value={clientNameFilter}
            onChange={(e) => setClientNameFilter(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        filteredJobs.map((job) => (
          <PipelineJobCard
            key={job.id}
            job={job}
            isHighlighted={highlightedJobId === job.id}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No jobs available</div>
      )}
    </div>
  );
};



