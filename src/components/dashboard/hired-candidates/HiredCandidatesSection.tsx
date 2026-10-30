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
  limit: 10,
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
    <div className="w-full flex-1 min-h-0 flex flex-col gap-2 font-sans overflow-hidden">
      {/* ─── Compact Controls Bar (Fixed) ─── */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Hired Candidates
          </h2>
          {responseData?.pagination?.total !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
              {responseData.pagination.total} Total
            </span>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh Hired Candidates Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>
              {exportMutation.isPending ? "Exporting..." : "Export Excel"}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Summary Metric Cards (Fixed) ─── */}
      <div className="shrink-0">
        <HiredCandidatesMetrics
          summary={responseData?.summary}
          isLoading={isLoading}
          timeframeLabel={responseData?.timeframe?.label}
        />
      </div>

      {/* ─── Search & Filters Bar (Fixed) ─── */}
      <div className="shrink-0">
        <HiredCandidatesFilters
          filters={filterParams}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
        />
      </div>

      {/* ─── Data Table & Pagination (Only table data scrolls) ─── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <HiredCandidatesTable
          data={responseData?.data || []}
          pagination={responseData?.pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* ─── Candidate Dossier Detail Modal ─── */}
      <HiredCandidateDetailModal
        candidate={selectedCandidate}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
};

