"use client"

import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle2, Clock, Info, AlertCircle,
  UserPlus, BriefcaseBusiness, Building2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminActivityFeedProps {
  jobs?: any[]
  candidates?: any[]
}

type ActivityType = "success" | "info" | "warning" | "neutral"

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: Date
  type: ActivityType
  entity: "job" | "candidate" | "client"
}

function ActivityIcon({ type, entity }: { type: ActivityType; entity: Activity["entity"] }) {
  const iconClass = "w-4 h-4 flex-shrink-0"

  if (entity === "candidate")
    return <UserPlus className={`${iconClass} text-violet-500`} />
  if (entity === "job")
    return <BriefcaseBusiness className={`${iconClass} text-sky-500`} />
  if (entity === "client")
    return <Building2 className={`${iconClass} text-emerald-500`} />

  const map: Record<ActivityType, JSX.Element> = {
    success: <CheckCircle2 className={`${iconClass} text-emerald-500`} />,
    info: <Info className={`${iconClass} text-blue-500`} />,
    warning: <AlertCircle className={`${iconClass} text-orange-500`} />,
    neutral: <Clock className={`${iconClass} text-slate-400`} />,
  }
  return map[type]
}

export function AdminActivityFeed({ jobs = [], candidates = [] }: AdminActivityFeedProps) {
  const combined: Activity[] = [
    ...jobs.map((j) => ({
      id: `job-${j._id}`,
      user: j.createdBy?.name ?? "Admin",
      action: "posted new job",
      target: j.jobTitle ?? "Untitled Job",
      time: new Date(j.createdAt ?? Date.now()),
      type: "info" as ActivityType,
      entity: "job" as const,
    })),
    ...candidates.map((c) => ({
      id: `cand-${c._id}`,
      user: c.createdBy?.name ?? "Recruiter",
      action: "added candidate",
      target: c.name ?? "Unknown",
      time: new Date(c.createdAt ?? Date.now()),
      type: "success" as ActivityType,
      entity: "candidate" as const,
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 12)

  return (
    <Card className="border border-[hsl(var(--border))] bg-white shadow-sm rounded-xl overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Recent Activity</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Latest actions across the system</p>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full font-medium">
          Live
        </span>
      </div>

      <ScrollArea className="h-[520px]">
        <div className="p-4 space-y-1">
          {combined.length > 0 ? (
            combined.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg hover:bg-[hsl(var(--muted))]/60 transition-colors group"
              >
                {/* Icon */}
                <div className="mt-0.5">
                  <ActivityIcon type={activity.type} entity={activity.entity} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--foreground))] leading-snug">
                    <span className="font-medium">{activity.user}</span>
                    {" "}
                    <span className="text-[hsl(var(--muted-foreground))]">{activity.action}</span>
                    {" "}
                    <span className="font-medium text-[hsl(var(--primary))] truncate">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {formatDistanceToNow(activity.time, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent activity found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}