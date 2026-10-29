"use client";

import React from "react";
import Link from "next/link";
import {
  PieChart,
  Briefcase,
  Building2,
  ArrowRight,
  TrendingUp,
  Layers,
} from "lucide-react";
import { DistributionData } from "@/types/dashboard";

interface DistributionCardsProps {
  clientDistribution?: DistributionData[];
  jobStageDistribution?: DistributionData[];
}

const DEFAULT_CLIENTS: DistributionData[] = [
  { stage: "Lead", count: 47, percentage: 49.5, color: "#F59E0B" },
  { stage: "Engaged", count: 26, percentage: 27.4, color: "#3B82F6" },
  { stage: "Signed", count: 22, percentage: 23.2, color: "#10B981" },
];

const DEFAULT_JOBS: DistributionData[] = [
  { stage: "Closed", count: 144, percentage: 69.2, color: "#64748B" },
  { stage: "Hired", count: 24, percentage: 11.5, color: "#10B981" },
  { stage: "Active", count: 18, percentage: 8.7, color: "#3B82F6" },
  { stage: "Open", count: 11, percentage: 5.3, color: "#06B6D4" },
  { stage: "On Hold", count: 11, percentage: 5.3, color: "#F59E0B" },
];

/**
 * DistributionCards renders breakdown charts for Client stages and Job requisition statuses.
 */
export const DistributionCards: React.FC<DistributionCardsProps> = ({
  clientDistribution,
  jobStageDistribution,
}) => {
  const clients = clientDistribution && clientDistribution.length > 0 ? clientDistribution : DEFAULT_CLIENTS;
  const jobs = jobStageDistribution && jobStageDistribution.length > 0 ? jobStageDistribution : DEFAULT_JOBS;

  const totalClients = clients.reduce((acc, c) => acc + c.count, 0);
  const totalJobs = jobs.reduce((acc, j) => acc + j.count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full font-sans">
      {/* ─── 1. Client Portfolio Distribution ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Client Account Lifecycle
                </h4>
                <p className="text-[11px] text-slate-500">
                  {totalClients} client accounts in portfolio
                </p>
              </div>
            </div>

            <Link
              href="/clients"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-4 w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5">
            {clients.map((item) => (
              <div
                key={item.stage}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-90"
                title={`${item.stage}: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Breakdown List */}
          <div className="mt-4 space-y-2.5">
            {clients.map((item) => (
              <div
                key={item.stage}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-slate-400 min-w-[45px] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Signed Conversion:</span>
          <span className="font-bold text-emerald-600">
            {clients.find((c) => c.stage.toLowerCase() === "signed")?.percentage || 0}%
          </span>
        </div>
      </div>

      {/* ─── 2. Job Stage Distribution ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Job Order Status Breakdown
                </h4>
                <p className="text-[11px] text-slate-500">
                  {totalJobs} total requisitions tracked
                </p>
              </div>
            </div>

            <Link
              href="/jobs"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-4 w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5">
            {jobs.map((item) => (
              <div
                key={item.stage}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-90"
                title={`${item.stage}: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Breakdown List */}
          <div className="mt-4 space-y-2">
            {jobs.map((item) => (
              <div
                key={item.stage}
                className="flex items-center justify-between text-xs py-0.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-slate-400 min-w-[45px] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Active & Open Ratio:</span>
          <span className="font-bold text-blue-600">
            {(
              (jobs.find((j) => j.stage.toLowerCase() === "active")?.percentage || 0) +
              (jobs.find((j) => j.stage.toLowerCase() === "open")?.percentage || 0)
            ).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

