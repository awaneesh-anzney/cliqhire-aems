"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Import components
import { StatsOverview } from "@/components/today-tasks/StatsOverview";
import { AssignedJobs } from "@/components/today-tasks/AssignedJobs";
import { Interviews } from "@/components/today-tasks/Interviews";
import { PersonalTasks } from "@/components/today-tasks/PersonalTasks";
import { AddTaskForm } from "@/components/today-tasks/AddTaskForm";
import {
  AssignedJob,
  Interview,
  PersonalTask
} from "@/components/today-tasks/types";
import { JobStatus } from "@/components/today-tasks/StatusDropdown";
import { taskService } from "@/services/taskService";
import { useMyTasks } from "@/hooks/useMyTasks";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";

export default function TodayTasksPage() {
  const queryClient = useQueryClient();
  const { data: myTasksData, isLoading, error } = useMyTasks();
  const {
    createPersonalTask,
    updatePersonalTaskStatus,
    deletePersonalTask,
    updatePersonalTask: updatePersonalTaskMutation // Rename to avoid conflict if any, though separate scope
  } = usePersonalTasks();

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Derived state from query data
  const assignedJobs: AssignedJob[] = (myTasksData?.data.assignedJobs || []).map(job => ({
    id: job.id,
    jobTitle: job.position,
    clientName: job.clientName,
    candidatesCount: job.candidateCount,
    status: job.status === 'to-do' ? 'To-do' : job.status === 'inprogress' ? 'In Progress' : 'Completed',
    content: job.content,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    _id: job._id || job.id, // Fallback to id if _id is missing
    position: job.position,
    jobId: job.jobId,
    clientId: job.clientId,
  }));

  const personalTasks: PersonalTask[] = (myTasksData?.data.personalTasks || []).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: 'medium', // Default
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    status: task.status,
    category: task.category,
    createdAt: task.createdAt,
    followUpType: task.followUpType,
    followUpStatus: task.followUpStatus,
    relatedCandidate: task.relatedCandidate,
    relatedJob: task.relatedJob,
    relatedClient: task.relatedClient,
  }));

  const interviews: Interview[] = (myTasksData?.data.reminderTasks || []).map(task => ({
    id: task.id,
    candidateName: task.candidateName,
    candidateEmail: task.candidateEmail,
    candidatePhone: "", // Not provided
    jobTitle: task.jobTitle,
    clientName: task.clientName,
    interviewType: (task.interviewMeetingLinks && task.interviewMeetingLinks.length > 0) ? "video" : "in-person",
    scheduledTime: task.interviewDateTime,
    duration: 60, // Default duration
    status: "scheduled", // Default status map
    meetingLink: task.interviewMeetingLinks?.[0] || "",
    location: "",
    notes: ""
  }));

  // Handlers
  const handleCompleteTask = async (taskId: string) => {
    updatePersonalTaskStatus.mutate({ taskId, status: 'completed' }, {
      onSuccess: () => {
        setCompletedTasks(prev => new Set(prev).add(taskId));
        // Auto-remove completed tasks from view visual effect
        setTimeout(() => {
          setCompletedTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }, 2000);
      }
    });
  };

  const handleUpdateFollowUpStatus = async (taskId: string, followUpStatus: "pending" | "in-progress" | "completed") => {
    // This seems to be for personal tasks that are followups? 
    // If so, we can use updatePersonalTaskMutation
    try {
      // Since we don't have a specific mutation for this in usePersonalTasks exposed as 'updateFollowUpStatus',
      // we can use updatePersonalTaskMutation or keep the taskService call if it is distinct (it calls /my-tasks)
      // But the docs for personal task update allow 'followUpStatus' field? No, docs didn't explicitly list it in 'Update Personal Task' text, 
      // but 'Request Body' said "Any combination of the following fields...". And Service has updatePersonalTask with followUpStatus.
      // Let's assume for Personal Tasks we should use the personal endpoint if possible, but the original code used /my-tasks.
      // Given the prompt "Connect all the APIs related to Personal Task", I will stick to what creates/updates Personal Tasks.
      // However, if these tasks were created via Personal Task but are followups, maybe they share the endpoint.
      // Let's rely on the service logic for now but wrapped in mutation?
      // Actually, existing handleUpdateFollowUpStatus used taskService.updateFollowUpStatus which uses PUT /api/tasks/my-tasks.
      // If I want to be strict about Personal Task APIs (the new ones), I should see if I can update followUpStatus there.
      // The service updatePersonalTask signature I see in step 4 includes followUpStatus.
      // Let's use updatePersonalTaskMutation for consistency if valid.

      // Wait, the new hooks provided createPersonalTask, updatePersonalTask, etc.
      // I'll stick to using the hook for consistency with 'Personal Task API'.

      updatePersonalTaskMutation.mutate({
        taskId,
        data: {
          followUpStatus: followUpStatus as any, // Cast if type mismatch or ensure strict typing
          status: followUpStatus === 'completed' ? 'completed' : undefined
        }
      }, {
        onSuccess: () => {
          if (followUpStatus === 'completed') {
            setCompletedTasks(prev => new Set(prev).add(taskId));
            setTimeout(() => {
              setCompletedTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
              });
            }, 2000);
          }
        }
      });
    } catch (error) {
      console.error('Error updating follow-up status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    deletePersonalTask.mutate(taskId);
  };

  const updateInterviewStatus = (interviewId: string, status: Interview['status']) => {
    console.log("Update interview status TODO", interviewId, status);
  };

  const handleJobStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      const apiStatus = newStatus === 'To-do' ? 'to-do' :
        newStatus === 'In Progress' ? 'inprogress' :
          'completed';

      await taskService.updateAssignedJobStatus(jobId, apiStatus);
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleAddTask = async (taskData: { title: string; description: string; category: string; dueDate: string }) => {
    createPersonalTask.mutate({
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      category: taskData.category,
    }, {
      onSuccess: () => setNewTaskOpen(false)
    });
  };

  const handleEditTask = (taskId: string, taskData: { title: string; description: string; category: string; dueDate: string }) => {
    updatePersonalTaskMutation.mutate({
      taskId,
      data: taskData
    });
  };

  const filteredPersonalTasks = personalTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const allInterviews = interviews;

  // Check loading state if needed for full page, or pass down
  // if (isLoading) return <div>Loading...</div>; // Optional, layout handles it often

  return (
    <div className="flex flex-col bg-muted/50 p-2 space-y-2" style={{ height: 'calc(100vh - 20px)' }}>
      {/* Header */}
      <div className="flex-none bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Today&apos;s Tasks</h1>
            <p className="text-foreground mt-1">
              Manage your assigned jobs, interviews, and personal tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Personal Task</DialogTitle>
                </DialogHeader>
                <AddTaskForm
                  onClose={() => setNewTaskOpen(false)}
                  onSubmit={handleAddTask}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2 custom-scrollbar">

        {/* Stats Overview */}
        <StatsOverview
          assignedJobs={assignedJobs}
          todayInterviews={allInterviews}
          personalTasks={personalTasks}
        />

        {/* Assigned Jobs - Full Width */}
        <AssignedJobs
          assignedJobs={assignedJobs}
          onStatusChange={handleJobStatusChange}
          loading={isLoading}
        />

        {/* Today's Interviews */}
        <Interviews
          interviews={allInterviews}
          onUpdateInterviewStatus={updateInterviewStatus}
        />

        {/* Personal Tasks */}
        <PersonalTasks
          personalTasks={filteredPersonalTasks}
          completedTasks={completedTasks}
          searchQuery={searchQuery}
          loading={isLoading}
          onCompleteTask={handleCompleteTask}
          onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
          onUpdateStatus={async (taskId: string, status: JobStatus) => {
            const apiStatus = status === 'To-do' ? 'to-do' :
              status === 'In Progress' ? 'inprogress' :
                'completed';

            updatePersonalTaskStatus.mutate({ taskId, status: apiStatus });
          }}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      </div>
    </div>
  );
}
