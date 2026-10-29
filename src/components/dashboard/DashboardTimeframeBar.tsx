"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  DashboardQueryParams,
  DashboardTimeframeInfo,
  DashboardTimeframePreset,
} from "@/types/dashboard";
import { format } from "date-fns";

interface DashboardTimeframeBarProps {
  timeframeInfo?: DashboardTimeframeInfo;
  params: DashboardQueryParams;
  onParamsChange: (updates: Partial<DashboardQueryParams>) => void;
  onRefresh: () => void;
  isFetching?: boolean;
}

const TIMEFRAME_PRESETS: { id: DashboardTimeframePreset; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "month", label: "This Month" },
  { id: "3_months", label: "Past 3 Months" },
  { id: "6_months", label: "Past 6 Months" },
  { id: "year", label: "This Year" },
  { id: "custom", label: "Custom Dates" },
];

/**
 * Timeframe Filter Toolbar for the Executive Dashboard.
 * Allows switching between presets ('all', 'month', '3_months', '6_months', 'year', 'custom')
 * and displays active timeframe metadata returned by GET /api/dashboard/stats.
 */
export const DashboardTimeframeBar: React.FC<DashboardTimeframeBarProps> = ({
  timeframeInfo,
  params,
  onParamsChange,
  onRefresh,
  isFetching = false,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(
    params.timeframe === "custom" || Boolean(params.startDate || params.endDate)
  );

  const activePreset = params.timeframe || "6_months";

  const handleSelectPreset = (preset: DashboardTimeframePreset) => {
    if (preset === "custom") {
      setShowCustomPicker(true);
      onParamsChange({ timeframe: "custom" });
    } else {
      setShowCustomPicker(false);
      onParamsChange({
        timeframe: preset,
        startDate: undefined,
        endDate: undefined,
        year: undefined,
        month: undefined,
      });
    }
  };

  const formatDateLabel = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      return format(new Date(isoStr), "dd MMM yyyy");
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Preset Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Scope:</span>
          </span>

          {TIMEFRAME_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Active Range Display & Refresh */}
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          {timeframeInfo && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-medium">
              <Calendar className="w-3 h-3 text-blue-500" />
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
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh Dashboard Stats"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Custom Date Range Selector */}
      {showCustomPicker && (
        <div className="mt-1 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-wrap bg-slate-50/70 dark:bg-slate-800/50 p-2.5 rounded-xl">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Custom Interval:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500">From:</label>
            <input
              type="date"
              value={params.startDate || ""}
              onChange={(e) =>
                onParamsChange({
                  startDate: e.target.value || undefined,
                  timeframe: "custom",
                })
              }
              className="text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500">To:</label>
            <input
              type="date"
              value={params.endDate || ""}
              onChange={(e) =>
                onParamsChange({
                  endDate: e.target.value || undefined,
                  timeframe: "custom",
                })
              }
              className="text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          {(params.startDate || params.endDate) && (
            <button
              onClick={() =>
                onParamsChange({
                  startDate: undefined,
                  endDate: undefined,
                })
              }
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

