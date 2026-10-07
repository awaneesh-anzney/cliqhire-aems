"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";

// Material UI Icons
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

interface RecruitmentForceCardProps {
  usersTotal: number;
  usersActive: number;
  usersActivePercent: number;
}

export function RecruitmentForceCard({
  usersTotal,
  usersActive,
  usersActivePercent,
}: RecruitmentForceCardProps) {
  const total = usersTotal || 15;
  const active = usersActive || 15;
  const rate = usersActivePercent || 100;

  return (
    <Box className="w-full h-full flex flex-col justify-between rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-4 sm:p-5 font-sans transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white tracking-tight leading-tight">
              Recruitment Force & Staffing Capacity
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
              Active talent acquisition specialists, recruiters & internal staff
            </p>
          </div>
        </div>

        <Link
          href="/teammembers"
          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 no-underline transition-colors shrink-0"
        >
          <span>View Team</span>
          <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* 3 Horizontal Metric Layout with Soft Tinted Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3.5 flex-1">
        {/* Total Force */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <BadgeOutlinedIcon sx={{ fontSize: 19 }} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
              Total Force
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none">
                {total}
              </span>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                accounts
              </span>
            </div>
          </div>
        </div>

        {/* Active on Duty */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
            <HowToRegOutlinedIcon sx={{ fontSize: 19 }} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
              Active on Duty
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none">
                {active}
              </span>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                online
              </span>
            </div>
          </div>
        </div>

        {/* Activity Rate */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
            <InsightsOutlinedIcon sx={{ fontSize: 19 }} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
              Activity Rate
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none">
                {rate}%
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE]">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Thin Progress Bar (#10B981) */}
      <div className="pt-2">
        <div className="w-full h-1.5 bg-[#F1F5F9] dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            <span>{active} of {total} staff currently engaged</span>
          </div>

          <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            Staff capacity normal
          </span>
        </div>
      </div>
    </Box>
  );
}
