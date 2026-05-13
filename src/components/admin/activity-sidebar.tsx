"use client"

import { Clock, CheckCircle2, Info, AlertCircle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivitySidebarProps {
  jobs?: any[]
  candidates?: any[]
}

export function ActivitySidebar({ jobs = [], candidates = [] }: ActivitySidebarProps) {
  
  // Combine jobs and candidates to create a real activity feed
  type ActivityType = 'success' | 'neutral' | 'info' | 'warning'

  const combinedActivity = [
    ...jobs.map(j => ({
      id: j._id,
      user: "System",
      action: "created job requirement",
      target: j.jobTitle,
      time: new Date(j.createdAt || Date.now()),
      type: "info" as ActivityType
    })),
    ...candidates.map(c => ({
      id: c._id,
      user: c.createdBy?.name || "System",
      action: "added candidate profile",
      target: c.name,
      time: new Date(c.createdAt || Date.now()),
      type: "success" as ActivityType
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
       {/* Activity Feed */}
       <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Recent Activity (Live)</h3>
          <div className="space-y-4">
             {combinedActivity.length > 0 ? combinedActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                   <div className="mt-0.5">
                      {activity.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {activity.type === 'neutral' && <Clock className="w-4 h-4 text-muted-foreground" />}
                      {activity.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      {activity.type === 'warning' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                   </div>
                   <div>
                      <p className="text-sm text-[hsl(var(--foreground))]">
                         <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium text-[hsl(var(--primary))]">{activity.target}</span>
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{formatDistanceToNow(activity.time, { addSuffix: true })}</p>
                   </div>
                </div>
             )) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent activity found.</p>
             )}
          </div>
       </div>

       {/* Priorities List */}
       <div className="pt-6 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Upcoming Priorities</h3>
          <div className="space-y-3">
             <div onClick={() => alert("Calendar integration pending")} className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-card hover:border-[hsl(var(--primary))] transition-colors cursor-pointer">
                <Calendar className="w-4 h-4 mt-0.5 text-[hsl(var(--primary))]" />
                <div>
                   <p className="text-sm font-medium text-[hsl(var(--foreground))]">Client Sync</p>
                   <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Check with key partners</p>
                </div>
             </div>
             <div onClick={() => alert("Budget settings pending")} className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-card hover:border-[hsl(var(--primary))] transition-colors cursor-pointer">
                <AlertCircle className="w-4 h-4 mt-0.5 text-rose-500" />
                <div>
                   <p className="text-sm font-medium text-[hsl(var(--foreground))]">Review Active Roles</p>
                   <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Some jobs need attention</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
