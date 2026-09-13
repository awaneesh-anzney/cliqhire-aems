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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Briefcase, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  ExternalLink,
  Copy,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PipelineStageBadge } from "./pipeline-stage-badge";
import { StatusBadge } from "./status-badge";
import { type Candidate, type Job } from "./dummy-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { toast } from "sonner";

type Props = {
  job: Job;
  candidates: Candidate[];
  onStageChange: (candidate: Candidate, newStage: string) => void;
  onStatusChange: (candidate: Candidate, newStatus: string) => void;
  onViewResume: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  canModify?: boolean;
  showStageColumn?: boolean;
  statusOptionsOverride?: string[] | ((candidate: Candidate) => string[]);
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

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (candidates.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <Briefcase className="h-9 w-9 mb-2 opacity-25 text-brand" />
        <h4 className="text-xs font-bold text-foreground">No candidates in this view</h4>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
          No candidate profiles matched the active stage or filters.
        </p>
      </div>
    );
  }

  return (
    <Table className="w-full border-separate border-spacing-0 text-xs">
      <TableHeader className="sticky top-0 z-20">
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border w-12 py-2 px-3 text-center text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Avatar
          </TableHead>
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Candidate & Title
          </TableHead>
          {showStageColumn && (
            <TableHead className="sticky top-0 z-20 bg-card border-b border-border py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
              Pipeline Stage
            </TableHead>
          )}
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Stage Status
          </TableHead>
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Contact & Source
          </TableHead>
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Resume
          </TableHead>
          <TableHead className="sticky top-0 z-20 bg-card border-b border-border w-16 py-2 px-3 text-right text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border))]">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/60">
        {candidates.map((candidate) => {
          const candidateDetailUrl = `/reactruterpipeline/${job.id}/candidate/${candidate.id}`;

          return (
            <tr 
              key={candidate.id} 
              className="group transition-colors hover:bg-muted/30 cursor-pointer"
              onClick={() => {
                if (!candidate.isTempCandidate) {
                  router.push(candidateDetailUrl);
                }
              }}
            >
              {/* Avatar */}
              <td className="py-2 px-3 w-12 text-center border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                <Avatar 
                  className={cn(
                    "h-7 w-7 rounded-lg border border-border shadow-2xs mx-auto transition-transform",
                    candidate.isTempCandidate ? "cursor-default" : "cursor-pointer hover:scale-105"
                  )}
                  onClick={() => {
                    if (!candidate.isTempCandidate) {
                      router.push(candidateDetailUrl);
                    }
                  }}
                >
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback className="text-[10px] font-extrabold bg-brand/10 text-brand">
                    {candidate.name ? candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "CD"}
                  </AvatarFallback>
                </Avatar>
              </td>

              {/* Name & Title */}
              <td className="py-2 px-3 max-w-[240px] border-b border-border/60">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-foreground group-hover:text-brand transition-colors truncate">
                      {candidate.name || "Anonymous Candidate"}
                    </span>
                    {candidate.isTempCandidate && (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 px-1 py-0.2 rounded">
                        Temp
                      </span>
                    )}
                    {candidate.priority && (
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded border",
                        candidate.priority.toLowerCase() === "high" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-muted text-muted-foreground border-border"
                      )}>
                        {candidate.priority}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {candidate.currentJobTitle || candidate.experience || "Talent Prospect"}
                  </span>
                </div>
              </td>

              {/* Pipeline Stage Badge */}
              {showStageColumn && (
                <td className="py-2 px-3 border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                  <PipelineStageBadge
                    stage={candidate.currentStage as any}
                    onStageChange={(newStage) => {
                      if (canModify) onStageChange(candidate, newStage);
                    }}
                  />
                </td>
              )}

              {/* Status Badge */}
              <td className="py-2 px-3 border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                <StatusBadge
                  status={candidate.status || null}
                  stage={candidate.currentStage}
                  onStatusChange={(newStatus) => {
                    if (canModify) onStatusChange(candidate, newStatus);
                  }}
                  isReadOnly={!canModify}
                />
              </td>

              {/* Contact Details */}
              <td className="py-2 px-3 border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                  {candidate.email && (
                    <div 
                      onClick={() => handleCopyText(candidate.email!, "Email")}
                      className="flex items-center gap-1 text-foreground/80 hover:text-brand cursor-pointer truncate max-w-[170px]"
                      title="Click to copy email"
                    >
                      <Mail className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                  )}
                  {candidate.phone && (
                    <div 
                      onClick={() => handleCopyText(candidate.phone!, "Phone")}
                      className="flex items-center gap-1 text-muted-foreground hover:text-brand cursor-pointer"
                      title="Click to copy phone"
                    >
                      <Phone className="h-2.5 w-2.5 shrink-0" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {!candidate.email && !candidate.phone && (
                    <span className="text-[10px] italic text-muted-foreground/60">No contact info</span>
                  )}
                </div>
              </td>

              {/* Resume */}
              <td className="py-2 px-3 border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                {candidate.resume ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewResume(candidate)}
                    className="h-6.5 px-2 text-[10px] font-bold text-brand hover:bg-brand/10 hover:text-brand border-brand/20 rounded-md gap-1 shadow-2xs"
                  >
                    <FileText className="h-3 w-3" />
                    <span>View CV</span>
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50 italic">No CV</span>
                )}
              </td>

              {/* Action */}
              <td className="py-2 px-3 text-right border-b border-border/60" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    {!candidate.isTempCandidate && (
                      <DropdownMenuItem 
                        onClick={() => router.push(candidateDetailUrl)}
                        className="text-xs font-semibold gap-2 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                    )}
                    {candidate.resume && (
                      <DropdownMenuItem 
                        onClick={() => onViewResume(candidate)}
                        className="text-xs font-semibold gap-2 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Preview Resume</span>
                      </DropdownMenuItem>
                    )}
                    {canModify && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteCandidate(candidate)}
                          className="text-xs font-semibold text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          );
        })}
      </TableBody>
    </Table>
  );
}
