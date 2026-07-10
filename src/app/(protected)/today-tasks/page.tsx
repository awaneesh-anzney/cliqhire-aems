"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQueryClient } from "@tanstack/react-query";
import { useMyTasks } from "@/hooks/useMyTasks";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { taskService } from "@/services/taskService";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit,
  X,
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  User,
  AlertCircle,
  TrendingUp,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TodayTasksPage() {
  const queryClient = useQueryClient();

  // Filters State
  const [activeTab, setActiveTab] = useState<"all" | "assignedJobs" | "reminderTasks" | "personalTasks" | any>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Dialog States
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [viewTaskOpen, setViewTaskOpen] = useState(false);
  
  // Selected task for View / Edit
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState("recruitment");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [taskTags, setTaskTags] = useState("");

  // Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Params
  const queryParams = {
    type: activeTab === "all" ? undefined : activeTab,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
    category: categoryFilter === "all" ? undefined : categoryFilter,
  };

  // TanStack Query
  const { data: myTasksData, isLoading, error } = useMyTasks(queryParams);
  const {
    createPersonalTask,
    updatePersonalTask,
    updatePersonalTaskStatus,
    deletePersonalTask
  } = usePersonalTasks();

  const assignedJobs = myTasksData?.data?.assignedJobs || [];
  const personalTasks = myTasksData?.data?.personalTasks || [];
  const reminderTasks = myTasksData?.data?.reminderTasks || [];
  const counts = myTasksData?.counts || { assignedJobs: 0, personalTasks: 0, reminderTasks: 0 };

  // Handlers for personal task creation/editing
  const handleOpenCreateDialog = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskCategory("recruitment");
    setTaskPriority("medium");
    setTaskDueDate(undefined);
    setTaskTags("");
    setNewTaskOpen(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    createPersonalTask.mutate({
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
      tags: taskTags ? taskTags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    }, {
      onSuccess: () => {
        setNewTaskOpen(false);
      }
    });
  };

  const handleOpenEditDialog = (task: any) => {
    setSelectedTask(task);
    setTaskTitle(task.title || "");
    setTaskDescription(task.description || "");
    setTaskCategory(task.category || "recruitment");
    setTaskPriority(task.priority || "medium");
    setTaskDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setTaskTags(task.tags ? task.tags.join(", ") : "");
    setEditTaskOpen(true);
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!taskTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    updatePersonalTask.mutate({
      taskId: selectedTask.id,
      data: {
        title: taskTitle.trim(),
        description: taskDescription.trim() || "",
        category: taskCategory,
        priority: taskPriority,
        dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
        tags: taskTags ? taskTags.split(",").map(t => t.trim()).filter(Boolean) : [],
      }
    }, {
      onSuccess: () => {
        setEditTaskOpen(false);
        setSelectedTask(null);
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deletePersonalTask.mutate(taskId);
  };

  const handleTogglePersonalTaskComplete = (task: any) => {
    const nextStatus = task.status === "completed" ? "to-do" : "completed";
    updatePersonalTaskStatus.mutate({
      taskId: task.id,
      status: nextStatus
    });
  };

  const handleJobStatusChange = async (jobId: string, status: "to-do" | "inprogress" | "completed") => {
    try {
      await taskService.updateAssignedJobStatus(jobId, status);
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Job status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update job status");
    }
  };

  const handlePersonalTaskStatusChange = (taskId: string, status: "to-do" | "inprogress" | "completed") => {
    updatePersonalTaskStatus.mutate({ taskId, status });
  };

  const handleReminderStatusChange = async (taskId: string, status: "to-do" | "inprogress" | "completed") => {
    try {
      await taskService.updateReminderTaskStatus(taskId, status);
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Reminder status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update reminder status");
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-green-500/10 text-green-500 border-green-500/20",
      medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      urgent: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
    };
    return (
      <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase rounded-lg px-2 py-0.5", styles[priority] || "bg-muted text-muted-foreground")}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "to-do": "bg-muted/80 text-muted-foreground border-border/80",
      "inprogress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "completed": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    const labels: Record<string, string> = {
      "to-do": "TO DO",
      "inprogress": "IN PROGRESS",
      "completed": "COMPLETED",
    };
    return (
      <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase rounded-lg px-2 py-0.5", styles[status] || "")}>
        {labels[status] || status}
      </Badge>
    );
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchQuery !== "";

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/30 p-4 gap-4 animate-in fade-in duration-500">
      
      {/* Header section with glassmorphism */}
      <div className="flex-shrink-0 bg-card/85 backdrop-blur-md rounded-[1.6rem] border border-border shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand">
            <Sparkles className="h-5 w-5 fill-brand/10" />
            <span className="text-[10px] font-black uppercase tracking-widest">Workspace Tasks</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Today&apos;s Operations</h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Track and synchronize your assigned jobs, interviews, and personal tasks.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Search title, description, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs border-border bg-muted/30 focus-visible:ring-brand rounded-xl font-medium transition-all"
            />
          </div>
          
          <Button
            onClick={handleOpenCreateDialog}
            className="bg-brand hover:bg-brand/90 text-white rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats Cards Dashboard Section */}
      <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Assigned Jobs */}
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Assigned Jobs</p>
            <h3 className="text-lg font-black text-foreground">{counts.assignedJobs || 0}</h3>
          </div>
        </div>

        {/* Card 2: Interviews */}
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Interviews</p>
            <h3 className="text-lg font-black text-foreground">{counts.reminderTasks || 0}</h3>
          </div>
        </div>

        {/* Card 3: Personal Pending */}
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pending Tasks</p>
            <h3 className="text-lg font-black text-foreground">{counts.personalTasks || 0}</h3>
          </div>
        </div>

        {/* Card 4: Response Time */}
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Performance</p>
            <h3 className="text-lg font-black text-foreground">{myTasksData?.responseTime || "0ms"}</h3>
          </div>
        </div>
      </div>

      {/* Main Area: Navigation & Filters + Responsive List Container */}
      <div className="flex-1 min-h-0 bg-card rounded-[1.6rem] border border-border shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation & Segmented Filters Control */}
        <div className="flex-shrink-0 border-b border-border/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 bg-muted/10">
          
          {/* Segment Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/60">
            {[
              { id: "all", label: "All Tasks" },
              { id: "assignedJobs", label: "Assigned Jobs" },
              { id: "reminderTasks", label: "Interviews" },
              { id: "personalTasks", label: "Personal Tasks" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearAllFilters();
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-card text-brand shadow-sm border border-border/30"
                    : "text-muted-foreground/80 hover:text-foreground hover:bg-card/45"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-Filters: Status, Priority, Category (Personal Tasks only) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Filters</span>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[115px] rounded-lg text-xs font-semibold border-border bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Statuses</SelectItem>
                <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
                <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
                <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Personal Task Specific Filters */}
            {(activeTab === "all" || activeTab === "personalTasks") && (
              <>
                {/* Priority Filter */}
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 w-[115px] rounded-lg text-xs font-semibold border-border bg-card">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="all" className="rounded-lg text-xs font-medium">All Priorities</SelectItem>
                    <SelectItem value="low" className="rounded-lg text-xs font-medium">Low</SelectItem>
                    <SelectItem value="medium" className="rounded-lg text-xs font-medium">Medium</SelectItem>
                    <SelectItem value="high" className="rounded-lg text-xs font-medium">High</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg text-xs font-medium">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-[115px] rounded-lg text-xs font-semibold border-border bg-card">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="all" className="rounded-lg text-xs font-medium">All Categories</SelectItem>
                    <SelectItem value="recruitment" className="rounded-lg text-xs font-medium">Recruitment</SelectItem>
                    <SelectItem value="hr" className="rounded-lg text-xs font-medium">HR</SelectItem>
                    <SelectItem value="admin" className="rounded-lg text-xs font-medium">Admin</SelectItem>
                    <SelectItem value="meeting" className="rounded-lg text-xs font-medium">Meetings</SelectItem>
                    <SelectItem value="other" className="rounded-lg text-xs font-medium">Other</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 text-xs font-black text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable View List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing database...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 opacity-30" />
              <h3 className="font-bold text-foreground text-sm">Failed to sync tasks</h3>
              <p className="text-xs text-muted-foreground">Please check your network and authorization credentials.</p>
            </div>
          ) : (
            <>
              {/* SECTION 1: ASSIGNED JOBS */}
              {(activeTab === "all" || activeTab === "assignedJobs") && assignedJobs.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest">Active Engagements ({assignedJobs.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedJobs.map((job: any) => (
                      <div key={job.id} className="group relative flex flex-col justify-between p-4.5 bg-muted/20 border border-border/80 hover:border-brand/20 hover:bg-card hover:shadow-md rounded-2xl transition-all duration-300">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-bold text-sm text-foreground truncate group-hover:text-brand transition-colors">
                              {job.jobTitle || job.position}
                            </h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground/80">{job.clientName}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-2 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/30">
                              {job.candidateCount || 0} Candidates
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase">
                              {job.role || "Recruiter"}
                            </Badge>
                          </div>
                          
                          <Select 
                            value={job.status} 
                            onValueChange={(val: any) => handleJobStatusChange(job.id, val)}
                          >
                            <SelectTrigger className="h-8 w-[110px] rounded-lg text-xs font-bold border-border bg-card">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                              <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
                              <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
                              <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: INTERVIEWS & REMINDERS */}
              {(activeTab === "all" || activeTab === "reminderTasks") && reminderTasks.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 text-green-500" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest">Upcoming Interviews ({reminderTasks.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {reminderTasks.map((reminder: any) => (
                      <div key={reminder.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/20 border border-border/80 hover:border-brand/20 hover:bg-card hover:shadow-md rounded-2xl transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                            <User className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-foreground flex items-center gap-2 flex-wrap">
                              {reminder.candidateName}
                              <span className="text-[10px] text-muted-foreground/70 font-semibold">{reminder.candidateEmail}</span>
                            </h3>
                            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                              Interviewing for <strong className="text-foreground">{reminder.jobTitle}</strong> at <strong>{reminder.clientName}</strong>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 self-end sm:self-center">
                          {reminder.interviewDateTime && (
                            <div className="text-right shrink-0">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scheduled For</p>
                              <p className="text-xs font-semibold text-foreground">
                                {format(new Date(reminder.interviewDateTime), "MMM dd, yyyy - hh:mm a")}
                              </p>
                            </div>
                          )}

                          {reminder.interviewMeetingLinks && reminder.interviewMeetingLinks.length > 0 && (
                            <Button
                              onClick={() => window.open(reminder.interviewMeetingLinks[0], "_blank")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest h-8 px-3.5 flex items-center gap-1.5 shadow-sm shadow-green-600/10"
                            >
                              Join Call
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Select 
                            value={reminder.status || 'to-do'} 
                            onValueChange={(val: any) => handleReminderStatusChange(reminder.id, val)}
                          >
                            <SelectTrigger className="h-8 w-[110px] rounded-lg text-xs font-bold border-border bg-card">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                              <SelectItem value="to-do" className="rounded-lg text-xs font-medium">To-Do</SelectItem>
                              <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
                              <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: PERSONAL TASKS */}
              {(activeTab === "all" || activeTab === "personalTasks") && personalTasks.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest">Personal Action Items ({personalTasks.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {personalTasks.map((task: any) => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "flex items-center justify-between gap-4 p-4 border rounded-2xl transition-all duration-300",
                          task.status === "completed" 
                            ? "bg-green-500/5 border-green-500/10 opacity-70" 
                            : "bg-muted/20 border-border/80 hover:border-brand/20 hover:bg-card hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={() => handleTogglePersonalTaskComplete(task)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-md h-4.5 w-4.5"
                          />
                          
                          <div className="min-w-0 flex-1">
                            <h3 
                              onClick={() => {
                                setSelectedTask(task);
                                setViewTaskOpen(true);
                              }}
                              className={cn(
                                "font-bold text-xs text-foreground cursor-pointer hover:text-brand transition-colors truncate",
                                task.status === "completed" && "line-through text-muted-foreground/60"
                              )}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className={cn("text-[11px] text-muted-foreground truncate mt-0.5", task.status === "completed" && "line-through text-muted-foreground/50")}>
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                          {/* Tags / Details */}
                          {task.category && (
                            <Badge variant="secondary" className="text-[9px] font-semibold tracking-wider py-0.5 px-2 bg-muted border border-border/60 uppercase">
                              {task.category}
                            </Badge>
                          )}
                          {task.priority && getPriorityBadge(task.priority)}

                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground shrink-0 border border-border/50 rounded-lg py-0.5 px-2 bg-card/60">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground/70" />
                              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
                            </div>
                          )}

                          {/* Options Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-border/40 hover:bg-muted shrink-0">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground/80" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setViewTaskOpen(true);
                                }}
                                className="rounded-lg text-xs font-semibold py-2"
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleOpenEditDialog(task)}
                                className="rounded-lg text-xs font-semibold py-2"
                              >
                                <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="rounded-lg text-xs font-semibold py-2 text-red-500 hover:text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {assignedJobs.length === 0 && personalTasks.length === 0 && reminderTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-border rounded-[2rem] bg-muted/10">
                  <div className="h-12 w-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm text-muted-foreground/60">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-sm">No tasks match the filters</h3>
                    <p className="text-xs text-muted-foreground">Try clearing your search or updating selection criteria.</p>
                  </div>
                  {hasActiveFilters && (
                    <Button onClick={clearAllFilters} variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-border mt-1">
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* CREATE TASK DIALOG */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border border-border bg-card/95 backdrop-blur-md shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-brand">
              <Sparkles className="h-4.5 w-4.5 fill-brand/10" />
              <span className="text-[9px] font-black uppercase tracking-widest">Personal Log</span>
            </div>
            <DialogTitle className="text-lg font-black tracking-tight">Create Personal Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTaskSubmit} className="space-y-4 py-3">
            <div className="space-y-1">
              <LabelInput label="Task Title" required />
              <Input
                placeholder="Enter task name..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-brand font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <LabelInput label="Description (optional)" />
              <Textarea
                placeholder="Provide task notes..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-border bg-card text-xs resize-none focus-visible:ring-brand font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <LabelInput label="Category" />
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-brand font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="recruitment" className="rounded-lg text-xs">Recruitment</SelectItem>
                    <SelectItem value="hr" className="rounded-lg text-xs">HR</SelectItem>
                    <SelectItem value="admin" className="rounded-lg text-xs">Admin</SelectItem>
                    <SelectItem value="meeting" className="rounded-lg text-xs">Meeting</SelectItem>
                    <SelectItem value="other" className="rounded-lg text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <LabelInput label="Priority" />
                <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-brand font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="low" className="rounded-lg text-xs">Low</SelectItem>
                    <SelectItem value="medium" className="rounded-lg text-xs">Medium</SelectItem>
                    <SelectItem value="high" className="rounded-lg text-xs">High</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg text-xs text-red-500 font-bold">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <LabelInput label="Due Date" />
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-medium text-xs rounded-xl border-border bg-card px-3",
                      !taskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/80" />
                    {taskDueDate ? format(taskDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={taskDueDate}
                    onSelect={setTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <LabelInput label="Tags (comma separated)" />
              <Input
                placeholder="e.g. review, interview, prep"
                value={taskTags}
                onChange={(e) => setTaskTags(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-brand font-medium"
              />
            </div>
            <DialogFooter className="pt-3 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-widest border-border py-2.5">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 py-2.5">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border border-border bg-card/95 backdrop-blur-md shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-brand">
              <Edit className="h-4.5 w-4.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Configuration</span>
            </div>
            <DialogTitle className="text-lg font-black tracking-tight">Edit Personal Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTaskSubmit} className="space-y-4 py-3">
            <div className="space-y-1">
              <LabelInput label="Task Title" required />
              <Input
                placeholder="Enter task name..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-brand font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <LabelInput label="Description" />
              <Textarea
                placeholder="Provide task notes..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-border bg-card text-xs resize-none focus-visible:ring-brand font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <LabelInput label="Category" />
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-brand font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="recruitment" className="rounded-lg text-xs">Recruitment</SelectItem>
                    <SelectItem value="hr" className="rounded-lg text-xs">HR</SelectItem>
                    <SelectItem value="admin" className="rounded-lg text-xs">Admin</SelectItem>
                    <SelectItem value="meeting" className="rounded-lg text-xs">Meeting</SelectItem>
                    <SelectItem value="other" className="rounded-lg text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <LabelInput label="Priority" />
                <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-brand font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="low" className="rounded-lg text-xs">Low</SelectItem>
                    <SelectItem value="medium" className="rounded-lg text-xs">Medium</SelectItem>
                    <SelectItem value="high" className="rounded-lg text-xs">High</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg text-xs text-red-500 font-bold">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <LabelInput label="Due Date" />
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-medium text-xs rounded-xl border-border bg-card px-3",
                      !taskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/80" />
                    {taskDueDate ? format(taskDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={taskDueDate}
                    onSelect={setTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <LabelInput label="Tags (comma separated)" />
              <Input
                placeholder="e.g. review, interview, prep"
                value={taskTags}
                onChange={(e) => setTaskTags(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-brand font-medium"
              />
            </div>
            <DialogFooter className="pt-3 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setEditTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-widest border-border py-2.5">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 py-2.5">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={viewTaskOpen} onOpenChange={setViewTaskOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border border-border bg-card/95 backdrop-blur-md shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-brand">
              <Eye className="h-4.5 w-4.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Inspection</span>
            </div>
            <DialogTitle className="text-lg font-black tracking-tight">Personal Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-3">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Title</span>
                <p className="text-sm font-black text-foreground">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Description</span>
                  <p className="text-xs font-semibold text-muted-foreground/90 bg-muted/30 p-3 border border-border/60 rounded-xl leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Category</span>
                  <div>
                    <Badge variant="secondary" className="text-[9px] font-semibold py-0.5 px-2 uppercase bg-muted border border-border/80">
                      {selectedTask.category || "other"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Priority</span>
                  <div>
                    {selectedTask.priority ? getPriorityBadge(selectedTask.priority) : "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Due Date</span>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), "PPP") : "No due date set"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Status</span>
                  <div>
                    {selectedTask.status ? getStatusBadge(selectedTask.status) : "-"}
                  </div>
                </div>
              </div>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] font-semibold py-0.5 px-2 rounded-lg bg-card border-border/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3 border-t border-border mt-4 gap-2">
                <Button variant="outline" onClick={() => setViewTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-widest border-border py-2.5">
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewTaskOpen(false);
                    handleOpenEditDialog(selectedTask);
                  }}
                  className="bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 py-2.5"
                >
                  Edit Task
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const LabelInput = ({ label, required }: { label: string; required?: boolean }) => (
  <label className="text-[10px] font-black text-muted-foreground/85 uppercase tracking-widest flex items-center gap-0.5 mb-1.5">
    {label}
    {required && <span className="text-red-500 font-black">*</span>}
  </label>
);
