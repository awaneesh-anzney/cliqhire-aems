"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, Info, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProbationObject {
  isOnProbation: boolean;
  period: string;
  periodLabel: string;
  periodDays: number;
  joinDate?: string;
  startDate?: string;
  endDate?: string;
  status: "Active" | "Extended" | "Completed" | "Terminated";
  extensionReason?: string;
  extendedByDays?: number | null;
  notes?: string;
  remainingDays: number;
  daysElapsed: number;
  percentComplete: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

interface Props {
  probation: ProbationObject | null | undefined;
}

function getProbationBadge(probation: ProbationObject) {
  if (probation.status === "Completed") {
    return { label: "✅ Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  }
  if (probation.status === "Terminated") {
    return { label: "❌ Terminated", className: "bg-rose-100 text-rose-800 border-rose-200" };
  }
  if (probation.status === "Extended") {
    return { label: "🔄 Extended", className: "bg-amber-100 text-amber-800 border-amber-200" };
  }
  if (probation.isExpired) {
    return { label: "⚠️ Expired", className: "bg-red-100 text-red-800 border-red-200" };
  }
  if (probation.isExpiringSoon) {
    return { label: "⏰ Expiring Soon", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  }
  return { label: "🟡 Active", className: "bg-blue-100 text-blue-800 border-blue-200" };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function CandidateProbationCard({ probation }: Props) {
  if (!probation || !probation.isOnProbation) return null;

  const badge = getProbationBadge(probation);
  const isExpiring = probation.isExpiringSoon && !probation.isExpired && probation.status !== "Completed" && probation.status !== "Terminated";
  const isOver = probation.isExpired && probation.status !== "Completed" && probation.status !== "Terminated";

  return (
    <div className="bg-card rounded-xl border border-border shadow-md relative p-4">
      {/* Glow decorative effect */}
      <div className={cn(
        "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -mr-24 -mt-12 opacity-15 transition-all",
        probation.status === "Completed" && "bg-emerald-500",
        probation.status === "Terminated" && "bg-red-500",
        isOver && "bg-rose-500",
        isExpiring && "bg-yellow-500",
        probation.status === "Active" && "bg-blue-500"
      )} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Probation Tracking</h3>
            <p className="text-[10px] font-medium text-muted-foreground">Monitoring employee alignment & performance</p>
          </div>
        </div>
        
        <Badge className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border shadow-sm", badge.className)}>
          {badge.label}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative z-10">
        <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex flex-col justify-center">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Period</span>
          <span className="text-sm font-bold text-foreground mt-0.5">
            {probation.periodLabel || `${probation.periodDays} Days`}
          </span>
          <span className="text-[9px] text-muted-foreground mt-0.5">({probation.periodDays} days total)</span>
        </div>

        <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex flex-col justify-center">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status Details</span>
          <span className={cn(
            "text-sm font-bold mt-0.5 truncate",
            isOver && "text-red-600",
            isExpiring && "text-amber-600",
            probation.status === "Completed" && "text-emerald-600",
            probation.status === "Terminated" && "text-rose-600",
            probation.status === "Active" && "text-blue-600"
          )}>
            {isOver ? (
              <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Action Required</span>
            ) : isExpiring ? (
              <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Expiring Soon</span>
            ) : probation.status === "Completed" ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Successful</span>
            ) : probation.status === "Terminated" ? (
              <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Terminated</span>
            ) : (
              "On Track"
            )}
          </span>
          <span className="text-[9px] text-muted-foreground mt-0.5">
            {probation.remainingDays > 0 
              ? `${probation.remainingDays} days remaining` 
              : probation.status === "Completed" 
                ? "Completed successfully" 
                : "Probation ended"}
          </span>
        </div>

        <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex flex-col justify-center col-span-1 md:col-span-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Date</p>
              <p className="font-semibold text-foreground mt-0.5">{formatDate(probation.startDate)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">End Date</p>
              <p className="font-semibold text-foreground mt-0.5">{formatDate(probation.endDate)}</p>
            </div>
          </div>
          {probation.joinDate && (
            <p className="text-[9px] text-muted-foreground mt-1.5">
              Employee joined on: <span className="font-semibold">{formatDate(probation.joinDate)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 relative z-10 bg-muted/40 border border-border/50 rounded-xl p-3">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          <span>Progress ({probation.percentComplete}%)</span>
          <span className={cn(
            isExpiring && "text-amber-600",
            isOver && "text-red-600"
          )}>
            {probation.daysElapsed} days elapsed / {probation.remainingDays} left
          </span>
        </div>
        <div className="w-full bg-muted-foreground/10 rounded-full h-2 overflow-hidden border border-border/30">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              probation.status === "Completed" && "bg-emerald-500",
              probation.status === "Terminated" && "bg-rose-500",
              isOver && "bg-red-500 animate-pulse",
              isExpiring && "bg-amber-500 animate-pulse",
              probation.status === "Active" && "bg-blue-500"
            )}
            style={{ width: `${Math.min(100, Math.max(0, probation.percentComplete))}%` }}
          />
        </div>
        {probation.endDate && probation.status !== "Completed" && probation.status !== "Terminated" && (
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            The probation period will end on <span className="font-bold text-foreground">{formatDate(probation.endDate)}</span>.
          </p>
        )}
      </div>

      {/* Extension Details and Notes */}
      {(probation.notes || probation.extensionReason) && (
        <div className="relative z-10 bg-muted/40 border border-border/50 rounded-xl p-3 text-xs space-y-2">
          {probation.extensionReason && (
            <div className="flex gap-2 items-start text-amber-800 bg-amber-50/30 border border-amber-100/50 p-2 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider">Extension Reason</p>
                <p className="font-medium mt-0.5 leading-relaxed">{probation.extensionReason}</p>
                {probation.extendedByDays && (
                  <p className="text-[9px] text-amber-600 font-bold mt-1">Extended by {probation.extendedByDays} Days</p>
                )}
              </div>
            </div>
          )}

          {probation.notes && (
            <div className="flex gap-2 items-start text-foreground bg-card border border-border/40 p-2 rounded-lg shadow-sm">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Observations & Remarks</p>
                <p className="font-medium mt-0.5 leading-relaxed text-muted-foreground">{probation.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
