"use client";

import React, { useState } from "react";
import { RefreshCw, Activity, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { AuditLogSummaryCards } from "@/components/admin/audit-log-summary";
import { AuditLogFeed } from "@/components/admin/audit-log-feed";
import { PerformanceTab } from "@/components/admin/performance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type TimeRange = "today" | "weekly" | "monthly" | "yearly";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("audit-log");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const queries = [];

      if (activeTab === "audit-log") {
        queries.push(
          queryClient.invalidateQueries({ queryKey: ["auditLogs"] }),
          queryClient.invalidateQueries({ queryKey: ["auditLogSummary"] })
        );
      } else if (activeTab === "performance") {
        queries.push(
          queryClient.invalidateQueries({ queryKey: ["performance"] }),
          queryClient.invalidateQueries({ queryKey: ["usersPerformance"] }),
          queryClient.invalidateQueries({ queryKey: ["teamPerformance"] })
        );
      }

      await Promise.all(queries);
      toast.success("Admin telemetry refreshed");
    } catch {
      toast.error("Failed to refresh telemetry");
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col overflow-hidden p-2.5 sm:p-3 md:p-3.5 gap-2 bg-background animate-in fade-in duration-200">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full min-h-0 flex flex-col gap-2 overflow-hidden w-full"
      >
        {/* Modern, Space-Efficient Executive Command Header */}
        <header className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-slate-900 text-primary-foreground py-2 px-3 sm:px-4 border border-white/10 shadow-sm shrink-0">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-10 h-24 w-32 rounded-full bg-white/5 blur-xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Title & Live Telemetry Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="h-7 w-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>

              <div className="flex items-baseline gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Admin Operations
                </h1>
                <span className="hidden md:inline text-[11px] font-medium text-white/75">
                  Real-time telemetry & team conversions
                </span>
              </div>

              {/* Live indicator */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </div>
            </div>

            {/* Segmented Tab Controls & Refresh Action */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <TabsList className="bg-black/25 p-0.5 rounded-lg border border-white/15 backdrop-blur-md shadow-inner flex h-7.5">
                <TabsTrigger
                  value="audit-log"
                  className="gap-1.5 rounded-md py-0.5 px-3 font-black text-[10.5px] uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-primary text-white/80 data-[state=active]:shadow-2xs hover:text-white"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Audit Stream</span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="gap-1.5 rounded-md py-0.5 px-3 font-black text-[10.5px] uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-primary text-white/80 data-[state=active]:shadow-2xs hover:text-white"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Performance</span>
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="h-7.5 px-2.5 sm:px-3 gap-1.5 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white rounded-lg transition-all active:scale-95 shadow-2xs text-[10.5px] font-black uppercase tracking-wider backdrop-blur-md"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh real-time data"
              >
                <RefreshCw
                  className={cn("h-3 w-3 text-white", isRefreshing && "animate-spin")}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Audit Log Stream Tab Content */}
        <TabsContent
          value="audit-log"
          className="data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:flex-col gap-2 m-0 overflow-hidden outline-none"
        >
          {/* High-Efficiency 24h Activity Strip */}
          <AuditLogSummaryCards
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
          />

          {/* Space-Efficient Feed with Sticky Table & Pinned Pagination */}
          <AuditLogFeed
            entityType={selectedEntity}
            onEntityTypeChange={setSelectedEntity}
          />
        </TabsContent>

        {/* Performance Metrics Tab Content */}
        <TabsContent
          value="performance"
          className="data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:flex-col m-0 overflow-hidden outline-none"
        >
          <PerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}