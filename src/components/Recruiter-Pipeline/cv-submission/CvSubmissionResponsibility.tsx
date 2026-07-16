"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInHours } from "date-fns";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  History, 
  Send,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cvSubmissionService, CvSubmissionResponsibility as ICvSubmission } from "@/services/cvSubmissionService";
import { getTeamMembers } from "@/services/teamMembersService";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CvSubmissionResponsibilityProps {
  pipelineId: string;
  candidateId: string;
  jobId: string;
  jobTeamMembers: any[];
  canModify: boolean;
}

export function CvSubmissionResponsibility({
  pipelineId,
  candidateId,
  jobId,
  jobTeamMembers,
  canModify
}: CvSubmissionResponsibilityProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [delayReason, setDelayReason] = useState<string>("");
  const [isReassigning, setIsReassigning] = useState<boolean>(false);
  const [reassignTo, setReassignTo] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cv-submission-history", candidateId, jobId],
    queryFn: () => cvSubmissionService.getHistory(candidateId, jobId),
    enabled: !!candidateId && !!jobId
  });

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => getTeamMembers(),
  });

  const historyRecords = data?.data || [];
  const allTeamMembers = teamData?.teamMembers || [];
  
  // Find the active responsibility (PENDING or OVERDUE)
  const activeResponsibility = historyRecords.find(
    (record) => record.status === 'PENDING' || record.status === 'OVERDUE'
  );

  const assignMutation = useMutation({
    mutationFn: (userId: string) => cvSubmissionService.assign({
      pipelineId,
      candidateId,
      assignedTo: userId
    }),
    onSuccess: () => {
      toast.success("CV submission responsibility assigned.");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to assign responsibility");
    }
  });

  const reasonMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      cvSubmissionService.submitReason(id, reason),
    onSuccess: () => {
      toast.success("Reason logged. SLA timer restarted.");
      setDelayReason("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit reason");
    }
  });

  const reassignMutation = useMutation({
    mutationFn: ({ id, newUserId }: { id: string; newUserId: string }) => 
      cvSubmissionService.reassign(id, newUserId),
    onSuccess: () => {
      toast.success("Responsibility reassigned successfully.");
      setIsReassigning(false);
      setReassignTo("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reassign");
    }
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => cvSubmissionService.submit(id),
    onSuccess: () => {
      toast.success("CV marked as submitted! SLA fulfilled.");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit CV");
    }
  });

  const handleAssign = () => {
    if (!assignedTo) return;
    assignMutation.mutate(assignedTo);
  };

  const handleSubmitReason = () => {
    if (!delayReason.trim() || !activeResponsibility) return;
    reasonMutation.mutate({ id: activeResponsibility._id, reason: delayReason });
  };

  const handleReassign = () => {
    if (!reassignTo || !activeResponsibility) return;
    reassignMutation.mutate({ id: activeResponsibility._id, newUserId: reassignTo });
  };

  const handleMarkSubmitted = () => {
    if (!activeResponsibility) return;
    submitMutation.mutate(activeResponsibility._id);
  };

  const getTeamMemberOptions = () => {
    if (!allTeamMembers || allTeamMembers.length === 0) return [];
    
    return allTeamMembers
      .filter((m: any) => m.status === "Active" || m.isActive === "Active")
      .map((m: any) => ({
        _id: m._id,
        name: [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || "Unknown User"
      }));
  };

  const teamMembers = getTeamMemberOptions();

  if (isLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-card border border-border rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Internal CV Submission</h3>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Manage client submission SLA
            </p>
          </div>
        </div>
        {activeResponsibility && (
          <Badge variant="outline" className={cn(
            "uppercase tracking-wider text-[10px] font-bold px-2 py-0.5",
            activeResponsibility.status === 'OVERDUE' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"
          )}>
            {activeResponsibility.status}
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-6">
        {!activeResponsibility ? (
          /* UNASSIGNED STATE */
          <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-dashed border-border rounded-xl gap-4">
            <div className="text-center space-y-1">
              <UserCheck className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No assigned responsibility</p>
              <p className="text-[11px] text-muted-foreground">
                Assign a team member to start the 24-hour CV submission SLA clock.
              </p>
            </div>
            
            {canModify && (
              <div className="flex items-center gap-2 w-full max-w-sm mt-2">
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="h-9 text-xs flex-1">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member._id} value={member._id} className="text-xs">
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAssign}
                  disabled={!assignedTo || assignMutation.isPending}
                  className="h-9 px-4 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {assignMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Assign"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE RESPONSIBILITY STATE */
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4",
              activeResponsibility.status === 'OVERDUE' ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
            )}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="text-xs font-bold bg-muted">
                    {activeResponsibility.assignedTo?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Responsible Person</p>
                  <p className="text-sm font-bold text-foreground">{activeResponsibility.assignedTo?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadline</p>
                  <p className={cn(
                    "text-sm font-bold flex items-center gap-1.5",
                    activeResponsibility.status === 'OVERDUE' ? "text-destructive" : "text-foreground"
                  )}>
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(activeResponsibility.dueAt), "MMM dd, hh:mm a")}
                  </p>
                </div>
                
                {(canModify || activeResponsibility.assignedTo?._id === user?.id) && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReassigning(!isReassigning)}
                      className="h-8 text-[10px] font-bold uppercase tracking-wider"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" /> Reassign
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleMarkSubmitted}
                      disabled={submitMutation.isPending || (activeResponsibility.status === 'OVERDUE')}
                      className="h-8 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitMutation.isPending ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                      Mark Submitted
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Reassign UI */}
            {isReassigning && (canModify || activeResponsibility.assignedTo?._id === user?.id) && (
              <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                <Select value={reassignTo} onValueChange={setReassignTo}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select new assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member._id} value={member._id} className="text-xs">
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleReassign}
                  disabled={!reassignTo || reassignMutation.isPending}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsReassigning(false)}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Overdue Reason UI */}
            {activeResponsibility.status === 'OVERDUE' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">SLA Breached</h4>
                </div>
                <p className="text-xs text-destructive/90 font-medium">
                  The 24-hour SLA has expired. Please provide a reason for the delay to restart the timer.
                </p>
                
                {canModify && activeResponsibility.assignedTo?._id === user?.id && (
                  <div className="space-y-2 mt-2">
                    <Textarea 
                      placeholder="Why was the CV not submitted on time?"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      className="text-xs min-h-[80px] bg-card border-destructive/30 focus-visible:ring-destructive"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSubmitReason}
                        disabled={!delayReason.trim() || reasonMutation.isPending}
                        className="h-8 text-[10px] font-bold uppercase tracking-wider bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        {reasonMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                        Submit Reason & Reset
                      </Button>
                    </div>
                  </div>
                )}
                {canModify && activeResponsibility.assignedTo?._id !== user?.id && (
                  <p className="text-[11px] font-medium text-destructive/80 italic border-t border-destructive/20 pt-2">
                    Only the assigned person ({activeResponsibility.assignedTo?.name}) can log the reason.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* History / Audit Log */}
        {historyRecords.length > 0 ? (
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <History className="h-3.5 w-3.5" /> Audit History
            </h4>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {historyRecords.map((record) => (
                  <div key={record._id} className="space-y-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    {(!record.history || record.history.length === 0) ? (
                      <p className="text-[10px] text-muted-foreground italic">No events recorded.</p>
                    ) : (
                      record.history.slice().reverse().map((event, idx) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="text-foreground">
                              <span className="font-semibold">{event.event.replace(/_/g, ' ')}</span>
                              {" • "}
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                                {format(new Date(event.at), "MMM dd, hh:mm a")}
                              </span>
                            </p>
                            {event.event === 'ASSIGNED' && event.to && (
                              <p className="text-muted-foreground text-[11px]">
                                Assigned to {event.to?.name} by {event.by?.name}
                              </p>
                            )}
                            {event.event === 'REOPENED_WITH_REASON' && (
                              <p className="text-muted-foreground text-[11px] bg-muted/40 p-2 rounded-lg italic border border-border/50">
                                &quot;{event.reason}&quot; - {event.by?.name}
                              </p>
                            )}
                            {event.event === 'REASSIGNED' && (
                              <p className="text-muted-foreground text-[11px]">
                                From {event.from?.name} to {event.to?.name} {event.reason ? ` - "${event.reason}"` : ""}
                              </p>
                            )}
                            {event.event === 'SUBMITTED' && (
                              <p className="text-muted-foreground text-[11px] text-primary flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Submitted by {event.by?.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="mt-6 border-t border-border pt-4">
             <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <History className="h-3.5 w-3.5" /> Audit History
            </h4>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 p-4 rounded-xl border border-dashed text-center">
              No tracking information available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
