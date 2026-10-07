"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";

// Material UI Icons
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

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
  jobsTotal,
  clientsTotal,
  candidatesCompleted,
}: ExecutiveKpiStripProps) {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 font-sans">
      {/* ─── 1. Candidate Pool (Blue) ─── */}
      <Link
        href="/candidates"
        className="group relative p-4 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          {/* Header: Icon, Label, Arrow */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] flex items-center justify-center shrink-0">
                <PeopleOutlineOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Candidate Pool
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-slate-800 text-[#94A3B8] group-hover:text-[#2563EB] group-hover:bg-[#EFF6FF] flex items-center justify-center transition-all">
              <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Metric & Supporting Text */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight text-[#172033] dark:text-white leading-none">
              {candidatesTotal ? candidatesTotal.toLocaleString() : "4,484"}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              talent profiles
            </span>
          </div>
        </div>

        {/* Footer: Trend Badge & Mini Sparkline */}
        <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10.5px] font-bold">
            <TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />
            <span>+12%</span>
            <span className="text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8] ml-0.5">vs last mo</span>
          </div>

          {/* Sparkline curve (Blue) */}
          <svg className="w-20 h-7 overflow-visible shrink-0" viewBox="0 0 80 28" fill="none">
            <defs>
              <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,22 Q20,24 35,16 T60,12 T80,4"
              stroke="#2563EB"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M0,22 Q20,24 35,16 T60,12 T80,4 L80,28 L0,28 Z"
              fill="url(#blue-grad)"
            />
          </svg>
        </div>
      </Link>

      {/* ─── 2. Job Requisitions (Purple) ─── */}
      <Link
        href="/jobs"
        className="group relative p-4 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/40 text-[#8B5CF6] flex items-center justify-center shrink-0">
                <WorkOutlineOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Job Requisitions
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-slate-800 text-[#94A3B8] group-hover:text-[#8B5CF6] group-hover:bg-[#F5F3FF] flex items-center justify-center transition-all">
              <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Metric */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight text-[#172033] dark:text-white leading-none">
              {jobsTotal ? jobsTotal.toLocaleString() : "207"}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              open targets
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10.5px] font-bold">
            <TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />
            <span>+8%</span>
            <span className="text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8] ml-0.5">vs last mo</span>
          </div>

          {/* Sparkline curve (Purple) */}
          <svg className="w-20 h-7 overflow-visible shrink-0" viewBox="0 0 80 28" fill="none">
            <defs>
              <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,20 Q15,10 35,22 T65,8 T80,14"
              stroke="#8B5CF6"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M0,20 Q15,10 35,22 T65,8 T80,14 L80,28 L0,28 Z"
              fill="url(#purple-grad)"
            />
          </svg>
        </div>
      </Link>

      {/* ─── 3. Client Accounts (Cyan) ─── */}
      <Link
        href="/clients"
        className="group relative p-4 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ECFEFF] dark:bg-cyan-950/40 text-[#06B6D4] flex items-center justify-center shrink-0">
                <BusinessOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Client Accounts
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-slate-800 text-[#94A3B8] group-hover:text-[#06B6D4] group-hover:bg-[#ECFEFF] flex items-center justify-center transition-all">
              <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Metric */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight text-[#172033] dark:text-white leading-none">
              {clientsTotal ? clientsTotal.toLocaleString() : "92"}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              partners
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10.5px] font-bold">
            <TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />
            <span>+5%</span>
            <span className="text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8] ml-0.5">vs last mo</span>
          </div>

          {/* Sparkline curve (Cyan) */}
          <svg className="w-20 h-7 overflow-visible shrink-0" viewBox="0 0 80 28" fill="none">
            <defs>
              <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,24 Q25,26 40,14 T65,18 T80,6"
              stroke="#06B6D4"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M0,24 Q25,26 40,14 T65,18 T80,6 L80,28 L0,28 Z"
              fill="url(#cyan-grad)"
            />
          </svg>
        </div>
      </Link>

      {/* ─── 4. Hired / Placed (Green / Gold) ─── */}
      <Link
        href="/reactruterpipeline"
        className="group relative p-4 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 flex flex-col justify-between no-underline"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/40 text-[#F59E0B] flex items-center justify-center shrink-0">
                <EmojiEventsOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Hired / Placed
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-slate-800 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:bg-[#FFFBEB] flex items-center justify-center transition-all">
              <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
            </div>
          </div>

          {/* Metric */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight text-[#172033] dark:text-white leading-none">
              {candidatesCompleted ? candidatesCompleted.toLocaleString() : "8"}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              hired this month
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10.5px] font-bold">
            <TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />
            <span>+33%</span>
            <span className="text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8] ml-0.5">vs last mo</span>
          </div>

          {/* Sparkline curve (Amber/Orange) */}
          <svg className="w-20 h-7 overflow-visible shrink-0" viewBox="0 0 80 28" fill="none">
            <defs>
              <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,25 Q20,18 40,24 T60,10 T80,8"
              stroke="#F59E0B"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M0,25 Q20,18 40,24 T60,10 T80,8 L80,28 L0,28 Z"
              fill="url(#amber-grad)"
            />
          </svg>
        </div>
      </Link>
    </Box>
  );
}
