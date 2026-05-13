"use client"

import { Users, Briefcase, Building2, TrendingUp, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsGridProps {
  stats?: any
  loading?: boolean
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  const metrics = [
    {
      title: "Total Candidates",
      value: loading ? "..." : (stats?.candidates?.total || 0).toLocaleString(),
      sub: "Active in database",
      icon: Users,
    },
    {
      title: "Active Jobs",
      value: loading ? "..." : (stats?.jobs?.active || 0).toLocaleString(),
      sub: "Open requirements",
      icon: Briefcase,
    },
    {
      title: "Total Clients",
      value: loading ? "..." : (stats?.clients?.total || 0).toLocaleString(),
      sub: "Partnered companies",
      icon: Building2,
    },
    {
      title: "Interviews",
      value: loading ? "..." : (stats?.pipeline?.candidatesInterviewing || 0).toLocaleString(),
      sub: "Scheduled this week",
      icon: Calendar,
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <Card key={i} className="p-6 border border-[hsl(var(--border))] bg-card shadow-sm hover:border-[hsl(var(--primary))] transition-colors">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{m.title}</h3>
              <m.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
           </div>
           
           <div>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-[hsl(var(--foreground))]">{m.value}</div>
              )}
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{m.sub}</p>
           </div>
        </Card>
      ))}
    </div>
  )
}
