"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Award,
  Briefcase,
  Users,
} from "lucide-react";
import { MonthlyTrendData } from "@/types/dashboard";

interface MonthlyTrendsChartCardProps {
  trends?: MonthlyTrendData[];
}

const DEFAULT_TRENDS: MonthlyTrendData[] = [
  { month: "2026-05", label: "May 2026", jobsOpened: 3, candidatesSourced: 29, hired: 2 },
  { month: "2026-06", label: "Jun 2026", jobsOpened: 6, candidatesSourced: 74, hired: 1 },
  { month: "2026-07", label: "Jul 2026", jobsOpened: 1, candidatesSourced: 74, hired: 0 },
  { month: "2026-08", label: "Aug 2026", jobsOpened: 3, candidatesSourced: 59, hired: 2 },
  { month: "2026-09", label: "Sep 2026", jobsOpened: 16, candidatesSourced: 29, hired: 0 },
  { month: "2026-10", label: "Oct 2026", jobsOpened: 1, candidatesSourced: 31, hired: 0 },
];

/**
 * Monthly Hiring & Velocity Trends Card.
 * Visualizes continuous time-series performance of sourcing volume,
 * job demand, and placement outcomes.
 */
export const MonthlyTrendsChartCard: React.FC<MonthlyTrendsChartCardProps> = ({
  trends,
}) => {
  const data = trends && trends.length > 0 ? trends : DEFAULT_TRENDS;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute maximums for relative bar scaling
  const maxSourced = Math.max(...data.map((d) => d.candidatesSourced), 1);
  const maxJobs = Math.max(...data.map((d) => d.jobsOpened), 1);
  const maxHired = Math.max(...data.map((d) => d.hired), 1);

  // Totals in window
  const totalSourced = data.reduce((acc, d) => acc + d.candidatesSourced, 0);
  const totalJobs = data.reduce((acc, d) => acc + d.jobsOpened, 0);
  const totalHired = data.reduce((acc, d) => acc + d.hired, 0);

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 font-sans">
      {/* ─── Header & Legend ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Monthly Hiring & Velocity Trends
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Correlating talent sourcing, open job orders, and placements
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Sourced
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Jobs Opened
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Hired
            </span>
          </div>
        </div>
      </div>

      {/* ─── Monthly Trends Visualization ─── */}
      <div className="py-5 flex-1 flex flex-col justify-end min-h-[220px]">
        {/* Bar group container */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-[170px] pt-4">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            // Heights relative to chart container max height
            const sourcedHeight = Math.max((item.candidatesSourced / maxSourced) * 120, 6);
            const jobsHeight = Math.max((item.jobsOpened / Math.max(maxJobs, 20)) * 120, 6);
            const hiredHeight = Math.max((item.hired / Math.max(maxHired, 5)) * 120, item.hired > 0 ? 12 : 4);

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex flex-col items-center justify-end h-full gap-2 group cursor-pointer relative"
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                    <div className="font-bold border-b border-slate-700 pb-0.5 mb-1">
                      {item.label}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-blue-300">
                        Sourced: <strong>{item.candidatesSourced}</strong>
                      </div>
                      <div className="text-indigo-300">
                        Jobs: <strong>{item.jobsOpened}</strong>
                      </div>
                      <div className="text-emerald-300">
                        Hired: <strong>{item.hired}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bars column */}
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                  {/* Candidates Sourced Bar */}
                  <div
                    style={{ height: `${sourcedHeight}px` }}
                    className="w-2.5 sm:w-4 rounded-t-md bg-[#3B82F6] opacity-85 group-hover:opacity-100 transition-all duration-300 shadow-xs"
                    title={`Sourced: ${item.candidatesSourced}`}
                  />
                  {/* Jobs Opened Bar */}
                  <div
                    style={{ height: `${jobsHeight}px` }}
                    className="w-2.5 sm:w-4 rounded-t-md bg-[#6366F1] opacity-85 group-hover:opacity-100 transition-all duration-300 shadow-xs"
                    title={`Jobs Opened: ${item.jobsOpened}`}
                  />
                  {/* Hired Bar */}
                  <div
                    style={{ height: `${hiredHeight}px` }}
                    className="w-2.5 sm:w-4 rounded-t-md bg-[#10B981] opacity-85 group-hover:opacity-100 transition-all duration-300 shadow-xs"
                    title={`Hired: ${item.hired}`}
                  />
                </div>

                {/* Month Label */}
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-full text-center">
                  {item.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Summary Totals Strip ─── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Sourced</span>
            <span className="font-bold text-slate-900 dark:text-white leading-none">
              {totalSourced.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Jobs Opened</span>
            <span className="font-bold text-slate-900 dark:text-white leading-none">
              {totalJobs.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Placed</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {totalHired.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

