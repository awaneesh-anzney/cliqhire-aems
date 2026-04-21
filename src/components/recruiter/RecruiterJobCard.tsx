"use client"
import { Loader2, ChevronRight, ChevronDown, Building, MapPin, HandCoins, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import type { RecruiterJob, RecruiterCandidate } from "./types"
import { StatusBadge, type StatusOption } from "@/components/common/StatusBadge"
import { useState, useMemo } from "react"
import { Button } from "../ui/button"
import { EllipsisVertical, Eye, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CandidateDetailsDialog } from "./CandidateDetailsDialog"
import { recruiterService } from "@/services/recruiterService"
import { RecruiterPipelineService } from "@/services/recruiterPipelineService"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

type RecruiterJobCardProps = {
  job: RecruiterJob
  loadingJobId: string | null
  onToggleExpansion: (jobId: string) => void
}

export function RecruiterJobCard({ job, loadingJobId, onToggleExpansion }: RecruiterJobCardProps) {
  const isLoading = loadingJobId === job.id
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, StatusOption>>({})
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ["pipeline-candidates", job.pipelineId],
    queryFn: () => RecruiterPipelineService.getPipelineEntry(job.pipelineId!),
    enabled: !!job.pipelineId && job.isExpanded,
  })

  const candidates = useMemo(() => {
    const rawCandidates = pipelineData?.data?.candidates || []
    return rawCandidates.map((pc: any) => ({
      id: pc.candidateId?._id || pc._id,
      apiId: pc.candidateId?._id,
      name: `${pc.candidateId?.firstName || ""} ${pc.candidateId?.lastName || ""}`.trim(),
      email: pc.candidateId?.email,
      phone: pc.candidateId?.phone,
      status: pc.currentStatus || "Pending",
      currentStage: pc.currentStage,
      location: pc.candidateId?.location || "",
      // Add other fields as needed
    } as RecruiterCandidate))
  }, [pipelineData])

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => onToggleExpansion(job.id)}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          {job.isExpanded ? (
            <ChevronDown className="mt-0.5 h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="text-sm font-semibold">{job.title}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Building className="h-3 w-3" />
              {job.clientName}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-red-500" />
                {job.location || "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <HandCoins className="h-4 w-4 text-yellow-500" />
                {job.salaryRange || "—"}
              </span>
              {job.jobType && (
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  {job.jobType}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4 text-purple-500" />
                {job.totalCandidates} candidates
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {(isLoading || (job.isExpanded && pipelineLoading)) && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </button>

      {job.isExpanded && (
        <CardContent className="pt-4">
          {pipelineLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">No candidates added</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c: RecruiterCandidate) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.currentJobTitle || ""}</TableCell>
                      <TableCell>
                        <StatusBadge
                          value={(candidateStatuses?.[c.id] || ((c.status?.toLowerCase() === "accepted") ? "Accepted" : (c.status?.toLowerCase() === "rejected") ? "Rejected" : "Pending")) as StatusOption}
                          onChange={async (next, details) => {
                            setCandidateStatuses((prev) => ({ ...prev, [c.id]: next }))
                            try {
                              const payload: any = { status: next.toUpperCase() }
                              if (next === "Rejected") {
                                if (details?.rejectionReason) payload.rejectionReason = details.rejectionReason
                                if (details?.comments) payload.rejectionReason1 = details.comments
                              }
                              const candidateApiId = c.apiId
                              if (!candidateApiId) {
                                toast.error("Missing candidate id for update")
                                return;
                              }
                              await recruiterService.updateCandidateStatusForJob(candidateApiId, job.id, payload)
                              toast.success("Status updated")
                            } catch (e) {
                              toast.error("Failed to update status")
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{c.email || ""}</TableCell>
                      <TableCell>{c.phone || ""}</TableCell>
                      <TableCell>{c.location || ""}</TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon">
                              <EllipsisVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedCandidate(c)
                              setIsDetailsOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View Resume
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}

      <CandidateDetailsDialog
        candidate={selectedCandidate}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </Card>
  )
}
