"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Workflow,
  CheckCheck,
  ListTodo,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardKpiCardsProps {
  onOpenClient?: () => void;
  onOpenJob?: () => void;
  onOpenCandidate?: () => void;
}

export function DashboardKpiCards({
  onOpenClient,
  onOpenJob,
  onOpenCandidate,
}: DashboardKpiCardsProps) {
  const { data: dashboardStats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden animate-in fade-in duration-300">
        {/* Skeleton: 4 Primary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border/70 bg-card/95 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton: Two-Column Main Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="lg:col-span-8 p-4 rounded-2xl border border-border/70 bg-card/95 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 p-4 rounded-2xl border border-border/70 bg-card/95 shadow-2xs space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 1. Calculations for Candidates
  const candidatesTotal = dashboardStats?.candidates?.total || 0;
  const candidatesActive = dashboardStats?.candidates?.active || 0;
  const candidatesInactive = dashboardStats?.candidates?.inactive || 0;
  const candidatesActivePercent =
    candidatesTotal > 0 ? (candidatesActive / candidatesTotal) * 100 : 0;
  const candidatesInactivePercent =
    candidatesTotal > 0 ? (candidatesInactive / candidatesTotal) * 100 : 0;

  // 2. Calculations for Jobs
  const jobsTotal = dashboardStats?.jobs?.total || 0;
  const jobStageBreakdown = dashboardStats?.jobs?.stageBreakdown || [];
  const jobsOpen =
    jobStageBreakdown.find((s: any) => s.stage?.toLowerCase() === "open")?.count || 0;
  const jobsActiveStage =
    jobStageBreakdown.find((s: any) => s.stage?.toLowerCase() === "active")?.count || 0;
  const jobsOpenPercent = jobsTotal > 0 ? (jobsOpen / jobsTotal) * 100 : 0;
  const jobsActivePercent = jobsTotal > 0 ? (jobsActiveStage / jobsTotal) * 100 : 0;

  // 3. Calculations for Clients
  const clientsTotal = dashboardStats?.clients?.total || 0;
  const clientsLead = dashboardStats?.clients?.byStage?.lead || 0;
  const clientsEngaged = dashboardStats?.clients?.byStage?.engaged || 0;
  const clientsSigned = dashboardStats?.clients?.byStage?.signed || 0;
  const clientsLeadPercent = clientsTotal > 0 ? (clientsLead / clientsTotal) * 100 : 0;
  const clientsEngagedPercent =
    clientsTotal > 0 ? (clientsEngaged / clientsTotal) * 100 : 0;
  const clientsSignedPercent =
    clientsTotal > 0 ? (clientsSigned / clientsTotal) * 100 : 0;

  // 4. Calculations for Pipeline
  const pipelineTotal = dashboardStats?.pipeline?.totalCandidatesInPipeline || 0;
  const activePipelines = dashboardStats?.pipeline?.activePipelines || 0;
  const candidatesInProcess = dashboardStats?.pipeline?.candidatesInProcess || 0;
  const candidatesCompleted = dashboardStats?.pipeline?.candidatesCompleted || 0;
  const stageBreakdown = dashboardStats?.pipeline?.stageBreakdown || [];

  // 5. Calculations for Users, Contracts, Tasks
  const usersTotal = dashboardStats?.users?.total || 0;
  const usersActive = dashboardStats?.users?.active || 0;
  const usersActivePercent = usersTotal > 0 ? (usersActive / usersTotal) * 100 : 0;
  const contractsTotal = dashboardStats?.contracts?.total || 0;
  const tasksPending = dashboardStats?.tasks?.pending || 0;
  const tasksTotal = dashboardStats?.tasks?.total || 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5">
      {/* ─── SECTION 1: PRIMARY EXECUTIVE METRICS PULSE STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        
        {/* Metric 1: Candidates Pool */}
        <Link
          href="/candidates"
          className="group relative p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card hover:bg-card/95 shadow-2xs hover:shadow-xs hover:border-blue-400/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Candidate Pool
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {candidatesTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">talent profiles</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1.5 bg-muted/80 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-l-full"
                style={{ width: `${candidatesActivePercent}%` }}
              />
              <div
                className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                style={{ width: `${candidatesInactivePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {candidatesActive.toLocaleString()} Active
              </span>
              <span className="text-muted-foreground">
                {candidatesInactive.toLocaleString()} Inactive
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 2: Job Requisitions */}
        <Link
          href="/jobs"
          className="group relative p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card hover:bg-card/95 shadow-2xs hover:shadow-xs hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Job Requisitions
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {jobsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">open targets</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1.5 bg-muted/80 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500 transition-all duration-500 rounded-l-full"
                style={{ width: `${jobsOpenPercent}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${jobsActivePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {jobsOpen} Open
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {jobsActiveStage} Active
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Client Partners */}
        <Link
          href="/clients"
          className="group relative p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card hover:bg-card/95 shadow-2xs hover:shadow-xs hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Client Accounts
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {clientsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">partners</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1.5 bg-muted/80 rounded-full overflow-hidden flex">
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
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-purple-600 dark:text-purple-400">{clientsLead} Lead</span>
              <span className="text-sky-600 dark:text-sky-400">{clientsEngaged} Engaged</span>
              <span className="text-emerald-600 dark:text-emerald-400">{clientsSigned} Signed</span>
            </div>
          </div>
        </Link>

        {/* Metric 4: Placement & Throughput (Signature Crimson Rose #FFF1F2 Card) */}
        <Link
          href="/reactruterpipeline/pipeline"
          className="group relative p-3 sm:p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-gradient-to-br from-[#FFF1F2] via-card to-card hover:bg-card/95 shadow-2xs hover:shadow-xs hover:border-rose-400 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Placed / Throughput
            </span>
            <div className="h-7 w-7 rounded-lg bg-[#FFF1F2] border border-rose-300/80 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {candidatesCompleted.toLocaleString()}
              </span>
              <span className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400">hired</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1.5 bg-muted/80 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-rose-500 transition-all duration-500 rounded-l-full"
                style={{ width: `${Math.min((candidatesCompleted / (pipelineTotal || 1)) * 100, 100)}%` }}
              />
              <div className="h-full bg-blue-500/70 flex-1" />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{activePipelines} Pipelines</span>
              <span className="text-rose-600 dark:text-rose-400 font-black">{pipelineTotal} in Funnel</span>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── SECTION 2: MAIN OPERATIONS & ANALYTICS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Pipeline Conversion Velocity (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-[11.5px] font-black tracking-tight text-foreground uppercase">
                  Recruitment Pipeline Velocity
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9.5px] font-bold bg-[#EFF6FF] text-blue-700 border-blue-200 py-0.5 px-2 rounded-full"
              >
                {pipelineTotal} In Funnel
              </Badge>
              <Link
                href="/reactruterpipeline/pipeline"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <span>Kanban</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar gap-2.5">
            {/* Metric Pill Strip */}
            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex flex-col">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-700/80 dark:text-blue-400">
                  Active Pipelines
                </span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight mt-0.5">
                  {activePipelines}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400">
                  In Screening / Review
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-0.5">
                  {candidatesInProcess}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF1F2] dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Successfully Placed
                </span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                  {candidatesCompleted}
                </span>
              </div>
            </div>

            {/* Candidate Stage Progression Tracker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-blue-600" /> Stage Attrition Stepper
                </span>
                <span className="text-[9.5px] font-medium text-muted-foreground">
                  7 Core Candidate Stages
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
                {stageBreakdown.map((st, idx) => {
                  const stageColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
                    sourcing: { bg: "bg-purple-500/5", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500", border: "border-purple-200/60 dark:border-purple-900/40" },
                    screening: { bg: "bg-pink-500/5", text: "text-pink-600 dark:text-pink-400", dot: "bg-pink-500", border: "border-pink-200/60 dark:border-pink-900/40" },
                    "client screening": { bg: "bg-amber-500/5", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", border: "border-amber-200/60 dark:border-amber-900/40" },
                    interview: { bg: "bg-blue-500/5", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", border: "border-blue-200/60 dark:border-blue-900/40" },
                    hired: { bg: "bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-200/60 dark:border-emerald-900/40" },
                    onboarding: { bg: "bg-teal-500/5", text: "text-teal-600 dark:text-teal-400", dot: "bg-teal-500", border: "border-teal-200/60 dark:border-teal-900/40" },
                    verification: { bg: "bg-indigo-500/5", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500", border: "border-indigo-200/60 dark:border-indigo-900/40" },
                  };
                  const color =
                    stageColors[st.stage.toLowerCase()] || {
                      bg: "bg-muted/30",
                      text: "text-foreground",
                      dot: "bg-slate-400",
                      border: "border-border/60",
                    };

                  const pct =
                    pipelineTotal > 0 ? Math.round((st.count / pipelineTotal) * 100) : 0;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded-lg border flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs",
                        color.bg,
                        color.border
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dot)} />
                        <span className="text-[8.5px] font-black uppercase tracking-wider truncate text-muted-foreground">
                          {st.stage}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1.5">
                        <span className={cn("text-sm font-black tracking-tight", color.text)}>
                          {st.count}
                        </span>
                        <span className="text-[8.5px] font-bold text-muted-foreground/75">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Requisitions Stage Cloud */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/20 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-blue-600" /> Active Job Requisition Stages
                </span>
                <span className="text-[9.5px] font-bold text-foreground">
                  {jobsTotal} Open Positions
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {jobStageBreakdown.map((js: any, idx: number) => {
                  const stageColors: Record<string, string> = {
                    open: "bg-blue-50 text-blue-700 border-blue-200",
                    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "on hold": "bg-amber-50 text-amber-700 border-amber-200",
                    closed: "bg-slate-100 text-slate-700 border-slate-200",
                    hired: "bg-teal-50 text-teal-700 border-teal-200",
                    onboarding: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  };
                  const color =
                    stageColors[js.stage?.toLowerCase()] ||
                    "bg-muted text-muted-foreground border-border/60";

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[9.5px] font-bold shadow-2xs",
                        color
                      )}
                    >
                      <span className="capitalize">{js.stage}:</span>
                      <span className="font-black">{js.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Launchpad & Operational Pulse (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          {/* Quick Action Launchpad */}
          <div className="rounded-xl border border-border/80 bg-card shadow-xs p-3 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-rose-500" /> Operations Launchpad
              </span>
              <span className="text-[9px] font-bold text-rose-600 bg-[#FFF1F2] px-2 py-0.2 rounded-full border border-rose-200/80">
                Direct Triggers
              </span>
            </div>

            {/* Action 1: Capture Candidate (Crimson Rose Highlight with #FFF1F2) */}
            <button
              onClick={onOpenCandidate}
              type="button"
              className="group flex items-center gap-2.5 p-2 rounded-lg bg-card border border-border/70 shadow-2xs hover:shadow-xs hover:border-rose-400 hover:bg-[#FFF1F2]/50 transition-all text-left w-full cursor-pointer active:scale-[0.99]"
            >
              <div className="p-1.5 rounded-md bg-[#FFF1F2] border border-rose-200/80 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11.5px] font-bold text-foreground group-hover:text-rose-600 transition-colors">
                    Capture Talent
                  </h5>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-sm bg-[#FFF1F2] text-rose-600 border border-rose-200">
                    + Intake
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Resume parse or candidate intake
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Action 2: Post Job Requirement */}
            <button
              onClick={onOpenJob}
              type="button"
              className="group flex items-center gap-2.5 p-2 rounded-lg bg-card border border-border/70 shadow-2xs hover:shadow-xs hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left w-full cursor-pointer active:scale-[0.99]"
            >
              <div className="p-1.5 rounded-md bg-blue-50 border border-blue-200/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11.5px] font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    Post Requisition
                  </h5>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-600 border border-blue-200">
                    + Job
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Publish open job targets & CV quotas
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Action 3: Onboard Client */}
            <button
              onClick={onOpenClient}
              type="button"
              className="group flex items-center gap-2.5 p-2 rounded-lg bg-card border border-border/70 shadow-2xs hover:shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left w-full cursor-pointer active:scale-[0.99]"
            >
              <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11.5px] font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Onboard Client
                  </h5>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200">
                    + Client
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Set up corporate accounts & billing
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          {/* Operational Pulse (Team & Agreements Cards - Fully visible and well-proportioned) */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {/* Team Members Card */}
            <Link
              href="/teammembers"
              className="group p-2.5 sm:p-3 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md hover:border-teal-500/50 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                    Team Members
                  </span>
                  <div className="p-1 rounded-md bg-teal-50 border border-teal-200/60 text-teal-600 shadow-2xs">
                    <UserCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {usersTotal}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground">recruiters</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full h-1 bg-muted/80 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500 rounded-full"
                    style={{ width: `${usersActivePercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-teal-600">
                  <span>{usersActive} Active</span>
                  <span className="text-muted-foreground">100%</span>
                </div>
              </div>
            </Link>

            {/* Active Contracts Card */}
            <Link
              href="/clients"
              className="group p-2.5 sm:p-3 rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md hover:border-rose-400/50 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                    Agreements
                  </span>
                  <div className="p-1 rounded-md bg-[#FFF1F2] border border-rose-200/80 text-rose-600 shadow-2xs">
                    <FileText className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {contractsTotal}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground">executed</span>
                </div>
              </div>

              <div className="p-1 rounded-md bg-[#FFF1F2] border border-rose-200/80 flex items-center justify-between text-[9px] font-bold text-rose-600">
                <span className="uppercase tracking-wider">Verified Legal</span>
                <ShieldCheck className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
