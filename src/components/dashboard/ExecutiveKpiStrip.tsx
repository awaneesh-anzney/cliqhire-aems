"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import {
  Briefcase,
  Users,
  Award,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";
import { DashboardKpiCards } from "@/types/dashboard";

interface ExecutiveKpiStripProps {
  kpiCards?: DashboardKpiCards;
  timeframeLabel?: string;

  // Fallback props for backward compatibility
  candidatesTotal?: number;
  jobsTotal?: number;
  jobsOpen?: number;
  clientsTotal?: number;
  candidatesCompleted?: number;
  candidatesInProcess?: number;
  pipelineTotal?: number;
}

export function ExecutiveKpiStrip({
  kpiCards,
  timeframeLabel,
  candidatesTotal = 0,
  jobsTotal = 0,
  jobsOpen = 0,
  clientsTotal = 0,
  candidatesCompleted = 0,
  candidatesInProcess = 0,
  pipelineTotal = 0,
}: ExecutiveKpiStripProps) {
  // 1. Active Jobs
  const activeJobsVal = kpiCards?.activeJobs?.value ?? jobsOpen;
  const totalJobsVal = kpiCards?.activeJobs?.total ?? jobsTotal;
  const inactiveJobsVal = kpiCards?.activeJobs?.inactive ?? (totalJobsVal - activeJobsVal);

  // 2. Candidates in Process
  const candidatesInProcessVal =
    kpiCards?.candidatesInProcess?.value ?? candidatesInProcess;
  const totalPipelineVal =
    kpiCards?.candidatesInProcess?.totalInPipeline ?? pipelineTotal;

  // 3. Hired Candidates
  const hiredVal = kpiCards?.hiredCandidates?.value ?? candidatesCompleted;
  const hiredAllTimeVal = kpiCards?.hiredCandidates?.totalAllTime;

  // 4. Clients Portfolio
  const clientsTotalVal = kpiCards?.clientsSummary?.total ?? clientsTotal;
  const clientsSignedVal = kpiCards?.clientsSummary?.signed ?? 0;
  const clientsEngagedVal = kpiCards?.clientsSummary?.engaged ?? 0;
  const clientsLeadVal = kpiCards?.clientsSummary?.lead ?? 0;

  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 font-sans">
      {/* ─── 1. Active Jobs (Blue) ─── */}
      <Link
        href="/jobs"
        className="group relative p-4 rounded-2xl border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Requisitions
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {activeJobsVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              open roles
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {totalJobsVal}
            </strong>{" "}
            total registered
          </span>
          <span className="text-[11px] text-slate-400">
            {inactiveJobsVal} inactive
          </span>
        </div>
      </Link>

      {/* ─── 2. Pipeline In-Process (Indigo) ─── */}
      <Link
        href="/reactruterpipeline"
        className="group relative p-4 rounded-2xl border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#6366F1] flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Candidates in Funnel
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {candidatesInProcessVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              in evaluation
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {totalPipelineVal}
            </strong>{" "}
            total in pipeline
          </span>
          <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            Active Velocity
          </span>
        </div>
      </Link>

      {/* ─── 3. Hired Placements (Emerald) -> Links to /dashboard/hired-candidate ─── */}
      <Link
        href="/dashboard/hired-candidate"
        className="group relative p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/20 dark:to-slate-900 shadow-[0_2px_12px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 flex flex-col justify-between no-underline"
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
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
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

      {/* ─── 4. Client Portfolio (Amber) ─── */}
      <Link
        href="/clients"
        className="group relative p-4 rounded-2xl border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.08)] hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Client Portfolio
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              {clientsTotalVal.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              accounts
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-emerald-600 font-semibold">{clientsSignedVal}</strong> signed •{" "}
            <strong className="text-blue-600 font-semibold">{clientsEngagedVal}</strong> engaged
          </span>
          <span className="text-[11px] text-slate-400">
            {clientsLeadVal} leads
          </span>
        </div>
      </Link>
    </Box>
  );
}
