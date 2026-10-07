"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";

// Material UI Icons
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

interface LegalAgreementsCardProps {
  contractsTotal: number;
}

export function LegalAgreementsCard({ contractsTotal }: LegalAgreementsCardProps) {
  const total = contractsTotal || 25;

  return (
    <Box className="w-full h-full flex flex-col justify-between rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-4 sm:p-5 font-sans transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] dark:bg-purple-950/30 text-[#8B5CF6] flex items-center justify-center shrink-0">
            <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white tracking-tight leading-tight">
              Legal & MSAs
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
              Executed corporate agreements
            </p>
          </div>
        </div>

        <Link
          href="/contracts"
          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 no-underline transition-colors shrink-0"
        >
          <span>View MSAs</span>
          <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* Main Metric Stat Box */}
      <div className="my-3 p-3.5 rounded-xl border border-[#E7EDF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 flex items-center justify-between gap-3 flex-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] block leading-tight">
            Active Contracts
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none">
              {total}
            </span>
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              signed agreements
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F3FF] dark:bg-purple-950/40 border border-[#DDD6FE] dark:border-purple-800 text-[11px] font-bold text-[#8B5CF6] dark:text-purple-300 shadow-2xs shrink-0">
          <VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />
          <span>Compliant</span>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] dark:border-slate-800/80">
        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
          Terms & Fee Schedules Verified
        </span>
        <span className="text-[11px] font-bold text-[#8B5CF6]">
          100% In Effect
        </span>
      </div>
    </Box>
  );
}
