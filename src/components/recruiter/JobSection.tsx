"use client"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, MapPin, Users, CalendarDays } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getPipelineEntry, type PipelineListItem, type CandidatePipelineInfo } from "@/services/recruitmentPipelineService"
import CandidatesTable from "@/components/recruiter/CandidatesTable"

interface JobSectionProps {
  item: PipelineListItem
}

export default function JobSection({ item }: JobSectionProps) {
  const [expanded, setExpanded] = React.useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["pipeline-entry", item._id],
    queryFn: async () => {
      const res = await getPipelineEntry(item._id)
      return res.data
    },
    enabled: expanded,
  })

  const candidates: CandidatePipelineInfo[] = data?.candidateIdArray || []

  const statusColor = (stage?: string) => {
    switch ((stage || "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700"
      case "onboarding":
        return "bg-blue-100 text-blue-700"
      case "on hold":
        return "bg-yellow-100 text-yellow-700"
      case "closed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 rounded-md"
             onClick={() => setExpanded((v) => !v)}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <p className="font-medium">{item.jobId?.jobTitle}</p>
              <Badge className={statusColor(item.jobId?.stage)} variant="secondary">
                {item.jobId?.stage || "Open"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {item.jobId?.location && (
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.jobId.location}</span>
              )}
              {typeof item.totalCandidates === "number" && (
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{item.totalCandidates} candidates</span>
              )}
              {item.assignedDate && (
                <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />Assigned {new Date(item.assignedDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>

        {expanded && (
          <div className="mt-4">
            {isLoading ? (
              <div className="py-4 text-sm text-muted-foreground">Loading candidates...</div>
            ) : candidates.length === 0 ? (
              <div className="py-4 text-sm text-muted-foreground">No candidates added</div>
            ) : (
              <CandidatesTable
                candidates={candidates.map((c) => ({
                  id: c.candidateId?._id || "",
                  name: c.candidateId?.name || "",
                  email: c.candidateId?.email || "",
                  phone: c.candidateId?.phone || "",
                  location: c.candidateId?.location || "",
                  currentStage: c.currentStage || "",
                  status: c.status || "",
                  resume: c.candidateId?.resume || "",
                }))}
              />
            )}
          </div>
        )}
      </div>
  )
}