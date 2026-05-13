"use client"

import { useState } from "react"
import { MoreHorizontal, MapPin, Mail, Phone, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import type { TimeRange } from "@/app/(protected)/admin/page"

interface AdminDataTabsProps {
    jobs?: any[]
    candidates?: any[]
    jobsLoading?: boolean
    candidatesLoading?: boolean
    timeRange: TimeRange
}

function JobStatusBadge({ stage }: { stage?: string }) {
    const map: Record<string, string> = {
        Active: "bg-emerald-100 text-emerald-700",
        Closed: "bg-slate-100 text-slate-600",
        Draft: "bg-amber-100 text-amber-700",
        Paused: "bg-orange-100 text-orange-700",
    }
    const cls = map[stage ?? ""] ?? "bg-slate-100 text-slate-600"
    return (
        <Badge className={`rounded-md font-medium text-xs px-2.5 py-0.5 border-none ${cls}`}>
            {stage ?? "Draft"}
        </Badge>
    )
}

function LoadingRows({ cols = 5 }: { cols?: number }) {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={cols} className="py-4">
                        <Skeleton className="h-8 w-full" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}

export function AdminDataTabs({
    jobs, candidates, jobsLoading, candidatesLoading, timeRange,
}: AdminDataTabsProps) {
    const router = useRouter()

    return (
        <Tabs defaultValue="jobs" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                    <TabsList className="bg-[hsl(var(--muted))] p-1 rounded-lg">
                        <TabsTrigger
                            value="jobs"
                            className="rounded-md px-5 py-1.5 font-semibold text-sm
                data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-sm"
                        >
                            Jobs
                        </TabsTrigger>
                        <TabsTrigger
                            value="candidates"
                            className="rounded-md px-5 py-1.5 font-semibold text-sm
                data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-sm"
                        >
                            Candidates
                        </TabsTrigger>
                    </TabsList>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-1 rounded-md font-medium">
                        Last 7 days
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm border-[hsl(var(--border))] font-medium"
                    onClick={() => alert("Filter functionality to be integrated")}
                >
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    Filter
                </Button>
            </div>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="outline-none focus:ring-0 m-0">
                <Card className="border border-[hsl(var(--border))] shadow-sm rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]">
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] h-11 text-xs uppercase tracking-wider">Job Role</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Client</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">CVs Sourced</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobsLoading ? (
                                <LoadingRows cols={5} />
                            ) : jobs && jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <TableRow
                                        key={job._id}
                                        className="hover:bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] transition-colors cursor-pointer"
                                        onClick={() => router.push(`/jobs/${job._id}`)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[hsl(var(--foreground))] text-sm">{job.jobTitle}</span>
                                                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {job.location ?? "Remote"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="h-7 w-7 rounded-md border border-[hsl(var(--border))]">
                                                    <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-xs font-semibold">
                                                        {job.client?.name?.[0] ?? "C"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                                    {job.client?.name ?? "Unknown"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <span className="text-sm text-[hsl(var(--foreground))]">{job.totalCVs ?? 0} candidates</span>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <JobStatusBadge stage={job.stage} />
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/jobs`)}>
                                                        Assigned Recruiters
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => alert("Close functionality to be added")}
                                                    >
                                                        Close Job
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">
                                        No jobs found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="outline-none focus:ring-0 m-0">
                <Card className="border border-[hsl(var(--border))] shadow-sm rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]">
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] h-11 text-xs uppercase tracking-wider">Candidate</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Expertise</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Experience</TableHead>
                                <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Contact</TableHead>
                                <TableHead className="text-right font-semibold text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidatesLoading ? (
                                <LoadingRows cols={5} />
                            ) : candidates && candidates.length > 0 ? (
                                candidates.map((c) => (
                                    <TableRow
                                        key={c._id}
                                        className="hover:bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] transition-colors cursor-pointer"
                                        onClick={() => router.push(`/candidates/${c._id}`)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-7 w-7 rounded-md border border-[hsl(var(--border))]">
                                                    <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-xs font-semibold">
                                                        {c.name?.[0] ?? "C"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-sm text-[hsl(var(--foreground))]">{c.name}</div>
                                                    <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        {c.currentLocation ?? "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{c.educationDegree ?? "N/A"}</span>
                                                <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0 h-4 w-fit">
                                                    {c.functionalArea ?? "General"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                                {c.experience ?? 0} yrs
                                            </span>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                                                    title={c.email}
                                                    onClick={() => c.email && (window.location.href = `mailto:${c.email}`)}
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                                                    title={c.phone}
                                                    onClick={() => c.phone && (window.location.href = `tel:${c.phone}`)}
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.push(`/candidates/${c._id}`)}>
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => alert("Note feature to be implemented")}>
                                                        Add Note
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => alert("Interview scheduler to be implemented")}>
                                                        Schedule Interview
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">
                                        No candidates found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </TabsContent>
        </Tabs>
    )
}