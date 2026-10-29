"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  HiredCandidatesFilterParams,
  HiredCandidateRecord,
} from "@/types/hiredCandidate";
import {
  useHiredCandidates,
  useExportHiredCandidates,
} from "@/hooks/useHiredCandidates";
import { HiredCandidatesMetrics } from "./HiredCandidatesMetrics";
import { HiredCandidatesFilters } from "./HiredCandidatesFilters";
import { HiredCandidatesTable } from "./HiredCandidatesTable";
import { HiredCandidateDetailModal } from "./HiredCandidateDetailModal";

const DEFAULT_FILTERS: HiredCandidatesFilterParams = {
  timeframe: "all",
  probationStatus: "all",
  dateField: "hiredAt",
  page: 1,
  limit: 20,
};

/**
 * HiredCandidatesSection provides a comprehensive dashboard module
 * for viewing placed candidates, tracking probation statuses, monitoring team
 * hierarchies, and downloading Excel reports.
 */
export const HiredCandidatesSection: React.FC = () => {
  // Query & filter state
  const [filterParams, setFilterParams] =
    useState<HiredCandidatesFilterParams>(DEFAULT_FILTERS);

  // Selected candidate for detail modal
  const [selectedCandidate, setSelectedCandidate] =
    useState<HiredCandidateRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // TanStack Query for hired candidates list and metrics
  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useHiredCandidates(filterParams);

  // Mutation for Excel report download
  const exportMutation = useExportHiredCandidates();

  const handleFilterChange = (updates: Partial<HiredCandidatesFilterParams>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleResetFilters = () => {
    setFilterParams(DEFAULT_FILTERS);
  };

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilterParams((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  const handleViewDetails = (candidate: HiredCandidateRecord) => {
    setSelectedCandidate(candidate);
    setDetailModalOpen(true);
  };

  const handleExportExcel = () => {
    exportMutation.mutate(filterParams);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans mt-2">
      {/* ─── Header & Controls ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Hired Candidates & Placement Registry
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Live Reports
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-pipeline placements, active probation lifecycles, team hierarchy, and offer contracts.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh Hired Candidates Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>
              {exportMutation.isPending ? "Generating..." : "Export Excel"}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Summary Metric Cards ─── */}
      <HiredCandidatesMetrics
        summary={responseData?.summary}
        isLoading={isLoading}
        timeframeLabel={responseData?.timeframe?.label}
      />

      {/* ─── Search & Filters Bar ─── */}
      <HiredCandidatesFilters
        filters={filterParams}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

      {/* ─── Data Table & Pagination ─── */}
      <HiredCandidatesTable
        data={responseData?.data || []}
        pagination={responseData?.pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onViewDetails={handleViewDetails}
      />

      {/* ─── Candidate Dossier Detail Modal ─── */}
      <HiredCandidateDetailModal
        candidate={selectedCandidate}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
};

