"use client"

import { useState } from "react"
import { RefreshCw, Activity, ShieldAlert, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { AuditLogSummaryCards } from "@/components/admin/audit-log-summary"
import { AuditLogFeed } from "@/components/admin/audit-log-feed"
import { PerformanceTab } from "@/components/admin/performance-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type TimeRange = "today" | "weekly" | "monthly" | "yearly"

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("audit-log")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    const queries = []
    
    if (activeTab === "audit-log") {
      queries.push(
        queryClient.invalidateQueries({ queryKey: ["auditLogs"] }),
        queryClient.invalidateQueries({ queryKey: ["auditLogSummary"] })
      )
    } else if (activeTab === "performance") {
      queries.push(
        queryClient.invalidateQueries({ queryKey: ["performance"] })
      )
    }

    await Promise.all(queries)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="flex flex-col w-full min-h-full bg-background">
      <main className="flex-1 w-full p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Header Row — Title + Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Centralized management for system operations, tracking, and metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="audit-log" className="gap-2">
              <Activity className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit-log" className="space-y-8 mt-6">
            {/* Stats Row */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold tracking-tight">Last 24 Hours Overview</h3>
              </div>
              <AuditLogSummaryCards />
            </div>

            {/* Feed Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Detailed Activity Feed</h3>
              <AuditLogFeed />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceTab />
          </TabsContent>
        </Tabs>

      </main>
    </div>
  )
}