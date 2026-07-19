"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMyTasks } from "@/hooks/useMyTasks";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { taskService } from "@/services/taskService";
import { cvSubmissionService } from "@/services/cvSubmissionService";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Sparkles,
  AlertCircle,
  Eye,
  Edit,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Import modular components
import { TodoStats } from "@/components/todo/TodoStats";
import { TodoFilters } from "@/components/todo/TodoFilters";
import { TodoBoard } from "@/components/todo/TodoBoard";

export default function TodoPage() {
  const queryClient = useQueryClient();

  // Filters State
  const [activeTab, setActiveTab] = useState<string>("all");
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

  // Fetch CV Submission Tasks
  const { data: cvSubmissionData } = useQuery({
    queryKey: ["cv-submissions-my-tasks"],
    queryFn: () => cvSubmissionService.getMyTasks()
  });
  
  const cvSubmissions = cvSubmissionData?.data || [];

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
      dueDate: taskDueDate ? format(taskDueDate, "yyyy-MM-dd") : undefined,
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
        dueDate: taskDueDate ? format(taskDueDate, "yyyy-MM-dd") : undefined,
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
    const isCompleted = (task.status || "").toLowerCase().trim() === "completed";
    const nextStatus = isCompleted ? "to-do" : "completed";
    updatePersonalTaskStatus.mutate({
      taskId: task.id,
      status: nextStatus
    });
  };

  const handleStatusChange = async (taskId: string, taskType: string, status: "to-do" | "inprogress" | "completed") => {
    if (taskType === "assignedJob") {
      try {
        await taskService.updateAssignedJobStatus(taskId, status);
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        toast.success("Job status updated");
      } catch (err: any) {
        toast.error(err.message || "Failed to update job status");
      }
    } else if (taskType === "reminderTask") {
      try {
        await taskService.updateReminderTaskStatus(taskId, status);
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        toast.success("Reminder status updated");
      } catch (err: any) {
        toast.error(err.message || "Failed to update reminder status");
      }
    } else if (taskType === "personalTask") {
      updatePersonalTaskStatus.mutate({ taskId, status });
    }
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchQuery !== "";

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
    } else if (normalized) {
      label = status.toUpperCase();
      style = "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
    }
    
    return (
      <Badge variant="outline" className={cn("text-[9px] font-bold tracking-wider uppercase rounded-lg px-2.5 py-0.5", style)}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background p-2 gap-2 animate-in fade-in duration-500">
      
      {/* Premium Header Container */}
      <div className="flex-shrink-0 bg-card border border-border shadow-sm rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4.5 w-4.5 text-primary fill-primary/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Operations Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Todo</h1>
          <p className="text-xs text-muted-foreground font-medium">
            Monitor and coordinate active job assignments, system reminders, and personal checklists.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search tasks, jobs, candidate names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs border-border bg-muted/20 focus-visible:ring-primary rounded-xl font-medium transition-all"
            />
          </div>
          
          <Button
            onClick={handleOpenCreateDialog}
            className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Personal Task
          </Button>
        </div>
      </div>

      {/* Modern Dashboard KPI Grid */}
      <TodoStats
        counts={counts}
        responseTime={myTasksData?.responseTime}
        isLoading={isLoading}
      />

      {/* Main Core Kanban Container */}
      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation & Segmented Filters Bar */}
        <TodoFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
        />

        {/* Scrollable Tasks Container */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synchronizing tasks database...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <AlertCircle className="h-10 w-10 text-destructive opacity-40" />
              <h3 className="font-bold text-foreground text-sm">Failed to Sync Tasks</h3>
              <p className="text-xs text-muted-foreground">Please check authorization or connectivity credentials.</p>
            </div>
          ) : assignedJobs.length === 0 && personalTasks.length === 0 && reminderTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3.5 border border-dashed border-border rounded-2xl bg-muted/5">
              <div className="h-12 w-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm text-muted-foreground/60">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-sm">No tasks match selected criteria</h3>
                <p className="text-xs text-muted-foreground max-w-sm">Try clearing active filters or modifying search keywords.</p>
              </div>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters} variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-wider border-border mt-1">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <TodoBoard
              assignedJobs={assignedJobs}
              reminderTasks={reminderTasks}
              personalTasks={personalTasks}
              cvSubmissions={cvSubmissions}
              onStatusChange={handleStatusChange}
              onToggleComplete={handleTogglePersonalTaskComplete}
              onView={(task) => {
                setSelectedTask(task);
                setViewTaskOpen(true);
              }}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteTask}
            />
          )}
        </div>
      </div>

      {/* CREATE TASK DIALOG */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 fill-primary/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Personal Action Item</span>
            </div>
            <DialogTitle className="text-lg font-extrabold tracking-tight">Create Personal Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTaskSubmit} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Task Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-primary font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description (Optional)</Label>
              <Textarea
                placeholder="Provide task notes or context..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-border bg-card text-xs resize-none focus-visible:ring-primary font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</Label>
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-primary font-medium">
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
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority</Label>
                <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-primary font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="low" className="rounded-lg text-xs">Low</SelectItem>
                    <SelectItem value="medium" className="rounded-lg text-xs">Medium</SelectItem>
                    <SelectItem value="high" className="rounded-lg text-xs">High</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg text-xs text-destructive font-semibold">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</Label>
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
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tags (Comma Separated)</Label>
              <Input
                placeholder="e.g. review, interview-prep, follow-up"
                value={taskTags}
                onChange={(e) => setTaskTags(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-primary font-medium"
              />
            </div>
            <DialogFooter className="pt-3 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider border-border py-2.5">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider py-2.5">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Edit className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Configuration</span>
            </div>
            <DialogTitle className="text-lg font-extrabold tracking-tight">Edit Personal Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTaskSubmit} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Task Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-primary font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</Label>
              <Textarea
                placeholder="Provide task notes or context..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-border bg-card text-xs resize-none focus-visible:ring-primary font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</Label>
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-primary font-medium">
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
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority</Label>
                <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-xs focus:ring-primary font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="low" className="rounded-lg text-xs">Low</SelectItem>
                    <SelectItem value="medium" className="rounded-lg text-xs">Medium</SelectItem>
                    <SelectItem value="high" className="rounded-lg text-xs">High</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg text-xs text-destructive font-semibold">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</Label>
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
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tags (Comma Separated)</Label>
              <Input
                placeholder="e.g. review, interview-prep, follow-up"
                value={taskTags}
                onChange={(e) => setTaskTags(e.target.value)}
                className="rounded-xl border-border bg-card text-xs focus-visible:ring-primary font-medium"
              />
            </div>
            <DialogFooter className="pt-3 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setEditTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider border-border py-2.5">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider py-2.5">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={viewTaskOpen} onOpenChange={setViewTaskOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Eye className="h-4.5 w-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Inspection</span>
            </div>
            <DialogTitle className="text-lg font-extrabold tracking-tight">Personal Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Title</span>
                <p className="text-sm font-extrabold text-foreground">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Description</span>
                  <p className="text-xs font-semibold text-muted-foreground bg-muted/40 p-3.5 border border-border rounded-xl leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-3.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Category</span>
                  <div>
                    <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2.5 uppercase bg-muted border border-border">
                      {selectedTask.category || "other"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Priority</span>
                  <div>
                    {selectedTask.priority ? getPriorityBadge(selectedTask.priority) : "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</span>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), "PPP") : "No due date set"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                  <div>
                    {selectedTask.status ? getStatusBadge(selectedTask.status) : "-"}
                  </div>
                </div>
              </div>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="space-y-1.5 border-t border-border/60 pt-3.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] font-bold py-0.5 px-2 rounded-lg bg-card border-border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3 border-t border-border mt-4 gap-2">
                <Button variant="outline" onClick={() => setViewTaskOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider border-border py-2.5">
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewTaskOpen(false);
                    handleOpenEditDialog(selectedTask);
                  }}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider py-2.5"
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
