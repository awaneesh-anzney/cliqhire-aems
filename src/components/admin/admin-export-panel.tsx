"use client"

import { useState } from "react"
import { X, Download, FileSpreadsheet, Users, Briefcase, Building2, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExportCandidates } from "@/hooks/useExportCandidates"
import { useExportClients } from "@/hooks/useExportClients"
import { useExportJobs } from "@/hooks/useExportJobs"
import { useExportUsers } from "@/hooks/useExportUsers"
import type { TimeRange } from "@/app/(protected)/admin/page"

interface AdminExportPanelProps {
    open: boolean
    onClose: () => void
    timeRange: TimeRange
}

// Helper to trigger a file download from a blob
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

// Map timeRange to year/month params
function rangeToParams(timeRange: TimeRange): { year?: number; month?: number } {
    const now = new Date()
    if (timeRange === "today" || timeRange === "monthly") {
        return { year: now.getFullYear(), month: now.getMonth() + 1 }
    }
    if (timeRange === "weekly") {
        return { year: now.getFullYear(), month: now.getMonth() + 1 }
    }
    if (timeRange === "yearly") {
        return { year: now.getFullYear() }
    }
    return {}
}

const TIME_LABELS: Record<TimeRange, string> = {
    today: "Today",
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
}

export function AdminExportPanel({ open, onClose, timeRange }: AdminExportPanelProps) {
    const params = rangeToParams(timeRange)
    const [loading, setLoading] = useState<string | null>(null)

    const exportCandidates = useExportCandidates()
    const exportClients = useExportClients()
    const exportJobs = useExportJobs()
    const exportUsers = useExportUsers()

    if (!open) return null

    const exports = [
        {
            id: "candidates",
            label: "Candidates",
            description: "All candidate profiles and status",
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50",
            action: async () => {
                const blob = await exportCandidates.mutateAsync(params)
                downloadBlob(blob, `candidates-${timeRange}-${Date.now()}.xlsx`)
            },
        },
        {
            id: "jobs",
            label: "Jobs",
            description: "Active and past job listings",
            icon: Briefcase,
            color: "text-sky-600",
            bg: "bg-sky-50",
            action: async () => {
                const blob = await exportJobs.mutateAsync(params)
                downloadBlob(blob, `jobs-${timeRange}-${Date.now()}.xlsx`)
            },
        },
        {
            id: "clients",
            label: "Clients",
            description: "Client accounts and stages",
            icon: Building2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            action: async () => {
                const blob = await exportClients.mutateAsync(params)
                downloadBlob(blob, `clients-${timeRange}-${Date.now()}.xlsx`)
            },
        },
        {
            id: "users",
            label: "Team Members",
            description: "Recruiters and admin users",
            icon: UserCog,
            color: "text-orange-600",
            bg: "bg-orange-50",
            action: async () => {
                const blob = await exportUsers.mutateAsync(params)
                downloadBlob(blob, `team-members-${timeRange}-${Date.now()}.xlsx`)
            },
        },
    ]

    const handleExport = async (item: (typeof exports)[0]) => {
        setLoading(item.id)
        try {
            await item.action()
        } catch (e) {
            console.error("Export error:", e)
        } finally {
            setLoading(null)
        }
    }

    const handleExportAll = async () => {
        setLoading("all")
        for (const item of exports) {
            try {
                await item.action()
            } catch (e) {
                console.error(`Export ${item.id} error:`, e)
            }
        }
        setLoading(null)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-[hsl(var(--primary))]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Export Data</h2>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                                Period: <span className="font-semibold">{TIME_LABELS[timeRange]}</span>
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
                        Download reports as Excel (.xlsx) files for the selected time period.
                    </p>

                    {exports.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--muted))]/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-[hsl(var(--foreground))]">{item.label}</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{item.description}</div>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs font-semibold border-[hsl(var(--border))]"
                                disabled={loading === item.id || loading === "all"}
                                onClick={() => handleExport(item)}
                            >
                                {loading === item.id ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Exporting
                                    </span>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5 mr-1.5" />
                                        Download
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Footer — Export All */}
                <div className="px-6 py-4 border-t border-[hsl(var(--border))]">
                    <Button
                        className="w-full h-10 font-semibold bg-[hsl(var(--primary))] hover:opacity-90"
                        disabled={loading === "all"}
                        onClick={handleExportAll}
                    >
                        {loading === "all" ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Exporting All...
                            </span>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export All ({TIME_LABELS[timeRange]})
                            </>
                        )}
                    </Button>
                    <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-2">
                        All files will be downloaded to your device
                    </p>
                </div>
            </div>
        </>
    )
}