"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Filter,
  CalendarDays,
  RotateCcw,
  Clock,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  HiredCandidatesFilterParams,
  HiredCandidatesTimeframePreset,
  HiredCandidatesDateField,
  ProbationStatus,
} from "@/types/hiredCandidate";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(filters.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || "");

  // Sync internal search input with external filters
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setLocalStartDate(filters.startDate || "");
    setLocalEndDate(filters.endDate || "");
  }, [filters.startDate, filters.endDate]);

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
    onFilterChange({
      timeframe: preset,
      startDate: undefined,
      endDate: undefined,
      year: undefined,
      month: undefined,
      page: 1,
    });
  };

  const handleDateFieldToggle = () => {
    const nextField: HiredCandidatesDateField =
      filters.dateField === "joinDate" ? "hiredAt" : "joinDate";
    onFilterChange({ dateField: nextField, page: 1 });
  };

  const handleApplyQuickDays = (days: number) => {
    const today = new Date();
    const start = subDays(today, days);
    const startFormatted = format(start, "yyyy-MM-dd");
    const endFormatted = format(today, "yyyy-MM-dd");

    setLocalStartDate(startFormatted);
    setLocalEndDate(endFormatted);

    onFilterChange({
      startDate: startFormatted,
      endDate: endFormatted,
      timeframe: "custom",
      page: 1,
    });
    setPopoverOpen(false);
  };

  const handleApplyCustomDates = () => {
    if (!localStartDate || !localEndDate) return;

    onFilterChange({
      startDate: localStartDate,
      endDate: localEndDate,
      timeframe: "custom",
      page: 1,
    });
    setPopoverOpen(false);
  };

  const formatDateLabel = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      return format(new Date(isoStr), "dd MMM yyyy");
    } catch {
      return isoStr;
    }
  };

  // Determine if active filters exist to display Reset button
  const isCustomActive = Boolean(filters.startDate && filters.endDate);
  const hasActiveFilters = Boolean(
    (filters.timeframe && filters.timeframe !== "all") ||
      (filters.probationStatus && filters.probationStatus !== "all") ||
      filters.search ||
      filters.startDate ||
      filters.endDate ||
      (filters.dateField && filters.dateField !== "hiredAt")
  );

  return (
    <div className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-sans">
      {/* ─── Top Row: Search + Quick Toggles ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidate name, email, job, or client..."
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                onFilterChange({ search: undefined, page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Field & Reset Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* DateField Toggle (Hired Date vs Join Date) */}
          <button
            onClick={handleDateFieldToggle}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filters.dateField === "joinDate"
                ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            }`}
            title="Switch filter base between Candidate Hired Date and Official Joining Date"
          >
            <Clock className="w-3 h-3" />
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Bottom Row: Presets & Probation Status Filters ─── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Timeframe Presets + Custom Range Popover */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Timeframe:
          </span>

          {TIMEFRAME_PRESETS.map((preset) => {
            const isSelected =
              !isCustomActive && (filters.timeframe || "all") === preset.id;
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

          {/* Custom Date Range Popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                  isCustomActive
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/25 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Custom Range</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Custom Placement Range
                    </span>
                  </div>
                  {isCustomActive && (
                    <button
                      onClick={() => {
                        setLocalStartDate("");
                        setLocalEndDate("");
                        handleTimeframeSelect("all");
                        setPopoverOpen(false);
                      }}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quick Preset
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(7)}
                      className="py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(30)}
                      className="py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(90)}
                      className="py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Last 90 Days
                    </button>
                  </div>
                </div>

                {/* Dates Input */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>Start Date:</span>
                      {localStartDate && (
                        <span className="text-[10.5px] text-blue-600 font-semibold">
                          {formatDateLabel(localStartDate)}
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={localStartDate}
                      onChange={(e) => setLocalStartDate(e.target.value)}
                      className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>End Date:</span>
                      {localEndDate && (
                        <span className="text-[10.5px] text-blue-600 font-semibold">
                          {formatDateLabel(localEndDate)}
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => setLocalEndDate(e.target.value)}
                      className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApplyCustomDates}
                    disabled={!localStartDate || !localEndDate}
                    className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Filter</span>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
    </div>
  );
};
