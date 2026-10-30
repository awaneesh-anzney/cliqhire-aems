"use client";

import React from "react";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { HiredCandidatesSummaryMetrics } from "@/types/hiredCandidate";
import { Skeleton } from "@/components/ui/skeleton";

interface HiredCandidatesMetricsProps {
  summary?: HiredCandidatesSummaryMetrics;
  isLoading?: boolean;
  timeframeLabel?: string;
}

/**
 * Metric KPI Cards for Hired Candidates section.
 * Highlights key recruitment conversion metrics and probation status.
 */
export const HiredCandidatesMetrics: React.FC<HiredCandidatesMetricsProps> = ({
  summary,
  isLoading = false,
  timeframeLabel,
}) => {
  const cards = [
    {
      id: "total-hired",
      title: "Total Hired",
      value: summary?.totalHired ?? 0,
      subtitle: timeframeLabel ? `Placed in ${timeframeLabel}` : "Total candidate placements",
      icon: UserCheck,
      color: "#10B981", // Emerald
      bg: "#ECFDF5",
      darkBg: "rgba(16, 185, 129, 0.12)",
      borderColor: "#A7F3D0",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "probation-active",
      title: "On Probation",
      value: summary?.currentlyOnProbation ?? 0,
      subtitle: "Active onboarding & evaluation",
      icon: Clock,
      color: "#2563EB", // Blue
      bg: "#EFF6FF",
      darkBg: "rgba(37, 99, 235, 0.12)",
      borderColor: "#BFDBFE",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "probation-completed",
      title: "Probation Cleared",
      value: summary?.probationCompleted ?? 0,
      subtitle: "Confirmed permanent hires",
      icon: CheckCircle2,
      color: "#059669", // Teal/Green
      bg: "#F0FDF4",
      darkBg: "rgba(5, 150, 105, 0.12)",
      borderColor: "#BBF7D0",
      accent: "text-teal-600 dark:text-teal-400",
    },
    {
      id: "probation-expiring",
      title: "Expiring Soon",
      value: summary?.probationExpiringSoon ?? 0,
      subtitle: "Probation ends in <15 days",
      icon: AlertTriangle,
      color: (summary?.probationExpiringSoon ?? 0) > 0 ? "#F59E0B" : "#64748B",
      bg: (summary?.probationExpiringSoon ?? 0) > 0 ? "#FFFBEB" : "#F8FAFC",
      darkBg: (summary?.probationExpiringSoon ?? 0) > 0 ? "rgba(245, 158, 11, 0.12)" : "rgba(100, 116, 139, 0.12)",
      borderColor: (summary?.probationExpiringSoon ?? 0) > 0 ? "#FDE68A" : "#E2E8F0",
      accent: (summary?.probationExpiringSoon ?? 0) > 0 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-500 dark:text-slate-400",
      highlight: (summary?.probationExpiringSoon ?? 0) > 0,
    },
    {
      id: "offer-letter",
      title: "Offer Letters",
      value: summary?.withOfferLetterCount ?? 0,
      subtitle: "Formal offer documents attached",
      icon: FileText,
      color: "#6366F1", // Indigo
      bg: "#EEF2FF",
      darkBg: "rgba(99, 102, 241, 0.12)",
      borderColor: "#C7D2FE",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <Skeleton className="h-5 w-12 mt-2" />
            <Skeleton className="h-2.5 w-24 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative p-2.5 sm:p-3 rounded-xl border bg-white dark:bg-slate-900 transition-all duration-200 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-sm flex flex-col justify-between ${
              card.highlight
                ? "border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-300/40"
                : "border-[#E7EDF4] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: card.bg,
                  color: card.color,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {card.value.toLocaleString()}
                </span>
                {card.highlight && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    Action
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

