"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { ArrowLeft, ChevronRight, UserCheck, ShieldCheck } from "lucide-react";
import { HiredCandidatesSection } from "@/components/dashboard/hired-candidates";

/**
 * Hired Candidates Dedicated Page (`/dashboard/hired-candidate`).
 * Houses the Hired Candidates & Placement Registry, tracking active probation,
 * team hierarchy, offer letters, and styled Excel exports.
 */
export default function HiredCandidatesPage() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 2.5 },
        p: { xs: "12px 14px 20px", sm: "16px 20px 24px" },
      }}
      className="font-sans"
    >
      {/* ─── Breadcrumbs & Navigation Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Hired Candidates
          </span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* ─── Page Title Banner ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hired Candidates & Placement Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive placement dossier, probation lifecycle tracking, team hierarchy ownership, and offer contracts.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Hired Candidates Live Section (Connects to API & Exports) ─── */}
      <HiredCandidatesSection />
    </Box>
  );
}

