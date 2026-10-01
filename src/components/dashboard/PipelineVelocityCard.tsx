"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { cn } from "@/lib/utils";

// Material UI Icons
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

interface PipelineVelocityCardProps {
  pipelineTotal: number;
  activePipelines: number;
  candidatesInProcess: number;
  candidatesCompleted: number;
  stageBreakdown: Array<{ stage: string; count: number }>;
  jobsTotal: number;
  jobStageBreakdown: Array<{ stage: string; count: number }>;
}

export function PipelineVelocityCard({
  pipelineTotal,
  activePipelines,
  candidatesInProcess,
  candidatesCompleted,
  stageBreakdown,
  jobsTotal,
  jobStageBreakdown,
}: PipelineVelocityCardProps) {
  const STAGE_THEMES: Record<
    string,
    { bg: string; text: string; dot: string; border: string }
  > = {
    sourcing: {
      bg: "bg-purple-500/5 dark:bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      dot: "bg-purple-500",
      border: "border-purple-200/80 dark:border-purple-900/40",
    },
    screening: {
      bg: "bg-pink-500/5 dark:bg-pink-500/10",
      text: "text-pink-600 dark:text-pink-400",
      dot: "bg-pink-500",
      border: "border-pink-200/80 dark:border-pink-900/40",
    },
    "client screening": {
      bg: "bg-amber-500/5 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      border: "border-amber-200/80 dark:border-amber-900/40",
    },
    interview: {
      bg: "bg-blue-500/5 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
      border: "border-blue-200/80 dark:border-blue-900/40",
    },
    hired: {
      bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      border: "border-emerald-200/80 dark:border-emerald-900/40",
    },
    onboarding: {
      bg: "bg-teal-500/5 dark:bg-teal-500/10",
      text: "text-teal-600 dark:text-teal-400",
      dot: "bg-teal-500",
      border: "border-teal-200/80 dark:border-teal-900/40",
    },
    verification: {
      bg: "bg-indigo-500/5 dark:bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
      dot: "bg-indigo-500",
      border: "border-indigo-200/80 dark:border-indigo-900/40",
    },
  };

  const JOB_STAGE_COLORS: Record<string, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
    "on hold": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
    closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    hired: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50",
    onboarding: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50",
  };

  return (
    <Box className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.06)] overflow-hidden font-sans">
      {/* Header Bar */}
      <Box className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center font-bold">
            <TrendingUpOutlinedIcon sx={{ fontSize: 17 }} />
          </div>
          <div>
            <h3 className="text-xs sm:text-[13px] font-extrabold tracking-tight text-[#1C252E] dark:text-white uppercase">
              Recruitment Pipeline Velocity
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
            {pipelineTotal} In Funnel
          </span>
          <Button
            component={Link}
            href="/reactruterpipeline"
            variant="text"
            size="small"
            endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "11.5px",
              color: "#2563EB",
              p: "2px 8px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              },
            }}
          >
            View Pipeline
          </Button>
        </div>
      </Box>

      {/* Main Body */}
      <Box className="p-4 flex-1 flex flex-col justify-between gap-4 overflow-y-auto custom-scrollbar">
        {/* Metric Pill Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700/80 dark:text-blue-300">
              Active Pipelines
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight mt-0.5">
              {activePipelines}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-300">
              In Screening / Review
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-0.5">
              {candidatesInProcess}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300">
              Successfully Placed
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              {candidatesCompleted}
            </span>
          </div>
        </div>

        {/* Candidate Stage Progression Stepper */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#637381] dark:text-[#919EAB] flex items-center gap-1.5">
              <AccountTreeOutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
              Candidate Stage Attrition Funnel
            </span>
            <span className="text-[10px] font-semibold text-[#919EAB]">
              7 Core Pipeline Stages
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {stageBreakdown.map((st, idx) => {
              const color =
                STAGE_THEMES[st.stage.toLowerCase()] || {
                  bg: "bg-slate-50 dark:bg-slate-800/40",
                  text: "text-[#1C252E] dark:text-white",
                  dot: "bg-slate-400",
                  border: "border-slate-200/80 dark:border-slate-700/60",
                };

              const pct =
                pipelineTotal > 0 ? Math.round((st.count / pipelineTotal) * 100) : 0;

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs",
                    color.bg,
                    color.border
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dot)} />
                    <span className="text-[9px] font-black uppercase tracking-wider truncate text-[#637381] dark:text-[#919EAB]">
                      {st.stage}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className={cn("text-base font-black tracking-tight", color.text)}>
                      {st.count}
                    </span>
                    <span className="text-[9px] font-bold text-[#919EAB]">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Requisitions Stage Cloud */}
        <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#637381] dark:text-[#919EAB] flex items-center gap-1.5">
              <WorkOutlineOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
              Active Job Requisition Stages
            </span>
            <span className="text-[10px] font-bold text-[#1C252E] dark:text-white">
              {jobsTotal} Total Positions
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {jobStageBreakdown.map((js: any, idx: number) => {
              const color =
                JOB_STAGE_COLORS[js.stage?.toLowerCase()] ||
                "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";

              return (
                <div
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-bold shadow-2xs",
                    color
                  )}
                >
                  <span className="capitalize">{js.stage}:</span>
                  <span className="font-extrabold">{js.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Box>
    </Box>
  );
}
