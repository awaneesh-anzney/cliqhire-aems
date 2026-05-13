"use client"

import { useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid"
import { AdminCharts } from "@/components/admin/admin-charts"
import { AdminDataTabs } from "@/components/admin/admin-data-tabs"
import { AdminActivityFeed } from "@/components/admin/admin-activity-feed"
import { AdminExportPanel } from "@/components/admin/admin-export-panel"
import { useDashboardStats } from "@/hooks/useDashboard"
import { useJobs } from "@/hooks/useJobs"
import { useCandidates } from "@/hooks/useCandidate"

export type TimeRange = "today" | "weekly" | "monthly" | "yearly"

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year", value: "yearly" },
]

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly")
  const [exportOpen, setExportOpen] = useState(false)

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats()

  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useJobs({ limit: 50 })

  const {
    data: candidatesData,
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
  } = useCandidates({ limit: 50 })

  const handleRefresh = () => {
    refetchStats()
    refetchJobs()
    refetchCandidates()
  }

  // Filter jobs & candidates to last 7 days for the table view
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentJobs = (jobsData?.jobs ?? []).filter(
    (j) => j.createdAt && new Date(j.createdAt) >= sevenDaysAgo
  )
  const recentCandidates = (candidatesData?.candidates ?? []).filter(
    (c) => c.createdAt && new Date(c.createdAt) >= sevenDaysAgo
  )

  return (
    <div className="flex flex-col w-full min-h-full bg-[hsl(var(--background))]">
      <main className="flex-1 w-full p-6 space-y-6">

        {/* Header Row — Title + Time Filter + Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              System Overview
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
              Monitor global operations — jobs, candidates, clients, and team activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Toggle */}
            <div className="flex items-center bg-[hsl(var(--muted))] rounded-lg p-1 gap-0.5">
              {TIME_RANGES.map((tr) => (
                <button
                  key={tr.value}
                  onClick={() => setTimeRange(tr.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === tr.value
                    ? "bg-white text-[hsl(var(--primary))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-[hsl(var(--border))]"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* Export */}
            <Button
              size="sm"
              className="h-9 px-4 font-semibold bg-[hsl(var(--primary))] hover:opacity-90"
              onClick={() => setExportOpen(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <AdminStatsGrid stats={stats} loading={statsLoading} timeRange={timeRange} />

        {/* Charts Row */}
        <AdminCharts timeRange={timeRange} stats={stats} loading={statsLoading} />

        {/* Data Tables + Activity Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AdminDataTabs
              jobs={recentJobs}
              candidates={recentCandidates}
              jobsLoading={jobsLoading}
              candidatesLoading={candidatesLoading}
              timeRange={timeRange}
            />
          </div>
          <div className="xl:col-span-1">
            <AdminActivityFeed
              jobs={recentJobs}
              candidates={recentCandidates}
            />
          </div>
        </div>
      </main>

      {/* Export Panel (slide-in or modal) */}
      <AdminExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        timeRange={timeRange}
      />
    </div>
  )
}