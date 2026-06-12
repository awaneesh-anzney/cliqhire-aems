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
import { Briefcase, EllipsisVertical, Eye, Trash2, User2, Mail, Phone, MapPin, Building2, MoreVertical, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { PipelineStageBadge } from "./pipeline-stage-badge";
import { StatusBadge } from "./status-badge";
import { type Candidate, type Job } from "./dummy-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "../ui/button";

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
    <Table className="w-full border-separate border-spacing-0 table-auto">
      <TableHeader className="sticky top-0 z-40 bg-card border-b border-border">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[60px] px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Candidate</TableHead>
          <TableHead className="px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Name & Title</TableHead>
          {showStageColumn && <TableHead className="px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Pipeline Stage</TableHead>}
          <TableHead className="px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Internal Status</TableHead>
          <TableHead className="px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Assignees</TableHead>
          <TableHead className="w-[80px] px-4 py-3.5 border-b border-border text-[11px] font-semibold text-muted-foreground tracking-wider uppercase text-right pr-6">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow 
            key={candidate.id} 
            className={cn(
               "group border-b border-border/80 transition-colors duration-200",
               "hover:bg-muted/40"
            )}
          >
            {/* Avatar Column */}
            <TableCell className="px-4 py-3 w-[60px]">
              <Avatar 
                className="h-8 w-8 rounded-lg border border-border/85 shadow-sm transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
              >
                <AvatarImage src={candidate.avatar} />
                <AvatarFallback className="text-xs font-semibold bg-brand/5 text-brand">
                  {candidate.name ? candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "NA"}
                </AvatarFallback>
              </Avatar>
            </TableCell>

            {/* Name & Title Column */}
            <TableCell className="px-4 py-3">
              <div className="flex flex-col min-w-0 max-w-[300px]">
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div 
                        className="flex items-center gap-2 cursor-pointer group/name truncate"
                        onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
                     >
                        <span className="text-xs font-bold text-foreground group-hover/name:text-brand transition-colors truncate">
                          {candidate.name || "Anonymous Candidate"}
                        </span>
                        {candidate.isTempCandidate && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-semibold uppercase tracking-wider border border-red-100">
                            Temp
                          </span>
                        )}
                     </div>
                   </TooltipTrigger>
                   <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-md p-2">
                     {candidate.name}
                   </TooltipContent>
                 </Tooltip>
                 
                 <div className="flex items-center gap-1.5 overflow-hidden mt-0.5">
                    <Building2 className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                    <span className="text-xs font-normal text-muted-foreground truncate">
                       {candidate.currentJobTitle || "Independent Professional"}
                    </span>
                 </div>
              </div>
            </TableCell>

            {/* Stage Column */}
            {showStageColumn && (
              <TableCell className="px-4 py-3">
                <div className="scale-90 origin-left">
                  <PipelineStageBadge
                    stage={candidate.currentStage}
                    onStageChange={(newStage) => { if (canModify) onStageChange(candidate, newStage); }}
                  />
                </div>
              </TableCell>
            )}

            {/* Status Column */}
            <TableCell className="px-4 py-3">
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
                    <div className="scale-90 origin-left">
                      <StatusBadge
                        status={statusValue}
                        stage={candidate.currentStage}
                        onStatusChange={(newStatus) => { if (canModify) onStatusChange(candidate, newStatus as any); }}
                        allowedStatuses={statusOptionsOverride}
                      />
                    </div>
                  );
                } else {
                  return <span className="text-xs font-medium text-muted-foreground">N/A</span>;
                }
              })()}
            </TableCell>

            {/* Assignees Column */}
            <TableCell className="px-4 py-3">
              <div className="flex flex-col gap-0.5">
                 <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-muted-foreground/80" />
                    <span className="text-xs font-normal text-muted-foreground truncate max-w-[140px]">
                       HM: <span className="font-semibold text-foreground">{job.hiringManagerName || "Unassigned"}</span>
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <User2 className="h-3 w-3 text-muted-foreground/80" />
                    <span className="text-xs font-normal text-muted-foreground truncate max-w-[140px]">
                       REC: <span className="font-semibold text-foreground">{job.recruiterName || "Unassigned"}</span>
                    </span>
                 </div>
              </div>
            </TableCell>

            {/* Action Column */}
            <TableCell className="px-4 py-3 text-right pr-6">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 rounded-lg hover:bg-brand/5 group/btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground group-hover/btn:text-brand transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border border-border bg-card shadow-lg w-52 p-1.5">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`);
                    }}
                    className="rounded-lg p-2 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-brand/5 hover:text-brand"
                  >
                    <Eye className="h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  {candidate.resume && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewResume(candidate);
                      }}
                      className="rounded-lg p-2 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-brand/5 hover:text-brand"
                    >
                      <Briefcase className="h-4 w-4" />
                      Inspect CV
                    </DropdownMenuItem>
                  )}
                  {canModify && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCandidate(candidate);
                      }}
                      className="rounded-lg p-2 text-xs font-semibold flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Candidate
                    </DropdownMenuItem>
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
