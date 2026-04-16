"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KPISection } from "./kpi-section";
import { PipelineJobCard } from "./pipeline-job-card";
import { type Job } from "./dummy-data";
import { convertPipelineListDataToJob } from "./utils/convert";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAllPipelineEntries, type PipelineListItem } from "@/services/recruitmentPipelineService";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming we have or will use a simple inline debounce if not available.
// Actually let's just implement inline debounce logic with useState to avoid missing imports
import { useEffect } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

export function RecruiterPipeline() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';

  const canViewPipeline = isAdmin || hasPermission('pipeline', 'view');

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [highlightedJobId] = useState<string | null>(null);

  // Debounce search term natively
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: listResponse, isLoading: listLoading } = useQuery({
    queryKey: ["pipelineEntries", user?._id, currentPage, pageSize, debouncedSearchTerm],
    queryFn: async () => await getAllPipelineEntries(currentPage, pageSize, debouncedSearchTerm),
    enabled: !!user,
  });

  const calculateKPIData = () => {
    const rawPipelines = listResponse?.data?.pipelines || [];
    const allJobsList: Job[] = rawPipelines.map((p: any) => convertPipelineListDataToJob(p, false));

    const totalJobs = listResponse?.data?.pagination?.totalPipelines || allJobsList.length;
    const activeJobs = allJobsList.filter(job => job.jobId?.stage && job.jobId.stage.toLowerCase() !== "closed").length;
    const inactiveJobs = allJobsList.filter(job => job.jobId?.stage && job.jobId.stage.toLowerCase() === "closed").length;

    let appliedCandidates = 0;
    let hiredCandidates = 0;
    let disqualifiedCandidates = 0;

    if (rawPipelines.length > 0) {
      appliedCandidates = rawPipelines.reduce((total: number, pipeline: any) => total + (pipeline.totalCandidates || 0), 0);
      hiredCandidates = rawPipelines.reduce((total: number, pipeline: any) => total + (pipeline.completedCandidates || 0), 0);
      disqualifiedCandidates = rawPipelines.reduce((total: number, pipeline: any) => total + (pipeline.droppedCandidates || 0), 0);
    }

    return {
      totalJobs,
      activeJobs,
      inactiveJobs,
      appliedCandidates,
      hiredCandidates,
      disqualifiedCandidates
    };
  };

  const getRenderJobs = () => {
    let sourcePipelines: any[] = [];
    
    if (listResponse?.data?.pipelines) {
      sourcePipelines = listResponse.data.pipelines;
    }

    let filteredJobs = sourcePipelines.map((p: any) => convertPipelineListDataToJob(p, false));

    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter((job: Job) => {
        if (job.title.toLowerCase().includes(searchLower)) return true;
        if (job.clientName.toLowerCase().includes(searchLower)) return true;
        if (job.notes?.toLowerCase().includes(searchLower)) return true;
        return false;
      });
    }

    const fullFilteredCount = filteredJobs.length;
    let paginatedJobs = filteredJobs;

    return {
      renderJobs: paginatedJobs,
      totalItems: fullFilteredCount,
      isClientSearch: false
    };
  };

  const kpiData = calculateKPIData();
  const { renderJobs, totalItems, isClientSearch } = getRenderJobs();

  const actualTotalPages = isClientSearch ? Math.max(1, Math.ceil(totalItems / pageSize)) : (listResponse?.data?.pagination?.totalPages || 0);
  const actualCurrentPage = isClientSearch ? currentPage : (listResponse?.data?.pagination?.currentPage || 0);
  const hasNextPage = isClientSearch ? currentPage < actualTotalPages : listResponse?.data?.pagination?.hasNextPage;
  const hasPrevPage = isClientSearch ? currentPage > 1 : listResponse?.data?.pagination?.hasPrevPage;

  if (!canViewPipeline) {
    return (
      <div className="text-center py-8 text-gray-500">You do not have permission to view the recruitment pipeline.</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-2">
      <div className="flex-none">
        <KPISection data={kpiData} />
      </div>

      <div className="flex-none bg-white rounded-xl border border-slate-200/60 p-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search jobs, or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-sm w-full bg-transparent border-transparent hover:border-transparent focus:border-transparent shadow-none transition-colors outline-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 pr-1 custom-scrollbar">
        {listLoading ? (
          <div className="text-center py-8 text-slate-500 animate-pulse text-sm">
            Loading pipeline jobs...
          </div>
        ) : renderJobs.length > 0 ? (
          <div className="space-y-2">
            {renderJobs.map((job: Job) => (
              <PipelineJobCard
                key={job.id}
                job={job}
                isHighlighted={highlightedJobId === job.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-sm">
            {searchTerm ? "No jobs found matching your search criteria" : "No jobs available"}
          </div>
        )}
      </div>

      <div className="flex-none pt-2 mt-auto border-t border-slate-100">
        {actualTotalPages > 1 ? (
          <div className="flex items-center justify-between px-1">
            <div className="text-sm text-slate-500 font-medium tracking-tight">
              Page <span className="text-slate-900 font-semibold">{actualCurrentPage}</span> of {actualTotalPages}
            </div>
            <div className="flex items-center space-x-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!hasPrevPage}
                className="h-8 px-3 text-sm rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(actualTotalPages, prev + 1))}
                disabled={!hasNextPage}
                className="h-8 px-3 text-sm rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-sm text-slate-500 font-medium px-2 py-1 tracking-tight">
            Showing all <span className="text-slate-900 font-semibold ml-1 mr-1">{totalItems}</span> result(s)
          </div>
        )}
      </div>
    </div>
  );
}
