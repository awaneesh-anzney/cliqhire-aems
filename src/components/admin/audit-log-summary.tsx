"use client";

import React from "react";
import { useAuditLogSummary } from "@/hooks/useAuditLog";
import { Activity, Users, Briefcase, FileText, Paperclip, LogIn, Building2, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Candidate: Users,
  Job: Briefcase,
  Client: Building2,
  Pipeline: Activity,
  Note: FileText,
  Attachment: Paperclip,
  Auth: LogIn,
};

const ENTITY_COLORS: Record<string, { bg: string; text: string; activeBg: string; border: string }> = {
  Candidate: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    activeBg: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  Job: {
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    activeBg: "bg-blue-600 text-white border-blue-600 shadow-xs",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  Client: {
    bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    activeBg: "bg-indigo-600 text-white border-indigo-600 shadow-xs",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/30",
  },
  Pipeline: {
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    activeBg: "bg-purple-600 text-white border-purple-600 shadow-xs",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  Note: {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    activeBg: "bg-amber-600 text-white border-amber-600 shadow-xs",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  Attachment: {
    bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    activeBg: "bg-pink-600 text-white border-pink-600 shadow-xs",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/30",
  },
  Auth: {
    bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    activeBg: "bg-teal-600 text-white border-teal-600 shadow-xs",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/30",
  },
};

interface AuditLogSummaryCardsProps {
  selectedEntity?: string;
  onSelectEntity?: (entity: string) => void;
  className?: string;
}

export function AuditLogSummaryCards({
  selectedEntity = "ALL",
  onSelectEntity,
  className,
}: AuditLogSummaryCardsProps) {
  const { data, isLoading, isError } = useAuditLogSummary();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 no-scrollbar", className)}>
        <Skeleton className="h-8 w-24 rounded-lg bg-muted/60 shrink-0" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-lg bg-muted/50 shrink-0" />
        ))}
      </div>
    );
  }

  if (isError || !data?.success) {
    return null; // Gracefully degrade without taking vertical space if error
  }

  const summaryData = data.data || [];
  const totalActions = summaryData.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const handleEntityClick = (entity: string) => {
    if (!onSelectEntity) return;
    if (selectedEntity === entity) {
      onSelectEntity("ALL");
    } else {
      onSelectEntity(entity);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0 no-scrollbar select-none", className)}>
      {/* 24h Label & All trigger */}
      <button
        type="button"
        onClick={() => handleEntityClick("ALL")}
        className={cn(
          "inline-flex items-center gap-1.5 h-7.5 sm:h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 border",
          selectedEntity === "ALL"
            ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
            : "bg-card text-muted-foreground border-border/70 hover:border-border hover:text-foreground hover:bg-muted/40"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>All 24h</span>
        <span
          className={cn(
            "px-1.5 py-0.2 rounded-md text-[10px] font-black leading-none",
            selectedEntity === "ALL"
              ? "bg-white/20 text-white"
              : "bg-muted text-foreground"
          )}
        >
          {totalActions}
        </span>
      </button>

      {/* Individual entity summary pills */}
      {summaryData.map((item) => {
        const Icon = ICONS[item.entityType] || Activity;
        const color = ENTITY_COLORS[item.entityType] || {
          bg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
          activeBg: "bg-zinc-700 text-white border-zinc-700 shadow-xs",
          text: "text-zinc-600 dark:text-zinc-400",
          border: "border-zinc-500/30",
        };
        const isSelected = selectedEntity === item.entityType;

        return (
          <button
            key={item.entityType}
            type="button"
            onClick={() => handleEntityClick(item.entityType)}
            className={cn(
              "group inline-flex items-center gap-1.5 h-7.5 sm:h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 border cursor-pointer",
              isSelected
                ? color.activeBg
                : "bg-card hover:bg-muted/40 text-foreground/80 hover:text-foreground border-border/70 hover:border-border"
            )}
          >
            <div
              className={cn(
                "p-0.5 rounded-md transition-all",
                isSelected
                  ? "bg-white/20 text-white"
                  : color.bg
              )}
            >
              <Icon className="h-3 w-3" />
            </div>

            <span className="tracking-tight">{item.entityType}</span>

            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none",
                isSelected
                  ? "bg-white/25 text-white"
                  : "bg-muted text-foreground"
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
