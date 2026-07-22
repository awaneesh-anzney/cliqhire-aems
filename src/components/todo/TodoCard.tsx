"use client";

import React from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
  Send,
  ClipboardList
} from "lucide-react";
import { cvSubmissionService } from "@/services/cvSubmissionService";

interface TodoCardProps {
  task: any;
  taskType: "assignedJob" | "reminderTask" | "personalTask";
  cvSubmissions?: any[];
  onStatusChange: (taskId: string, taskType: string, status: "to-do" | "inprogress" | "completed") => void;
  onToggleComplete?: (task: any) => void;
  onView?: (task: any) => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export function TodoCard({
  task,
  taskType,
  cvSubmissions = [],
  onStatusChange,
  onToggleComplete,
  onView,
  onEdit,
  onDelete,
}: TodoCardProps) {
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [delayReason, setDelayReason] = React.useState("");
  const queryClient = useQueryClient();

  const isCompleted = (task.status || "").toLowerCase().trim() === "completed";

  const isCvSubmission = taskType === "reminderTask" && task.id?.startsWith("cvsubmit_");
  const isScreeningFollowUp = taskType === "reminderTask" && task.kind === "screening_followup";
  const isOverdue = task.status === 'OVERDUE' || task.status === 'overdue'; // Initial visual state based on task

  // State for CV Confirm Modal
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [activeResponsibilityId, setActiveResponsibilityId] = React.useState<string | null>(null);

  const reasonMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      cvSubmissionService.submitReason(id, reason),
    onSuccess: () => {
      toast.success("Reason logged. SLA timer restarted.");
      setReasonOpen(false);
      setDelayReason("");
      queryClient.invalidateQueries({ queryKey: ["cv-submissions-my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit reason");
    }
  });

  const handleSubmitReason = () => {
    if (!delayReason.trim() || !activeResponsibilityId) return;
    reasonMutation.mutate({ id: activeResponsibilityId, reason: delayReason });
  };

  const submitCvMutation = useMutation({
    mutationFn: (id: string) => cvSubmissionService.submit(id),
    onSuccess: () => {
      toast.success("CV marked as submitted! SLA fulfilled.");
      queryClient.invalidateQueries({ queryKey: ["cv-submissions-my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit CV");
    }
  });

  const handleCvSubmissionComplete = async () => {
    if (!task.candidateId || !task.jobId) {
      toast.error("Missing candidate or job information on task");
      return;
    }
    
    try {
      // 1. Fetch current responsibility
      const response = await cvSubmissionService.getCurrentForCandidate(task.candidateId, task.jobId);
      const currentRecord = response?.data;
      
      if (!currentRecord) {
        toast.error("No active CV submission responsibility found.");
        return;
      }

      setActiveResponsibilityId(currentRecord._id);

      // 2. Check status
      if (currentRecord.status === 'OVERDUE') {
        toast.error("You must submit a delay reason first.");
        setReasonOpen(true);
      } else {
        // PENDING - Show confirm modal
        setConfirmOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify CV submission status");
    }
  };

  const handleConfirmSubmit = () => {
    if (!activeResponsibilityId) return;
    submitCvMutation.mutate(activeResponsibilityId);
    setConfirmOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      medium: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
      high: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
      urgent: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 animate-pulse",
    };
    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold tracking-wider uppercase rounded-lg px-2 py-0.5", styles[priority] || "bg-muted text-muted-foreground")}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || "").toLowerCase().trim();
    let label = "TO DO";
    let style = "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400";
    
    if (normalized === "completed" || normalized === "complete" || normalized === "done") {
      label = "COMPLETED";
      style = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
    } else if (normalized === "inprogress" || normalized === "in-progress" || normalized === "active") {
      label = "IN PROGRESS";
      style = "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400";
    } else if (normalized === "pending") {
      label = "PENDING";
      style = "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
    } else if (normalized === "to-do" || normalized === "todo") {
      label = "TO DO";
      style = "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400";
    } else if (normalized === "overdue") {
      label = "OVERDUE";
      style = "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 animate-pulse";
    } else if (normalized) {
      label = status.toUpperCase();
      style = "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
    }
    
    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold tracking-wider uppercase rounded-lg px-2 py-0.5", style)}>
        {label}
      </Badge>
    );
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id, taskType }));
    e.dataTransfer.effectAllowed = "move";
  };

  if (taskType === "assignedJob") {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className="group relative flex flex-col justify-between p-4 bg-card border border-border/80 hover:shadow-sm rounded-xl transition-all duration-300 border-l-4 border-l-blue-500 cursor-grab active:cursor-grabbing hover:border-blue-500/20"
      >
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/45 shrink-0 group-hover:text-muted-foreground/80 transition-colors" />
              <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {task.jobTitle || task.position}
              </h4>
            </div>
            {getStatusBadge(task.status)}
          </div>
          <p className="text-[11px] font-medium text-muted-foreground pl-5">{task.clientName}</p>
          {task.content && (
            <p className="text-[10px] text-muted-foreground/80 mt-2 leading-relaxed pl-5 line-clamp-2">
              {task.content}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 flex-wrap gap-2 pl-5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[9px] font-semibold py-0.5 px-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400">
              {task.candidateCount || 0} Candidates
            </Badge>
            <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase bg-muted">
              {task.role || "Recruiter"}
            </Badge>
          </div>

          <Select
            value={task.status}
            onValueChange={(val: any) => onStatusChange(task.id, taskType, val)}
          >
            <SelectTrigger className="h-7 w-[105px] rounded-lg text-[10px] font-bold border-border bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
              <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
              <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (taskType === "reminderTask") {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className="group relative flex flex-col justify-between p-4 bg-card border border-border/80 hover:shadow-sm rounded-xl transition-all duration-300 border-l-4 border-l-emerald-500 cursor-grab active:cursor-grabbing hover:border-emerald-500/20"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/45 shrink-0 group-hover:text-muted-foreground/80 transition-colors" />
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                isCvSubmission ? "bg-primary/10 text-primary" : 
                isScreeningFollowUp ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" :
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}>
                {isCvSubmission ? <Send className="h-3.5 w-3.5" /> : 
                 isScreeningFollowUp ? <ClipboardList className="h-3.5 w-3.5" /> : 
                 <Bell className="h-4 w-4" />}
              </div>
              <h4 className="font-bold text-xs text-foreground truncate">
                {task.candidateName || task.jobTitle || "Reminder"}
              </h4>
              {isCvSubmission && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                  CV Submission
                </Badge>
              )}
              {isScreeningFollowUp && (
                <Badge variant="outline" className="ml-2 bg-teal-500/10 text-teal-600 border-teal-500/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Screening Due
                </Badge>
              )}
            </div>
            {isOverdue ? getStatusBadge("OVERDUE") : getStatusBadge(task.status)}
          </div>

          <div className="pl-5 space-y-1">
            {task.candidateEmail && (
              <p className="text-[9px] text-muted-foreground/70 font-semibold">{task.candidateEmail}</p>
            )}
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed line-clamp-2">
              {task.content || `Action item related to ${task.jobTitle}`}
            </p>
            {task.clientName && (
              <p className="text-[9px] text-muted-foreground/60 font-semibold">
                Client: {task.clientName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 flex-wrap gap-2 pl-5">
          {task.interviewDateTime ? (
            <div className="text-left shrink-0">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Scheduled For</p>
              <p className="text-[10px] font-semibold text-foreground">
                {format(new Date(task.interviewDateTime), "MMM dd - hh:mm a")}
              </p>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {task.interviewMeetingLinks && task.interviewMeetingLinks.length > 0 && (
              <Button
                onClick={() => window.open(task.interviewMeetingLinks[0], "_blank")}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider h-7 px-2.5 flex items-center gap-1 shadow-sm"
              >
                Join Call
                <ExternalLink className="h-2.5 w-2.5" />
              </Button>
            )}

            {isOverdue && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCvSubmissionComplete()}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-7 text-[10px] font-bold uppercase tracking-wider"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Fix SLA Breach
              </Button>
            )}

            <Select
              value={task.status || "to-do"}
              onValueChange={(val: any) => {
                if (isCvSubmission && val === "completed") {
                  handleCvSubmissionComplete();
                  return;
                }
                onStatusChange(task.id, taskType, val);
              }}
              disabled={submitCvMutation.isPending}
            >
              <SelectTrigger className="h-7 w-[105px] rounded-lg text-[10px] font-bold border-border bg-card">
                {submitCvMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
                <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
                <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reason Dialog */}
        <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-red-200 bg-card shadow-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SLA Breached</span>
              </div>
              <DialogTitle className="text-lg font-extrabold tracking-tight">Provide Delay Reason</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground font-medium">
                The 24-hour SLA for this CV submission has expired. Please provide a valid reason for the delay to reset the timer.
              </p>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reason for Delay</Label>
                <Textarea 
                  placeholder="e.g. Waiting on candidate's updated portfolio..."
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="min-h-[100px] text-xs resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReasonOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReason}
                disabled={!delayReason.trim() || reasonMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {reasonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit & Reopen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Confirm Submit Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Confirm CV Sent
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground font-medium">
              Are you sure you have sent the CV to the client? This will mark the task as completed and notify the team.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSubmit}
              disabled={submitCvMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              {submitCvMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, CV is Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    );
  }

  // Personal Tasks Card
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group relative flex flex-col justify-between p-4 border rounded-xl transition-all duration-300 border-l-4 border-l-amber-500 cursor-grab active:cursor-grabbing",
        isCompleted
          ? "bg-emerald-500/5 border-emerald-500/10 opacity-75 hover:border-emerald-500/20"
          : "bg-card border-border/80 hover:shadow-sm hover:border-amber-500/20"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/45 shrink-0 group-hover:text-muted-foreground/80 transition-colors" />
            {onToggleComplete && (
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => onToggleComplete(task)}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded h-4.5 w-4.5 border-border shrink-0"
              />
            )}
            <h4
              onClick={() => onView && onView(task)}
              className={cn(
                "font-bold text-xs text-foreground cursor-pointer hover:text-primary transition-colors truncate",
                isCompleted && "line-through text-muted-foreground/60"
              )}
            >
              {task.title}
            </h4>
          </div>
          {getStatusBadge(task.status)}
        </div>
        {task.description && (
          <p className={cn("text-[10px] text-muted-foreground pl-10 leading-relaxed line-clamp-2", isCompleted && "line-through text-muted-foreground/50")}>
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 flex-wrap gap-2 pl-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.category && (
            <Badge variant="secondary" className="text-[8px] font-bold tracking-wider py-0.5 px-1.5 bg-muted border border-border/60 uppercase">
              {task.category}
            </Badge>
          )}
          {task.priority && getPriorityBadge(task.priority)}

          {task.dueDate && (
            <div className="flex items-center gap-1 text-[8px] font-semibold text-muted-foreground shrink-0 border border-border/50 rounded-lg py-0.5 px-1.5 bg-card/60">
              <CalendarIcon className="h-2.5 w-2.5 text-muted-foreground/70" />
              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={task.status || "to-do"}
            onValueChange={(val: any) => onStatusChange(task.id, taskType, val)}
          >
            <SelectTrigger className="h-7 w-[105px] rounded-lg text-[10px] font-bold border-border bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
              <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
              <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg border border-border/40 hover:bg-muted shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
              <DropdownMenuItem
                onClick={() => onView && onView(task)}
                className="rounded-lg text-xs font-semibold py-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit && onEdit(task)}
                className="rounded-lg text-xs font-semibold py-1.5 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete && onDelete(task.id)}
                className="rounded-lg text-xs font-semibold py-1.5 cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
