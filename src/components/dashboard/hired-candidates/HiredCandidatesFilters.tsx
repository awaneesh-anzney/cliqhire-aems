"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  HiredCandidatesFilterParams,
  HiredCandidatesTimeframePreset,
  HiredCandidatesDateField,
  ProbationStatus,
} from "@/types/hiredCandidate";

interface HiredCandidatesFiltersProps {
  filters: HiredCandidatesFilterParams;
  onFilterChange: (updates: Partial<HiredCandidatesFilterParams>) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const TIMEFRAME_PRESETS: { id: HiredCandidatesTimeframePreset; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "month", label: "This Month" },
  { id: "3_months", label: "Past 3M" },
  { id: "6_months", label: "Past 6M" },
  { id: "year", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

const PROBATION_OPTIONS: { id: ProbationStatus; label: string }[] = [
  { id: "all", label: "All Statuses" },
  { id: "Active", label: "Active" },
  { id: "Completed", label: "Completed" },
  { id: "Expiring Soon", label: "Expiring Soon" },
  { id: "Expired", label: "Expired" },
  { id: "None", label: "No Probation" },
];

/**
 * Filter toolbar component supporting date ranges, timeframe presets, search,
 * probation statuses, and dateField toggles.
 */
export const HiredCandidatesFilters: React.FC<HiredCandidatesFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  isLoading = false,
}) => {
  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showCustomDates, setShowCustomDates] = useState(
    filters.timeframe === "custom" || Boolean(filters.startDate || filters.endDate)
  );

  // Sync internal search input with external filters
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        onFilterChange({ search: searchInput || undefined, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleTimeframeSelect = (preset: HiredCandidatesTimeframePreset) => {
    if (preset === "custom") {
      setShowCustomDates(true);
      onFilterChange({ timeframe: "custom", page: 1 });
    } else {
      setShowCustomDates(false);
      onFilterChange({
        timeframe: preset,
        startDate: undefined,
        endDate: undefined,
        year: undefined,
        month: undefined,
        page: 1,
      });
    }
  };

  const handleDateFieldToggle = () => {
    const nextField: HiredCandidatesDateField =
      filters.dateField === "joinDate" ? "hiredAt" : "joinDate";
    onFilterChange({ dateField: nextField, page: 1 });
  };

  // Determine if active filters exist to display Reset button
  const hasActiveFilters = Boolean(
    (filters.timeframe && filters.timeframe !== "all") ||
      (filters.probationStatus && filters.probationStatus !== "all") ||
      filters.search ||
      filters.startDate ||
      filters.endDate ||
      (filters.dateField && filters.dateField !== "hiredAt")
  );

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* ─── Top Row: Search + Quick Toggles ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidate name, email, job, or client..."
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                onFilterChange({ search: undefined, page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Field & Reset Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* DateField Toggle (Hired Date vs Join Date) */}
          <button
            onClick={handleDateFieldToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              filters.dateField === "joinDate"
                ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            }`}
            title="Switch filter base between Candidate Hired Date and Official Joining Date"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Based on:</span>
            <span className="underline font-bold">
              {filters.dateField === "joinDate" ? "Joining Date" : "Hired Date"}
            </span>
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Bottom Row: Presets & Probation Status Filters ─── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        {/* Timeframe Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Timeframe:
          </span>
          {TIMEFRAME_PRESETS.map((preset) => {
            const isSelected =
              (filters.timeframe || "all") === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleTimeframeSelect(preset.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Probation Status Select */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Probation:
          </span>
          <select
            value={filters.probationStatus || "all"}
            onChange={(e) =>
              onFilterChange({
                probationStatus: e.target.value as ProbationStatus,
                page: 1,
              })
            }
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PROBATION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Custom Date Range Inputs (Expandable) ─── */}
      {showCustomDates && (
        <div className="mt-1 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-wrap bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-lg">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Custom Dates:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500">From:</label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                onFilterChange({
                  startDate: e.target.value || undefined,
                  timeframe: "custom",
                  page: 1,
                })
              }
              className="text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500">To:</label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                onFilterChange({
                  endDate: e.target.value || undefined,
                  timeframe: "custom",
                  page: 1,
                })
              }
              className="text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          {(filters.startDate || filters.endDate) && (
            <button
              onClick={() =>
                onFilterChange({
                  startDate: undefined,
                  endDate: undefined,
                  page: 1,
                })
              }
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
};

