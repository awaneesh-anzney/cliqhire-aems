"use client"
import React, { useEffect, useState, useMemo } from "react"
import { RecruiterSearchBar } from "@/components/recruiter/RecruiterSearchBar"
import { RecruiterJobList } from "@/components/recruiter/RecruiterJobList"
import { type RecruiterJob } from "@/components/recruiter/types"
import { useQuery } from "@tanstack/react-query"
import { recruiterService } from "@/services/recruiterService"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/contexts/PermissionContext"

export default function RecruiterPage() {
  const [search, setSearch] = useState("")
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null)

  const { hasPermission, loading: permissionsLoading } = usePermissions()
  const canView = hasPermission("Recruiter", "view")

  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ["recruiter-dashboard"],
    queryFn: () => recruiterService.getMyDashboard(),
    enabled: canView,
  })

  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set())

  const jobs = useMemo(() => {
    const list = dashboardData?.jobs || []
    return list.map((j: any) => ({
      ...j,
      isExpanded: expandedJobIds.has(j.id || j._id)
    })) as RecruiterJob[]
  }, [dashboardData, expandedJobIds])

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
        setLoadingJobId(jobId)
        setTimeout(() => setLoadingJobId(null), 300)
      }
      return next
    })
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const title = j.title || ""
      const client = j.clientName || ""
      return title.toLowerCase().includes(search.toLowerCase()) || client.toLowerCase().includes(search.toLowerCase())
    })
  }, [jobs, search])

  if (permissionsLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Checking permissions...</div>
  }

  if (!canView) {
    return <div className="p-4 text-sm text-red-500">You do not have permission to view this page.</div>
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <RecruiterSearchBar value={search} onChange={setSearch} />
      </div>

      {dataLoading ? (
        <div className="py-6 text-sm text-muted-foreground">Loading jobs...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-6 text-sm text-muted-foreground">No jobs found</div>
      ) : (
        <RecruiterJobList
          jobs={filteredJobs}
          loadingJobId={loadingJobId}
          onToggleExpansion={toggleJobExpansion}
        />
      )}
    </div>
  )
}
