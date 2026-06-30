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
    <div className="dashboard-container">
      
      {/* Optimized Welcome Section - Dark/Brand Theme with Modern Animations */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white py-4 px-5 shadow-md border border-zinc-800 transition-all duration-500 hover:shadow-lg hover:shadow-zinc-900/20">
        {/* Abstract Background Elements with Floating Animation */}
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] transition-all duration-1000 group-hover:scale-120 group-hover:-translate-x-12 animate-pulse" />
          <div className="absolute top-1/2 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-[60px] transition-all duration-1000 group-hover:scale-110 group-hover:-translate-y-12" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/20 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary-foreground">
              <ShieldAlert className="w-3.5 h-3.5" />
              System Management
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
              Admin Control Panel
            </h3>
            <p className="text-zinc-400 font-bold text-[11px] sm:text-xs max-w-xl animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
              Monitor system logs, candidate conversions, team metrics, and tracking logs in real-time.
            </p>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 gap-2 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="font-bold text-xs">Refresh Data</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="flex w-full sm:w-[350px] bg-muted/65 p-1 rounded-xl border border-border/50 shadow-inner">
          <TabsTrigger 
            value="audit-log" 
            className="flex-1 gap-2 rounded-lg py-2 font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-sm"
          >
            <Activity className="h-3.5 w-3.5" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="flex-1 gap-2 rounded-lg py-2 font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-sm"
          >
            <BarChart className="h-3.5 w-3.5" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit-log" className="space-y-6 mt-2">
          {/* Stats Row */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last 24 Hours Overview</h4>
            </div>
            <AuditLogSummaryCards />
          </div>

          {/* Feed Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Activity Feed</h4>
            <AuditLogFeed />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-2">
          <PerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}