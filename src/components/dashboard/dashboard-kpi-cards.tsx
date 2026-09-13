"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  FileText,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Target,
  Sparkles,
  Rocket,
  CheckCircle2,
  Plus,
  ArrowRight,
  Zap,
  Clock,
  ShieldCheck,
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
      <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
        {/* Skeleton: 4 Primary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-border/70 bg-card/95 shadow-2xs space-y-2.5"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton: Two-Column Main Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
          <div className="lg:col-span-8 p-4 rounded-xl border border-border/70 bg-card/95 shadow-2xs space-y-4">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-4 p-4 rounded-xl border border-border/70 bg-card/95 shadow-2xs space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
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

  // 5. Calculations for Users & Contracts
  const usersTotal = dashboardStats?.users?.total || 0;
  const usersActive = dashboardStats?.users?.active || 0;
  const usersActivePercent = usersTotal > 0 ? (usersActive / usersTotal) * 100 : 0;
  const contractsTotal = dashboardStats?.contracts?.total || 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
      {/* ─── SECTION 1: PRIMARY EXECUTIVE METRICS PULSE STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        {/* Metric 1: Candidates Pool */}
        <Link
          href="/candidates"
          className="group relative p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Candidates Pool
              </span>
            </div>
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {candidatesTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">profiles</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${candidatesActivePercent}%` }}
              />
              <div
                className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                style={{ width: `${candidatesInactivePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
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
          className="group relative p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-2xs hover:shadow-xs hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Job Requisitions
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {jobsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">total roles</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${jobsOpenPercent}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${jobsActivePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {jobsOpen} Open
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {jobsActiveStage} Active
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Client Partners */}
        <Link
          href="/clients"
          className="group relative p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-2xs hover:shadow-xs hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Client Partners
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {clientsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">accounts</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
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
              <span className="text-purple-600">{clientsLead} Lead</span>
              <span className="text-sky-600">{clientsEngaged} Engaged</span>
              <span className="text-emerald-600">{clientsSigned} Signed</span>
            </div>
          </div>
        </Link>

        {/* Metric 4: Pipeline Throughput */}
        <Link
          href="/reactruterpipeline/pipeline"
          className="group relative p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Funnel Throughput
            </span>
            <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-200">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {pipelineTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">in funnel</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((candidatesCompleted / (pipelineTotal || 1)) * 100, 100)}%` }}
              />
              <div className="h-full bg-blue-500 flex-1 opacity-60" />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-bold">
              <span className="text-primary">{activePipelines} Active Pipelines</span>
              <span className="text-emerald-600">{candidatesCompleted} Placed</span>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── SECTION 2: MAIN OPERATIONS & ANALYTICS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Funnel Progression & Requisition Stages (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-xl border border-border/70 bg-card/95 shadow-2xs overflow-hidden">
          {/* Funnel Header */}
          <div className="px-3.5 py-2 border-b border-border/40 bg-muted/15 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                <TrendingUp className="h-3 w-3" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                Recruitment Funnel Velocity
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-[9.5px] font-bold bg-muted/30 text-muted-foreground border-border/60 py-0 px-1.5 h-4.5"
              >
                {pipelineTotal} Total Candidates
              </Badge>
            </div>
          </div>

          {/* Funnel Body */}
          <div className="flex-1 min-h-0 p-3 sm:p-3.5 flex flex-col justify-between overflow-y-auto custom-scrollbar gap-3">
            {/* Funnel Metric Pill Strip */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/15 flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-600/80">
                  Active Pipelines
                </span>
                <span className="text-lg font-black text-blue-600 tracking-tight mt-0.5">
                  {activePipelines}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600/80">
                  In Screening / Review
                </span>
                <span className="text-lg font-black text-amber-600 tracking-tight mt-0.5">
                  {candidatesInProcess}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600/80">
                  Successfully Hired
                </span>
                <span className="text-lg font-black text-emerald-600 tracking-tight mt-0.5">
                  {candidatesCompleted}
                </span>
              </div>
            </div>

            {/* Visual Stage Progression Stepper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" /> Candidate Stage Distribution
                </span>
                <span className="text-[9.5px] font-medium text-muted-foreground">
                  Active pipeline attrition
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
                {stageBreakdown.map((st, idx) => {
                  const stageColors: Record<string, { bg: string; text: string; dot: string }> = {
                    sourcing: { bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
                    screening: { bg: "bg-pink-500/10", text: "text-pink-600", dot: "bg-pink-500" },
                    "client screening": { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
                    interview: { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
                    hired: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
                    onboarding: { bg: "bg-teal-500/10", text: "text-teal-600", dot: "bg-teal-500" },
                    verification: { bg: "bg-indigo-500/10", text: "text-indigo-600", dot: "bg-indigo-500" },
                  };
                  const color =
                    stageColors[st.stage.toLowerCase()] || {
                      bg: "bg-muted/40",
                      text: "text-foreground",
                      dot: "bg-slate-400",
                    };

                  const pct =
                    pipelineTotal > 0 ? Math.round((st.count / pipelineTotal) * 100) : 0;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded-lg border border-border/50 flex flex-col justify-between transition-all hover:scale-[1.02]",
                        color.bg
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dot)} />
                        <span className="text-[9px] font-black uppercase tracking-wider truncate text-muted-foreground">
                          {st.stage}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className={cn("text-sm font-black tracking-tight", color.text)}>
                          {st.count}
                        </span>
                        <span className="text-[8.5px] font-bold text-muted-foreground/80">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Requisitions Stage Breakdown Bar */}
            <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-primary" /> Active Job Requisition Stages
                </span>
                <span className="text-[9.5px] font-bold text-foreground">
                  {jobsTotal} Open Positions
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {jobStageBreakdown.map((js: any, idx: number) => {
                  const stageColors: Record<string, string> = {
                    open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    "on hold": "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    closed: "bg-slate-500/10 text-slate-600 border-slate-500/20",
                    hired: "bg-teal-500/10 text-teal-600 border-teal-500/20",
                    onboarding: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
                  };
                  const color =
                    stageColors[js.stage?.toLowerCase()] ||
                    "bg-muted text-muted-foreground border-border/50";

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9.5px] font-bold",
                        color
                      )}
                    >
                      <span>{js.stage}:</span>
                      <span className="font-black">{js.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action Center & Operational Telemetry (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 overflow-hidden">
          {/* Quick Action Launchpad */}
          <div className="rounded-xl border border-border/70 bg-card/95 shadow-2xs p-3 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Rocket className="w-3 h-3 text-primary" /> Quick Launchpad
              </span>
              <span className="text-[9px] font-bold text-primary">Immediate Actions</span>
            </div>

            {/* Action 1: Onboard Client */}
            <button
              onClick={onOpenClient}
              type="button"
              className="group dashboard-action-card"
            >
              <div className="dashboard-action-icon bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                    Onboard Client
                  </h5>
                  <span className="dashboard-action-badge bg-primary/10 text-primary">
                    + Client
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Set up organization profile & contracts
                </p>
              </div>
              <div className="dashboard-action-circle">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Action 2: Post Job Requirement */}
            <button
              onClick={onOpenJob}
              type="button"
              className="group dashboard-action-card"
            >
              <div className="dashboard-action-icon bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-foreground group-hover:text-amber-600 transition-colors">
                    Post Requisition
                  </h5>
                  <span className="dashboard-action-badge bg-amber-500/10 text-amber-600">
                    + Jobs
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Publish open job targets & CV quotas
                </p>
              </div>
              <div className="dashboard-action-circle">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Action 3: Capture Candidate */}
            <button
              onClick={onOpenCandidate}
              type="button"
              className="group dashboard-action-card"
            >
              <div className="dashboard-action-icon bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-foreground group-hover:text-emerald-600 transition-colors">
                    Capture Talent
                  </h5>
                  <span className="dashboard-action-badge bg-emerald-500/10 text-emerald-600">
                    + Intake
                  </span>
                </div>
                <p className="text-[9.5px] text-muted-foreground truncate leading-tight mt-0.5">
                  Resume parse or manual candidate intake
                </p>
              </div>
              <div className="dashboard-action-circle">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          {/* Operational Pulse (Team & Agreements) */}
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-2.5">
            {/* Team Members Card */}
            <Link
              href="/teammembers"
              className="group p-2.5 rounded-xl border border-border/70 bg-card/95 shadow-2xs hover:shadow-xs hover:border-teal-500/40 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Team Users
                  </span>
                  <div className="p-1 rounded-md bg-teal-500/10 text-teal-600">
                    <UserCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {usersTotal}
                  </span>
                  <span className="text-[9.5px] font-bold text-muted-foreground">accounts</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500"
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
              className="group p-2.5 rounded-xl border border-border/70 bg-card/95 shadow-2xs hover:shadow-xs hover:border-pink-500/40 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Contracts
                  </span>
                  <div className="p-1 rounded-md bg-pink-500/10 text-pink-600">
                    <FileText className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {contractsTotal}
                  </span>
                  <span className="text-[9.5px] font-bold text-muted-foreground">executed</span>
                </div>
              </div>

              <div className="p-1 rounded-md bg-pink-500/5 border border-pink-500/15 flex items-center justify-between text-[9px] font-bold text-pink-600">
                <span className="uppercase tracking-wider">Active</span>
                <ShieldCheck className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
