"use client"

import { Bar, Doughnut, Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Briefcase, Building2, TrendingUp } from "lucide-react"
import type { TimeRange } from "@/app/(protected)/admin/page"
import type { DashboardStats } from "@/services/dashboardService"

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

interface AdminChartsProps {
    timeRange: TimeRange
    stats?: DashboardStats
    loading?: boolean
}

// Distribute a total evenly across N time buckets with slight growth curve
function distributeEvenly(total: number, points: number): number[] {
    if (total === 0 || points === 0) return Array(points).fill(0)
    const base = Math.floor(total / points)
    return Array.from({ length: points }, (_, i) => {
        const extra = i === points - 1 ? total - base * (points - 1) : base
        return extra
    })
}

export function AdminCharts({ timeRange, stats, loading }: AdminChartsProps) {
    const colors = {
        violet: "#6366f1",
        violetAlpha: "rgba(99, 102, 241, 0.12)",
        sky: "#0ea5e9",
        skyAlpha: "rgba(14, 165, 233, 0.10)",
        emerald: "#10b981",
        emeraldAlpha: "rgba(16, 185, 129, 0.10)",
        grid: "rgba(0,0,0,0.05)",
    }

    const totalCandidates = stats?.candidates?.total ?? 0
    const activeJobs = stats?.jobs?.active ?? 0
    const totalClients = stats?.clients?.total ?? 0
    const hired = stats?.pipeline?.candidatesHired ?? 0
    const interviewing = stats?.pipeline?.candidatesInterviewing ?? 0
    const activePipelines = stats?.pipeline?.activePipelines ?? 0
    const leadCount = stats?.clients?.byStage?.lead ?? 0
    const engagedCount = stats?.clients?.byStage?.engaged ?? 0
    const signedCount = stats?.clients?.byStage?.signed ?? 0

    const trendLabels: Record<TimeRange, string[]> = {
        today: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
        weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        monthly: ["Week 1", "Week 2", "Week 3", "Week 4"],
        yearly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    }

    const labels = trendLabels[timeRange]
    const n = labels.length

    const trendData = {
        labels,
        datasets: [
            {
                label: "Candidates",
                data: distributeEvenly(totalCandidates, n),
                borderColor: colors.violet,
                backgroundColor: colors.violetAlpha,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2,
                pointBackgroundColor: colors.violet,
            },
            {
                label: "Active Jobs",
                data: distributeEvenly(activeJobs, n),
                borderColor: colors.sky,
                backgroundColor: colors.skyAlpha,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2,
                pointBackgroundColor: colors.sky,
            },
            {
                label: "Clients",
                data: distributeEvenly(totalClients, n),
                borderColor: colors.emerald,
                backgroundColor: colors.emeraldAlpha,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2,
                pointBackgroundColor: colors.emerald,
            },
        ],
    }

    const pipelineData = {
        labels: ["Total Sourced", "Active Pipelines", "Interviewing", "Hired"],
        datasets: [
            {
                label: "Candidates",
                data: [totalCandidates, activePipelines, interviewing, hired],
                backgroundColor: ["#6366f1", "#818cf8", "#0ea5e9", "#10b981"],
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    }

    const clientStageData = {
        labels: ["Lead", "Engaged", "Signed"],
        datasets: [
            {
                data: [leadCount, engagedCount, signedCount],
                backgroundColor: ["#6366f1", "#0ea5e9", "#10b981"],
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    }

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle" as const,
                    boxWidth: 8,
                    padding: 16,
                    font: { size: 12 },
                },
            },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: colors.grid },
                border: { display: false },
                ticks: { font: { size: 11 }, precision: 0 },
            },
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 11 } },
            },
        },
        interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false },
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6 bg-white border border-[hsl(var(--border))]">
                        <Skeleton className="h-5 w-40 mb-6" />
                        <Skeleton className="h-64 w-full" />
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Activity Trend — 2/3 width */}
            <Card className="lg:col-span-2 p-6 bg-white border border-[hsl(var(--border))] shadow-sm">
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        Activity Overview
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        Total Candidates, Active Jobs and Clients distributed across the selected time period
                    </p>
                </div>

                {/* Custom color legend with meaning */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 p-3 bg-[hsl(var(--muted))]/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors.violet }} />
                        <span className="text-xs text-[hsl(var(--foreground))]">
                            <span className="font-semibold">Candidates</span>
                            <span className="text-[hsl(var(--muted-foreground))]"> — profiles added to system</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors.sky }} />
                        <span className="text-xs text-[hsl(var(--foreground))]">
                            <span className="font-semibold">Active Jobs</span>
                            <span className="text-[hsl(var(--muted-foreground))]"> — open job requirements</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors.emerald }} />
                        <span className="text-xs text-[hsl(var(--foreground))]">
                            <span className="font-semibold">Clients</span>
                            <span className="text-[hsl(var(--muted-foreground))]"> — partner companies</span>
                        </span>
                    </div>
                </div>

                <div className="h-[210px]">
                    <Line
                        options={{
                            ...baseOptions,
                            plugins: {
                                ...baseOptions.plugins,
                                legend: { display: false },
                            },
                        } as any}
                        data={trendData}
                    />
                </div>

                {/* Totals summary strip */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[hsl(var(--border))]">
                    {[
                        { icon: Users, bg: "bg-violet-50", color: "text-violet-600", value: totalCandidates, label: "Total Candidates" },
                        { icon: Briefcase, bg: "bg-sky-50", color: "text-sky-600", value: activeJobs, label: "Active Jobs" },
                        { icon: Building2, bg: "bg-emerald-50", color: "text-emerald-600", value: totalClients, label: "Total Clients" },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[hsl(var(--foreground))]">{s.value.toLocaleString()}</div>
                                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Client Stages Doughnut — 1/3 width */}
            <Card className="p-6 bg-white border border-[hsl(var(--border))] shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Client Stages</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        Lead → Engaged → Signed
                    </p>
                </div>
                <div className="h-[170px]">
                    <Doughnut
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: "68%",
                            plugins: {
                                legend: {
                                    position: "bottom" as const,
                                    labels: {
                                        usePointStyle: true,
                                        pointStyle: "circle" as const,
                                        boxWidth: 8,
                                        padding: 10,
                                        font: { size: 11 },
                                    },
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} clients`,
                                    },
                                },
                            },
                        }}
                        data={clientStageData}
                    />
                </div>
                <div className="text-center mt-3">
                    <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalClients}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">Total Clients</div>
                </div>
            </Card>

            {/* Recruitment Funnel Bar — full width */}
            <Card className="lg:col-span-3 p-6 bg-white border border-[hsl(var(--border))] shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            Recruitment Funnel
                        </h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                            Number of candidates at each stage — from sourcing to final placement
                        </p>
                    </div>
                    {hired > 0 && totalCandidates > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-600">
                                {Math.round((hired / totalCandidates) * 100)}% hire rate
                            </span>
                        </div>
                    )}
                </div>

                <div className="h-[160px]">
                    <Bar
                        options={{
                            ...baseOptions,
                            plugins: {
                                ...baseOptions.plugins,
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx: any) => ` ${ctx.parsed.y} candidates`,
                                    },
                                },
                            },
                        } as any}
                        data={pipelineData}
                    />
                </div>

                {/* Stage cards below bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[hsl(var(--border))]">
                    {[
                        { label: "Total Sourced", value: totalCandidates, desc: "All candidate profiles", color: "#6366f1", bg: "bg-violet-50", text: "text-violet-600" },
                        { label: "Active Pipelines", value: activePipelines, desc: "Ongoing recruitment drives", color: "#818cf8", bg: "bg-indigo-50", text: "text-indigo-500" },
                        { label: "Interviewing", value: interviewing, desc: "Scheduled or ongoing interviews", color: "#0ea5e9", bg: "bg-sky-50", text: "text-sky-600" },
                        { label: "Hired", value: hired, desc: "Successfully placed", color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-600" },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                            <div className={`text-xl font-bold ${s.text}`}>{s.value.toLocaleString()}</div>
                            <div className="text-xs font-semibold text-[hsl(var(--foreground))] mt-0.5">{s.label}</div>
                            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 leading-snug">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}