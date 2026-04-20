"use client";
import React from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Briefcase, EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PipelineStageBadge } from "./pipeline-stage-badge";
import { StatusBadge } from "./status-badge";
import { type Candidate, type Job } from "./dummy-data";

type Props = {
  job: Job;
  candidates: Candidate[];
  onStageChange: (candidate: Candidate, newStage: string) => void;
  onStatusChange: (candidate: Candidate, newStatus: string) => void;
  onViewResume: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  canModify?: boolean;
  showStageColumn?: boolean;
  statusOptionsOverride?: string[];
  actionsVariant?: "full" | "viewOnly";
};

export function PipelineCandidatesTable({
  job,
  candidates,
  onStageChange,
  onStatusChange,
  onViewResume,
  onDeleteCandidate,
  canModify = true,
  showStageColumn = true,
  statusOptionsOverride,
  actionsVariant = "full",
}: Props) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Candidate</TableHead>
          <TableHead>Current Position</TableHead>
          {showStageColumn && <TableHead>Stage</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Hiring Manager</TableHead>
          <TableHead>Recruiter</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow 
            key={candidate.id} 
            className="hover:bg-muted/50"
          >
            <TableCell 
               className="cursor-pointer"
               onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
             >
              <Avatar className="h-8 w-8 hover:ring-2 hover:ring-blue-400 transition-all">
                <AvatarImage src={candidate.avatar} />
                <AvatarFallback className="text-xs bg-gray-200">
                  {candidate.name ? candidate.name.split(" ").map((n) => n[0]).join("") : "NA"}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell 
               className="font-medium truncate max-w-[220px] cursor-pointer group"
               onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
             >
              <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                {candidate.name || "Unknown Candidate"}
                {candidate.isTempCandidate && (
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    TEMP
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="truncate max-w-[260px] text-gray-700">
              {candidate.currentJobTitle || "Position not specified"}
            </TableCell>
            {showStageColumn && (
              <TableCell>
                <PipelineStageBadge
                  stage={candidate.currentStage}
                  onStageChange={(newStage) => { if (canModify) onStageChange(candidate, newStage); }}
                />
              </TableCell>
            )}
            <TableCell>
              {(() => {
                const stagesWithStatus = [
                  "Sourcing",
                  "Screening",
                  "Client Review",
                  "Interview",
                  "Verification",
                  "Onboarding",
                ];
                const alwaysShowStatus = !!statusOptionsOverride;
                if (alwaysShowStatus || stagesWithStatus.includes(candidate.currentStage)) {
                  const statusValue = (alwaysShowStatus ? (candidate.subStatus as any) : (candidate.status as any)) || null;
                  return (
                    <StatusBadge
                      status={statusValue}
                      stage={candidate.currentStage}
                      onStatusChange={(newStatus) => { if (canModify) onStatusChange(candidate, newStatus as any); }}
                      allowedStatuses={statusOptionsOverride}
                    />
                  );
                } else {
                  return <span className="text-sm text-gray-500">N/A</span>;
                }
              })()}
            </TableCell>
            <TableCell className="text-sm text-gray-700">
              {job.hiringManagerName || "Not assigned"}
            </TableCell>
            <TableCell className="text-sm text-gray-700">
              {job.recruiterName || "Not assigned"}
            </TableCell>
            <TableCell>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="More options"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-50">
                  {actionsVariant === "full" ? (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View & Edit Details
                      </DropdownMenuItem>
                      {candidate.resume && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewResume(candidate);
                          }}
                          className="cursor-pointer"
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          View Resume
                        </DropdownMenuItem>
                      )}
                      {canModify && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCandidate(candidate);
                          }}
                          className="cursor-pointer"
                        >
                          <Trash2 className="size-4 mr-2 text-red-500" />
                          Delete Candidate
                        </DropdownMenuItem>
                      )}
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {candidate.resume && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewResume(candidate);
                          }}
                          className="cursor-pointer"
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          View Resume
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}



