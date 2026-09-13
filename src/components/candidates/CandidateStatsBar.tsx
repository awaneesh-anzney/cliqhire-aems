"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  UserCheck,
  UserX,
  MinusCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Candidate } from "@/services/candidateService";

interface CandidateStatsBarProps {
  totalCount: number;
  candidates: Candidate[];
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  className?: string;
}

export const CandidateStatsBar: React.FC<CandidateStatsBarProps> = ({
  totalCount,
  candidates = [],
  selectedStatus = "All",
  onSelectStatus,
  className,
}) => {
  const counts = React.useMemo(() => {
    let active = 0;
    let shortlisted = 0;
    let interviewing = 0;
    let offer = 0;
    let hired = 0;
    let inactive = 0;
    let rejected = 0;
    let withdrawn = 0;

    candidates.forEach((c) => {
      const s = (c.status || "").toLowerCase();
      if (s === "active") active++;
      else if (s === "shortlisted") shortlisted++;
      else if (s === "interviewing") interviewing++;
      else if (s === "offer") offer++;
      else if (s === "hired" || s === "placed") hired++;
      else if (s === "inactive") inactive++;
      else if (s === "rejected") rejected++;
      else if (s === "withdrawn") withdrawn++;
    });

    return {
      active,
      shortlisted,
      interviewing,
      offer,
      hired,
      inactive,
      rejected,
      withdrawn,
    };
  }, [candidates]);

  const statusItems = [
    {
      id: "All",
      label: "All Candidates",
      count: totalCount,
      icon: Users,
      color: "primary",
      activeClasses: "bg-primary/10 border-primary/30 text-primary shadow-xs",
      badgeClasses: "bg-primary/15 text-primary",
    },
    {
      id: "Active",
      label: "Active",
      count: counts.active,
      icon: CheckCircle2,
      color: "emerald",
      activeClasses:
        "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs",
      badgeClasses:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "Shortlisted",
      label: "Shortlisted",
      count: counts.shortlisted,
      icon: UserCheck,
      color: "blue",
      activeClasses:
        "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs",
      badgeClasses: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "Interviewing",
      label: "Interviewing",
      count: counts.interviewing,
      icon: Clock,
      color: "amber",
      activeClasses:
        "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs",
      badgeClasses: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "Offer",
      label: "Offer",
      count: counts.offer,
      icon: Briefcase,
      color: "purple",
      activeClasses:
        "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-xs",
      badgeClasses: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      id: "Hired",
      label: "Hired / Placed",
      count: counts.hired,
      icon: CheckCircle2,
      color: "teal",
      activeClasses:
        "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-xs",
      badgeClasses: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      id: "Inactive",
      label: "Inactive",
      count: counts.inactive,
      icon: MinusCircle,
      color: "slate",
      activeClasses:
        "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400 shadow-xs",
      badgeClasses: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
    {
      id: "Rejected",
      label: "Rejected",
      count: counts.rejected,
      icon: UserX,
      color: "rose",
      activeClasses:
        "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-xs",
      badgeClasses: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 select-none",
        className
      )}
    >
      {statusItems.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedStatus === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectStatus && onSelectStatus(item.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              isSelected
                ? item.activeClasses
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-medium">{item.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
                isSelected
                  ? item.badgeClasses
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
