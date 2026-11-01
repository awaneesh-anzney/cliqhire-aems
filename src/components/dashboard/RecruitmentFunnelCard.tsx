"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";
import { FunnelStageData } from "@/types/dashboard";

interface RecruitmentFunnelCardProps {
  funnel?: FunnelStageData[];
}

const DEFAULT_FUNNEL: FunnelStageData[] = [
  { stage: "Sourcing", count: 369, conversionFromPrevious: 100, conversionOverall: 100, color: "#3B82F6" },
  { stage: "Screening", count: 84, conversionFromPrevious: 22.8, conversionOverall: 22.8, color: "#6366F1" },
  { stage: "Client Screening", count: 45, conversionFromPrevious: 53.6, conversionOverall: 12.2, color: "#8B5CF6" },
  { stage: "Interview", count: 29, conversionFromPrevious: 64.4, conversionOverall: 7.9, color: "#EC4899" },
  { stage: "Hired", count: 8, conversionFromPrevious: 27.6, conversionOverall: 2.2, color: "#10B981" },
];

/**
 * Recruitment Conversion Funnel Card.
 * Displays sequential hiring stage volume, stage-over-stage conversion %,
 * and cumulative conversion from sourcing.
 */
export const RecruitmentFunnelCard: React.FC<RecruitmentFunnelCardProps> = ({
  funnel,
}) => {
  const data = funnel && funnel.length > 0 ? funnel : DEFAULT_FUNNEL;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const sourcingCount = data[0]?.count || 1;
  const hiredCount = data[data.length - 1]?.count || 0;
  const overallEfficiency = ((hiredCount / sourcingCount) * 100).toFixed(1);

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 font-sans">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Recruitment Conversion Funnel
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pipeline drop-off and conversion rates across sequential stages
            </p>
          </div>
        </div>

        <Link
          href="/reactruterpipeline"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── Funnel Stage Bars ─── */}
      <div className="py-4 space-y-3.5 flex-1 flex flex-col justify-center">
        {data.map((item, idx) => {
          const barPercent = Math.max((item.count / maxCount) * 100, 8);
          const isFirst = idx === 0;
          const isHired = item.stage.toLowerCase() === "hired";

          return (
            <div key={item.stage} className="space-y-1.5 group">
              {/* Stage label and numbers */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.stage}
                  </span>
                  {!isFirst && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {item.conversionFromPrevious}% from prev
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 min-w-[50px] text-right">
                    ({item.conversionOverall}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 group-hover:brightness-110 shadow-xs"
                  style={{
                    width: `${barPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Funnel KPI Summary Footer ─── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            Sourced
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {sourcingCount}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            Total Hired
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {hiredCount}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            End-to-End
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
            {overallEfficiency}%
          </span>
        </div>
      </div>
    </div>
  );
};

