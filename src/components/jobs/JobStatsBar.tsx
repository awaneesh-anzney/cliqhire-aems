"use client";

import React from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users2,
  PauseCircle,
  XCircle,
  Sparkles,
  Layers,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobMetadata } from "@/types/job";

export interface JobStatsBarProps {
  meta?: JobMetadata;
  totalCount: number;
  jobs?: Array<{
    stage?: string;
    headcount?: number;
  }>;
  selectedTab?: string;
  onSelectTab?: (tab: string) => void;
  // Backwards compatibility props
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  className?: string;
}

const STAGES = [
  { key: "Open", label: "Open", color: "#06B6D4", icon: Clock },
  { key: "Active", label: "Active Stage", color: "#3B82F6", icon: CheckCircle2 },
  { key: "Onboarding", label: "Onboarding", color: "#8B5CF6", icon: Sparkles },
  { key: "Hired", label: "Hired", color: "#10B981", icon: Users2 },
  { key: "On Hold", label: "On Hold", color: "#F59E0B", icon: PauseCircle },
  { key: "Closed", label: "Closed", color: "#64748B", icon: XCircle },
];

export const JobStatsBar: React.FC<JobStatsBarProps> = ({
  meta,
  totalCount,
  jobs = [],
  selectedTab,
  onSelectTab,
  selectedStage,
  onSelectStage,
  className,
}) => {
  // Sync selected tab with backward-compatible selectedStage
  const activeKey = selectedTab || selectedStage || "ACTIVE_JOBS";

  const handleSelect = (key: string) => {
    if (onSelectTab) onSelectTab(key);
    if (onSelectStage) onSelectStage(key);
  };

  // Stage breakdown and counts
  const stageBreakdown = meta?.stageBreakdown || [];

  // Headcount calculation from local jobs if not in meta
  const totalHeadcount = React.useMemo(() => {
    return jobs.reduce((acc, j) => acc + (Number(j.headcount) || 1), 0);
  }, [jobs]);

  const totalAllJobs = meta?.total ?? totalCount;
  const activeJobsCount = meta?.active ?? 0;
  const inactiveJobsCount = meta?.inactive ?? 0;

  return (
    <div className={cn("w-full flex flex-col gap-1.5 select-none", className)}>
      {/* Horizontal Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {/* All Jobs Tab */}
        <button
          type="button"
          onClick={() => handleSelect("ALL")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-200 shrink-0",
            activeKey === "ALL"
              ? "bg-primary/10 border-primary/40 text-primary shadow-xs ring-1 ring-primary/20"
              : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-medium">All</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
              activeKey === "ALL"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {totalAllJobs}
          </span>
        </button>

        {/* Active Status Jobs Tab */}
        <button
          type="button"
          onClick={() => handleSelect("ACTIVE_JOBS")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-200 shrink-0",
            activeKey === "ACTIVE_JOBS" || activeKey === "Active_Status"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/20"
              : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium">Active</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
              activeKey === "ACTIVE_JOBS" || activeKey === "Active_Status"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {activeJobsCount}
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-border/80 mx-0.5 shrink-0 hidden sm:block" />

        {/* Specific Stage Tabs */}
        {STAGES.map((st) => {
          const count = meta?.byStage?.[st.key] ?? 0;
          const isSelected = activeKey === st.key;
          const Icon = st.icon;

          return (
            <button
              key={st.key}
              type="button"
              onClick={() => handleSelect(st.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-200 shrink-0",
                isSelected
                  ? "shadow-xs ring-1"
                  : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
              )}
              style={
                isSelected
                  ? {
                      backgroundColor: `${st.color}15`,
                      borderColor: `${st.color}50`,
                      color: st.color,
                      boxShadow: `0 0 0 1px ${st.color}30`,
                    }
                  : undefined
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: st.color }}
              />
              <span className="text-[11px] font-medium">{st.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-md text-[10px] font-bold"
                style={
                  isSelected
                    ? {
                        backgroundColor: `${st.color}25`,
                        color: st.color,
                      }
                    : {
                        backgroundColor: "var(--muted)",
                        color: "var(--muted-foreground)",
                      }
                }
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Right Info: Total Headcount */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/70 bg-card/60 text-xs text-muted-foreground shrink-0 ml-auto hidden md:flex">
          <Users2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-medium">Headcount:</span>
          <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
            {totalHeadcount}
          </span>
        </div>
      </div>

      {/* Slim Stage Breakdown Progress Strip */}
      {stageBreakdown.length > 0 && totalAllJobs > 0 && (
        <div className="w-full flex items-center gap-1">
          <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden flex">
            {stageBreakdown.map((item) => {
              if (item.percentage <= 0) return null;
              const isSelected = activeKey === item.stage;
              return (
                <div
                  key={item.stage}
                  title={`${item.stage}: ${item.count} (${item.percentage}%)`}
                  onClick={() => handleSelect(item.stage)}
                  style={{
                    width: `${Math.max(item.percentage, 1)}%`,
                    backgroundColor: item.color || "#64748B",
                  }}
                  className={cn(
                    "h-full cursor-pointer transition-all duration-300 hover:brightness-125",
                    isSelected ? "brightness-125 ring-1 ring-white/50" : "opacity-90 hover:opacity-100"
                  )}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobStatsBar;
