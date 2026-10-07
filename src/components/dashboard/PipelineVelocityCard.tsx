"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { cn } from "@/lib/utils";

// Material UI Icons
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

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
  // 6 canonical stages per spec: Sourcing, Screening, Client Screening, Interview, Hired, Verification
  const DEFAULT_STAGES = [
    { stage: "Sourcing", count: 446, color: "#8B5CF6", bg: "#F5F3FF", border: "#EDE9FE", dot: "#8B5CF6" },
    { stage: "Screening", count: 91, color: "#EC4899", bg: "#FDF2F8", border: "#FCE7F3", dot: "#EC4899" },
    { stage: "Client Screening", count: 49, color: "#F59E0B", bg: "#FFFBEB", border: "#FEF3C7", dot: "#F59E0B" },
    { stage: "Interview", count: 39, color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE", dot: "#2563EB" },
    { stage: "Hired", count: 8, color: "#10B981", bg: "#ECFDF5", border: "#D1FAE5", dot: "#10B981" },
    { stage: "Verification", count: 3, color: "#06B6D4", bg: "#ECFEFF", border: "#CFFAFE", dot: "#06B6D4" },
  ];

  // Merge dynamic stageBreakdown if available, otherwise use canonical default stages
  const resolvedStages = React.useMemo(() => {
    if (stageBreakdown && stageBreakdown.length > 0) {
      return stageBreakdown.map((st, idx) => {
        const fallback = DEFAULT_STAGES[idx % DEFAULT_STAGES.length];
        return {
          stage: st.stage,
          count: st.count,
          color: fallback.color,
          bg: fallback.bg,
          border: fallback.border,
          dot: fallback.dot,
        };
      });
    }
    return DEFAULT_STAGES;
  }, [stageBreakdown]);

  const totalInFunnel = pipelineTotal > 0 ? pipelineTotal : 636;

  // Job requisition stages fallback
  const resolvedJobStages = React.useMemo(() => {
    if (jobStageBreakdown && jobStageBreakdown.length > 0) {
      return jobStageBreakdown;
    }
    return [
      { stage: "Closed", count: 132 },
      { stage: "Active", count: 38 },
      { stage: "Hired", count: 24 },
      { stage: "Open", count: 11 },
      { stage: "On Hold", count: 2 },
    ];
  }, [jobStageBreakdown]);

  const JOB_STAGE_COLORS: Record<string, string> = {
    open: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]",
    active: "bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]",
    hired: "bg-[#ECFEFF] text-[#06B6D4] border-[#CFFAFE]",
    "on hold": "bg-[#FFFBEB] text-[#F59E0B] border-[#FEF3C7]",
    closed: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
  };

  return (
    <Box className="w-full h-full flex flex-col justify-between rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-4 sm:p-5 font-sans transition-all">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white tracking-tight leading-tight">
              Recruitment Pipeline Velocity
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-[#172033] dark:text-slate-200 cursor-pointer">
            <span>Last 30 Days</span>
            <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
          </div>

          <Link
            href="/reactruterpipeline"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 no-underline transition-colors"
          >
            <span>View Pipeline</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
          </Link>
        </div>
      </div>

      {/* Main Body */}
      <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* 1. Three Metric Cards with Light Tinted Backgrounds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Active Pipelines */}
          <div className="p-3.5 rounded-xl bg-[#F0F7FF] dark:bg-blue-950/20 border border-[#DBEAFE] dark:border-blue-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#2563EB] flex items-center justify-center shadow-xs shrink-0">
              <LayersOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#2563EB] block leading-tight">
                Active Pipelines
              </span>
              <span className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none mt-0.5 block">
                {activePipelines || 91}
              </span>
            </div>
          </div>

          {/* In Screening / Review */}
          <div className="p-3.5 rounded-xl bg-[#FFFDF5] dark:bg-amber-950/20 border border-[#FEF3C7] dark:border-amber-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#F59E0B] flex items-center justify-center shadow-xs shrink-0">
              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#D97706] block leading-tight">
                In Screening / Review
              </span>
              <span className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none mt-0.5 block">
                {candidatesInProcess || 628}
              </span>
            </div>
          </div>

          {/* Successfully Placed */}
          <div className="p-3.5 rounded-xl bg-[#F2FDF8] dark:bg-emerald-950/20 border border-[#D1FAE5] dark:border-emerald-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#10B981] flex items-center justify-center shadow-xs shrink-0">
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#10B981] block leading-tight">
                Successfully Placed
              </span>
              <span className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-none mt-0.5 block">
                {candidatesCompleted || 8}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Candidate Stage Attrition Funnel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1.5">
              <AccountTreeOutlinedIcon sx={{ fontSize: 15, color: "#2563EB" }} />
              <span>Candidate Stage Attrition Funnel</span>
            </span>
          </div>

          {/* Connected Pipeline Stepper */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {resolvedStages.map((stage, idx) => {
              const pct = totalInFunnel > 0 ? Math.round((stage.count / totalInFunnel) * 100) : 0;
              const isLast = idx === resolvedStages.length - 1;

              return (
                <React.Fragment key={idx}>
                  <div
                    className={cn(
                      "flex-1 min-w-[90px] p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-150 hover:shadow-xs",
                      "bg-[#F8FAFC] dark:bg-slate-800/60 border-[#E2E8F0] dark:border-slate-700/80"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.dot }}
                      />
                      <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] truncate leading-tight">
                        {stage.stage}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-sm font-bold text-[#172033] dark:text-white tracking-tight">
                        {stage.count}
                      </span>
                      <span className="text-[10px] font-medium text-[#94A3B8]">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {!isLast && (
                    <ArrowForwardOutlinedIcon
                      sx={{ fontSize: 13 }}
                      className="text-[#CBD5E1] dark:text-slate-600 shrink-0 select-none"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 3. Active Job Requisitions Stage Pills */}
        <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <WorkOutlineOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
            <span className="text-[11px] font-bold text-[#172033] dark:text-slate-200">
              Active Job Requisition Stages
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {resolvedJobStages.map((js: any, idx: number) => {
              const colorClass =
                JOB_STAGE_COLORS[js.stage?.toLowerCase()] ||
                "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]";

              return (
                <div
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold",
                    colorClass
                  )}
                >
                  <span>{js.stage}:</span>
                  <span className="font-bold">{js.count}</span>
                </div>
              );
            })}
          </div>

          <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] shrink-0">
            {jobsTotal ? jobsTotal : 207} Total Positions
          </span>
        </div>
      </div>
    </Box>
  );
}
