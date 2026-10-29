"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  RefreshCw,
  Filter,
  CalendarDays,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import {
  DashboardQueryParams,
  DashboardTimeframeInfo,
  DashboardTimeframePreset,
} from "@/types/dashboard";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";

interface DashboardTimeframeBarProps {
  timeframeInfo?: DashboardTimeframeInfo;
  params: DashboardQueryParams;
  onParamsChange: (updates: Partial<DashboardQueryParams>) => void;
  onRefresh: () => void;
  isFetching?: boolean;
}

const MONTH_NAMES = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

/**
 * Enhanced Timeframe Filter Toolbar for the Executive Dashboard.
 * Supports:
 * 1. Preset horizons ('all', '6_months', '3_months', 'year')
 * 2. Dedicated Month & Year selector (e.g. August 2026, September 2026)
 * 3. Modern Custom Date Range Popover with interactive preset intervals & validation
 */
export const DashboardTimeframeBar: React.FC<DashboardTimeframeBarProps> = ({
  timeframeInfo,
  params,
  onParamsChange,
  onRefresh,
  isFetching = false,
}) => {
  // Local state for custom date popover
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(params.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(params.endDate || "");

  // Local state for specific month/year selection
  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  const selectedYear = params.year || currentYearNum;
  const selectedMonth = params.month !== undefined ? Number(params.month) : "";

  // Keep local custom inputs synced with props
  useEffect(() => {
    setLocalStartDate(params.startDate || "");
    setLocalEndDate(params.endDate || "");
  }, [params.startDate, params.endDate]);

  // Preset Handlers
  const handleSelectPreset = (preset: DashboardTimeframePreset) => {
    onParamsChange({
      timeframe: preset,
      year: undefined,
      month: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  // Specific Month / Year Handler
  const handleMonthChange = (monthValStr: string) => {
    if (!monthValStr) {
      // Revert to 6 months default if cleared
      handleSelectPreset("6_months");
      return;
    }

    const monthNum = Number(monthValStr);
    onParamsChange({
      month: monthNum,
      year: selectedYear,
      timeframe: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleYearChange = (yearValStr: string) => {
    const yr = Number(yearValStr);
    if (selectedMonth) {
      onParamsChange({
        year: yr,
        month: Number(selectedMonth),
        timeframe: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    } else {
      onParamsChange({
        year: yr,
        timeframe: "year",
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  // Custom Quick Ranges
  const handleApplyQuickDays = (days: number) => {
    const today = new Date();
    const start = subDays(today, days);
    const startFormatted = format(start, "yyyy-MM-dd");
    const endFormatted = format(today, "yyyy-MM-dd");

    setLocalStartDate(startFormatted);
    setLocalEndDate(endFormatted);

    onParamsChange({
      startDate: startFormatted,
      endDate: endFormatted,
      timeframe: undefined,
      year: undefined,
      month: undefined,
    });
    setPopoverOpen(false);
  };

  const handleApplyCustomDates = () => {
    if (!localStartDate || !localEndDate) return;

    onParamsChange({
      startDate: localStartDate,
      endDate: localEndDate,
      timeframe: undefined,
      year: undefined,
      month: undefined,
    });
    setPopoverOpen(false);
  };

  const handleClearCustomDates = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    handleSelectPreset("6_months");
    setPopoverOpen(false);
  };

  // Formatting date range label for UI badge
  const formatDateLabel = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      return format(new Date(isoStr), "dd MMM yyyy");
    } catch {
      return isoStr;
    }
  };

  // Determine active preset mode
  const isCustomActive = Boolean(params.startDate && params.endDate);
  const isSpecificMonthActive = Boolean(params.month !== undefined && params.month !== null);
  const activePreset = isCustomActive || isSpecificMonthActive ? null : params.timeframe || "6_months";

  return (
    <div className="w-full flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.03)] font-sans">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
        {/* ─── Horizon Presets & Specific Month Picker ─── */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-0.5 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Scope:</span>
          </span>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSelectPreset("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === "all"
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Time
            </button>

            <button
              onClick={() => handleSelectPreset("month")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === "month"
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => handleSelectPreset("3_months")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === "3_months"
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Past 3M
            </button>

            <button
              onClick={() => handleSelectPreset("6_months")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === "6_months"
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Past 6M
            </button>

            <button
              onClick={() => handleSelectPreset("year")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === "year"
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              This Year
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* ─── Specific Month & Year Selectors ─── */}
          <div className="flex items-center gap-1.5">
            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`text-xs font-semibold py-1 px-2.5 rounded-lg border transition-all ${
                isSpecificMonthActive
                  ? "border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 shadow-xs"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <option value="">Specific Month...</option>
              {MONTH_NAMES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {AVAILABLE_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* ─── Modern Custom Date Range Popover ─── */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  isCustomActive
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/25 ring-1 ring-purple-600"
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
                      Custom Date Interval
                    </span>
                  </div>
                  {isCustomActive && (
                    <button
                      onClick={handleClearCustomDates}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Range Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quick Horizon
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

                {/* Styled Date Inputs */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Exact Dates (YYYY-MM-DD)
                  </span>

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

                {/* Apply Button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyCustomDates}
                    disabled={!localStartDate || !localEndDate}
                    className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Custom Filter</span>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ─── Active Indicator Pill & Live Refresh Button ─── */}
        <div className="flex items-center gap-2.5 self-stretch lg:self-auto justify-between lg:justify-end shrink-0">
          {timeframeInfo && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-medium">
              <CalendarIcon className="w-3 h-3 text-blue-500" />
              <span className="font-bold">{timeframeInfo.label}</span>
              {timeframeInfo.startDate && timeframeInfo.endDate && (
                <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 hidden sm:inline">
                  ({formatDateLabel(timeframeInfo.startDate)} –{" "}
                  {formatDateLabel(timeframeInfo.endDate)})
                </span>
              )}
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isFetching}
            className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs ${
              isFetching ? "ring-2 ring-blue-500/30" : ""
            }`}
            title="Refresh Live Statistics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
