"use client"

import { Users, Briefcase, Building2, CalendarCheck, TrendingUp, UserCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TimeRange } from "@/app/(protected)/admin/page"
import type { DashboardStats } from "@/services/dashboardService"

interface AdminStatsGridProps {
  stats?: DashboardStats
  loading?: boolean
  timeRange: TimeRange
}

const TIME_LABELS: Record<TimeRange, string> = {
  today: "today",
  weekly: "this week",
  monthly: "this month",
  yearly: "this year",
}

export function AdminStatsGrid({ stats, loading, timeRange }: AdminStatsGridProps) {
  const label = TIME_LABELS[timeRange]

  const metrics = [
    {
      title: "Total Candidates",
      value: stats?.candidates?.total ?? 0,
      sub: `Active profiles in database`,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Active Jobs",
      value: stats?.jobs?.active ?? 0,
      sub: `Open requirements ${label}`,
      icon: Briefcase,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Total Clients",
      value: stats?.clients?.total ?? 0,
      sub: `Partners engaged ${label}`,
      icon: Building2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Interviews",
      value: stats?.pipeline?.candidatesInterviewing ?? 0,
      sub: `Candidates interviewing ${label}`,
      icon: CalendarCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Placements",
      value: stats?.pipeline?.candidatesHired ?? 0,
      sub: `Hired ${label}`,
      icon: UserCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Active Pipelines",
      value: stats?.pipeline?.activePipelines ?? 0,
      sub: `Live recruitment pipelines`,
      icon: TrendingUp,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="p-5 border border-[hsl(var(--border))] bg-white shadow-sm hover:shadow-md hover:border-[hsl(var(--primary))] transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider leading-tight">
              {m.title}
            </p>
            <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
          </div>

          {loading ? (
            <>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24 mt-2" />
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold ${m.color} group-hover:scale-105 transition-transform origin-left`}>
                {m.value.toLocaleString()}
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1.5 leading-snug">{m.sub}</p>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}