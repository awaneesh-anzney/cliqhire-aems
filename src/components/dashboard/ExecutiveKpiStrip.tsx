"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import {
  Building2,
  Briefcase,
  Users,
  Award,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { DashboardKpiCards, MonthlyTrendData } from "@/types/dashboard";

interface ExecutiveKpiStripProps {
  kpiCards?: DashboardKpiCards;
  candidatesStats?: {
    total: number;
    active: number;
    inactive: number;
  };
  monthlyTrends?: MonthlyTrendData[];
  timeframeLabel?: string;

  // Fallback props
  candidatesTotal?: number;
  candidatesActive?: number;
  candidatesInactive?: number;
  jobsTotal?: number;
  jobsActive?: number;
  jobsInactive?: number;
  clientsTotal?: number;
  clientsLead?: number;
  clientsEngaged?: number;
  clientsSigned?: number;
  candidatesCompleted?: number;
}

/**
 * Primary Executive KPI Strip.
 * Display sequence:
 * 1. Clients (with Lead, Engaged, Signed breakdown)
 * 2. Jobs (Total, Active, Inactive + contextual month velocity)
 * 3. Candidates (Total, Active, Inactive + contextual month sourcing)
 * 4. Hired Candidates (Window Placements, All-Time total, link to /dashboard/hired-candidate)
 */
export function ExecutiveKpiStrip({
  kpiCards,
  candidatesStats,
  monthlyTrends,
  timeframeLabel,
  candidatesTotal = 0,
  candidatesActive = 0,
  candidatesInactive = 0,
  jobsTotal = 0,
  jobsActive = 0,
  jobsInactive = 0,
  clientsTotal = 0,
  clientsLead = 0,
  clientsEngaged = 0,
  clientsSigned = 0,
  candidatesCompleted = 0,
}: ExecutiveKpiStripProps) {
  // ─── 1. Clients Calculations ───
  const clientTotalVal = kpiCards?.clientsSummary?.total ?? clientsTotal;
  const clientLeadVal = kpiCards?.clientsSummary?.lead ?? clientsLead;
  const clientEngagedVal = kpiCards?.clientsSummary?.engaged ?? clientsEngaged;
  const clientSignedVal = kpiCards?.clientsSummary?.signed ?? clientsSigned;

  // ─── 2. Jobs Calculations ───
  const jobTotalVal = kpiCards?.activeJobs?.total ?? jobsTotal;
  const jobActiveVal = kpiCards?.activeJobs?.value ?? jobsActive;
  const jobInactiveVal = kpiCards?.activeJobs?.inactive ?? jobsInactive;

  // ─── 3. Candidates Calculations ───
  const candTotalVal = candidatesStats?.total ?? candidatesTotal;
  const candActiveVal = candidatesStats?.active ?? candidatesActive;
  const candInactiveVal = candidatesStats?.inactive ?? candidatesInactive;

  // ─── 4. Hired Candidates Calculations ───
  const hiredVal = kpiCards?.hiredCandidates?.value ?? candidatesCompleted;
  const hiredAllTimeVal = kpiCards?.hiredCandidates?.totalAllTime;

  // ─── 5. Contextual Monthly Trend Correlation ───
  // Find if active timeframeLabel matches any month in monthlyTrends
  const matchingMonthTrend = React.useMemo(() => {
    if (!timeframeLabel || !monthlyTrends || monthlyTrends.length === 0) return null;
    const cleanLabel = timeframeLabel.toLowerCase().trim();
    return (
      monthlyTrends.find((t) => {
        const tLabel = t.label.toLowerCase().trim();
        const tMonth = t.month.toLowerCase().trim();
        return cleanLabel.includes(tLabel) || cleanLabel.includes(tMonth);
      }) || null
    );
  }, [timeframeLabel, monthlyTrends]);

  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 font-sans">
      {/* ─── 1. CLIENTS (Amber Theme) ─── */}
      <Link
        href="/clients"
        className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.08)] hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60 shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Clients
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {clientTotalVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              total accounts
            </span>
          </div>
        </div>

        {/* Lead, Engaged, Signed Breakdown */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">
              <strong className="text-amber-600 dark:text-amber-400 font-semibold">
                {clientLeadVal}
              </strong>{" "}
              Lead
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                {clientEngagedVal}
              </strong>{" "}
              Engaged
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
            {clientSignedVal} Signed
          </span>
        </div>
      </Link>

      {/* ─── 2. JOBS (Blue Theme) ─── */}
      <Link
        href="/jobs"
        className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Jobs
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {jobTotalVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              total requisitions
            </span>
          </div>
        </div>

        {/* Active vs Inactive Breakdown with dynamic month velocity badge if available */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {matchingMonthTrend ? (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{matchingMonthTrend.jobsOpened} opened in {matchingMonthTrend.label}</span>
            </div>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {jobActiveVal}
              </strong>{" "}
              Active Roles
            </span>
          )}

          <span className="text-[11px] text-slate-400">
            {jobInactiveVal} Inactive
          </span>
        </div>
      </Link>

      {/* ─── 3. CANDIDATES (Indigo Theme) ─── */}
      <Link
        href="/candidates"
        className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#6366F1] flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Candidates
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {candTotalVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              talent pool
            </span>
          </div>
        </div>

        {/* Active vs Inactive Breakdown with dynamic month sourcing badge if available */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {matchingMonthTrend ? (
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{matchingMonthTrend.candidatesSourced} sourced in {matchingMonthTrend.label}</span>
            </div>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {candActiveVal.toLocaleString()}
              </strong>{" "}
              Active Profiles
            </span>
          )}

          <span className="text-[11px] text-slate-400">
            {candInactiveVal.toLocaleString()} Inactive
          </span>
        </div>
      </Link>

      {/* ─── 4. HIRED CANDIDATES (Emerald Theme) -> Links to /dashboard/hired-candidate ─── */}
      <Link
        href="/dashboard/hired-candidate"
        className="group relative p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 dark:from-emerald-950/20 dark:to-slate-900 shadow-[0_2px_12px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block leading-tight">
                  Hired Candidates
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[120px] block">
                  {timeframeLabel || "Selected Window"}
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-emerald-600 shadow-xs group-hover:scale-110 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-100 leading-none">
              {hiredVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              placements
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <span>
            {hiredAllTimeVal !== undefined ? (
              <>
                <strong className="font-bold">{hiredAllTimeVal}</strong> lifetime
              </>
            ) : (
              "Placement registry"
            )}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold underline group-hover:text-emerald-600">
            View Registry →
          </span>
        </div>
      </Link>
    </Box>
  );
}
