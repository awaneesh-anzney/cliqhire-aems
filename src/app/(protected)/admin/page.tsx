"use client"

import { Plus, Filter, Download, ArrowRight, LayoutDashboard, Database, PieChart, Info, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsGrid } from "@/components/admin/stats-grid"
import { ActivitySidebar } from "@/components/admin/activity-sidebar"
import { JobsTable } from "@/components/admin/jobs-table"
import { CandidatesTable } from "@/components/admin/candidates-table"
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts"
import { useDashboardStats } from "@/hooks/useDashboard"
import { useJobs } from "@/hooks/useJobs"
import { useCandidates } from "@/hooks/useCandidate"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function AdminPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useJobs({ limit: 10 })
  const { data: candidatesData, isLoading: candidatesLoading, refetch: refetchCandidates } = useCandidates({ limit: 10 })

  return (
    <div className="flex flex-col w-full h-full bg-[hsl(var(--background))] overflow-y-auto">
      {/* Breadcrumb Area */}
      <div className="bg-card border-b border-[hsl(var(--border))] px-8 py-3 w-full">
         <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">
            <LayoutDashboard className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span>Administration</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-[hsl(var(--foreground))] font-bold">Admin Dashboard</span>
         </div>
      </div>

      <main className="flex-1 w-full p-8 space-y-8">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">System Overview</h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Manage global records, active jobs, and core operations.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-10 px-4 font-semibold text-sm border-[hsl(var(--border))]" onClick={() => alert("The export functionality is not fully hooked up in this demo.")}>
               <Download className="w-4 h-4 mr-2" /> Export
             </Button>
             <Link href="/jobs" passHref>
               <Button className="h-10 px-5 font-semibold text-sm bg-[hsl(var(--primary))] hover:opacity-90">
                 <Plus className="w-4 h-4 mr-2" /> Quick Action
               </Button>
             </Link>
          </div>
        </div>

        {/* Core Stats */}
        <StatsGrid stats={stats} loading={statsLoading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Data Section (2/3 width) */}
          <div className="xl:col-span-2 space-y-8">
            
            <Tabs defaultValue="jobs" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <TabsList className="bg-[hsl(var(--muted))] p-1 rounded-lg">
                  <TabsTrigger 
                    value="jobs" 
                    className="rounded-md px-6 py-2 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-sm"
                  >
                    Active Jobs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="talents" 
                    className="rounded-md px-6 py-2 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-sm"
                  >
                    Candidate Pool
                  </TabsTrigger>
                </TabsList>
                
                <Button onClick={() => alert("Filter functionality to be integrated")} variant="outline" size="sm" className="h-9 px-4 text-[hsl(var(--foreground))] font-medium text-sm border-[hsl(var(--border))] bg-card">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>

              <TabsContent value="jobs" className="outline-none focus:ring-0">
                <JobsTable jobs={jobsData?.jobs} loading={jobsLoading} />
              </TabsContent>
              
              <TabsContent value="talents" className="outline-none focus:ring-0">
                <CandidatesTable candidates={candidatesData?.candidates} loading={candidatesLoading} />
              </TabsContent>
            </Tabs>

            {/* Analytics */}
            <section className="space-y-4 pt-6 border-t border-[hsl(var(--border))]">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Analytics & Metrics</h3>
                     <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Key performance indicators for the current period.</p>
                  </div>
               </div>
               <div className="bg-card p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                  <AdminDashboardCharts />
               </div>
            </section>
          </div>

          {/* Sidebar Area (1/3 width) */}
          <aside className="xl:col-span-1">
             <ActivitySidebar jobs={jobsData?.jobs} candidates={candidatesData?.candidates} />
          </aside>
        </div>
      </main>
    </div>
  )
}
