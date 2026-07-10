"use client";

import React from "react";
import { Briefcase, Bell, CheckCircle2, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TodoStatsProps {
  counts: {
    assignedJobs: number;
    personalTasks: number;
    reminderTasks: number;
  };
  responseTime?: string;
  isLoading: boolean;
}

export function TodoStats({ counts, responseTime, isLoading }: TodoStatsProps) {
  return (
    <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Assigned Jobs */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all group">
        <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform dark:text-blue-400">
          <Briefcase className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Jobs</p>
          {isLoading ? (
            <Skeleton className="h-6 w-10 mt-1" />
          ) : (
            <h3 className="text-xl font-black text-foreground mt-0.5">{counts.assignedJobs || 0}</h3>
          )}
        </div>
      </div>

      {/* Card 2: Reminders */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all group">
        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform dark:text-emerald-400">
          <Bell className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reminders</p>
          {isLoading ? (
            <Skeleton className="h-6 w-10 mt-1" />
          ) : (
            <h3 className="text-xl font-black text-foreground mt-0.5">{counts.reminderTasks || 0}</h3>
          )}
        </div>
      </div>

      {/* Card 3: Personal Tasks Pending */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all group">
        <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform dark:text-amber-400">
          <CheckCircle2 className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Tasks</p>
          {isLoading ? (
            <Skeleton className="h-6 w-10 mt-1" />
          ) : (
            <h3 className="text-xl font-black text-foreground mt-0.5">{counts.personalTasks || 0}</h3>
          )}
        </div>
      </div>

      {/* Card 4: Performance */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all group">
        <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform dark:text-indigo-400">
          <Zap className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Performance</p>
          {isLoading ? (
            <Skeleton className="h-6 w-16 mt-1" />
          ) : (
            <h3 className="text-xl font-black text-foreground mt-0.5">
              {responseTime ?? "0ms"}
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
