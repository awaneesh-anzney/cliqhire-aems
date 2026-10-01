"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

// Material UI Icons
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";

interface ExecutiveKpiStripProps {
  candidatesTotal: number;
  candidatesActive: number;
  candidatesInactive: number;
  candidatesActivePercent: number;
  candidatesInactivePercent: number;

  jobsTotal: number;
  jobsOpen: number;
  jobsActiveStage: number;
  jobsOpenPercent: number;
  jobsActivePercent: number;

  clientsTotal: number;
  clientsLead: number;
  clientsEngaged: number;
  clientsSigned: number;
  clientsLeadPercent: number;
  clientsEngagedPercent: number;
  clientsSignedPercent: number;

  candidatesCompleted: number;
  activePipelines: number;
  pipelineTotal: number;
}

export function ExecutiveKpiStrip({
  candidatesTotal,
  candidatesActive,
  candidatesInactive,
  candidatesActivePercent,
  candidatesInactivePercent,

  jobsTotal,
  jobsOpen,
  jobsActiveStage,
  jobsOpenPercent,
  jobsActivePercent,

  clientsTotal,
  clientsLead,
  clientsEngaged,
  clientsSigned,
  clientsLeadPercent,
  clientsEngagedPercent,
  clientsSignedPercent,

  candidatesCompleted,
  activePipelines,
  pipelineTotal,
}: ExecutiveKpiStripProps) {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 font-sans">
      {/* ─── Metric 1: Candidate Pool ─── */}
      <Link
        href="/candidates"
        className="group relative p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637381] dark:text-[#919EAB]">
            Candidate Pool
          </span>
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#1C252E] dark:text-white">
              {candidatesTotal.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#919EAB]">talent profiles</span>
          </div>
          <ArrowOutwardOutlinedIcon
            sx={{ fontSize: 16 }}
            className="text-[#919EAB] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <div className="space-y-1.5 mt-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${candidatesActivePercent}%` }}
            />
            <div
              className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
              style={{ width: `${candidatesInactivePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10.5px] font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {candidatesActive.toLocaleString()} Active
            </span>
            <span className="text-[#919EAB]">
              {candidatesInactive.toLocaleString()} Inactive
            </span>
          </div>
        </div>
      </Link>

      {/* ─── Metric 2: Job Requisitions ─── */}
      <Link
        href="/jobs"
        className="group relative p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637381] dark:text-[#919EAB]">
            Job Requisitions
          </span>
          <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
            <WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#1C252E] dark:text-white">
              {jobsTotal.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#919EAB]">open targets</span>
          </div>
          <ArrowOutwardOutlinedIcon
            sx={{ fontSize: 16 }}
            className="text-[#919EAB] group-hover:text-[#6366F1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <div className="space-y-1.5 mt-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${jobsOpenPercent}%` }}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${jobsActivePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10.5px] font-bold">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {jobsOpen} Open
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {jobsActiveStage} In Progress
            </span>
          </div>
        </div>
      </Link>

      {/* ─── Metric 3: Client Accounts ─── */}
      <Link
        href="/clients"
        className="group relative p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637381] dark:text-[#919EAB]">
            Client Accounts
          </span>
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
            <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#1C252E] dark:text-white">
              {clientsTotal.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#919EAB]">partners</span>
          </div>
          <ArrowOutwardOutlinedIcon
            sx={{ fontSize: 16 }}
            className="text-[#919EAB] group-hover:text-[#06B6D4] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <div className="space-y-1.5 mt-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-purple-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${clientsLeadPercent}%` }}
            />
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${clientsEngagedPercent}%` }}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${clientsSignedPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-purple-600 dark:text-purple-400">{clientsLead} Lead</span>
            <span className="text-sky-600 dark:text-sky-400">{clientsEngaged} Engaged</span>
            <span className="text-emerald-600 dark:text-emerald-400">{clientsSigned} Signed</span>
          </div>
        </div>
      </Link>

      {/* ─── Metric 4: Placement & Throughput ─── */}
      <Link
        href="/reactruterpipeline"
        className="group relative p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637381] dark:text-[#919EAB]">
            Hired / Placed
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#1C252E] dark:text-white">
              {candidatesCompleted.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">hired</span>
          </div>
          <ArrowOutwardOutlinedIcon
            sx={{ fontSize: 16 }}
            className="text-[#919EAB] group-hover:text-[#22C55E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <div className="space-y-1.5 mt-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-l-full"
              style={{
                width: `${Math.min((candidatesCompleted / (pipelineTotal || 1)) * 100, 100)}%`,
              }}
            />
            <div className="h-full bg-slate-300 dark:bg-slate-700 flex-1" />
          </div>
          <div className="flex items-center justify-between text-[10.5px] font-bold">
            <span className="text-blue-600 dark:text-blue-400">{activePipelines} Pipelines</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {candidatesCompleted} Placements
            </span>
          </div>
        </div>
      </Link>
    </Box>
  );
}
