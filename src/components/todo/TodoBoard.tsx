"use client";

import React from "react";
import { TodoColumn } from "./TodoColumn";

interface TaskItem {
  task: any;
  type: "assignedJob" | "reminderTask" | "personalTask";
}

interface TodoBoardProps {
  assignedJobs: any[];
  reminderTasks: any[];
  personalTasks: any[];
  onStatusChange: (taskId: string, taskType: string, status: "to-do" | "inprogress" | "completed") => void;
  onToggleComplete?: (task: any) => void;
  onView?: (task: any) => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export function TodoBoard({
  assignedJobs,
  reminderTasks,
  personalTasks,
  onStatusChange,
  onToggleComplete,
  onView,
  onEdit,
  onDelete,
}: TodoBoardProps) {
  // Helper to categorize task status
  const getStatusCategory = (status: string): "to-do" | "inprogress" | "completed" => {
    const normalized = (status || "").toLowerCase().trim();
    if (normalized === "completed" || normalized === "complete" || normalized === "done") {
      return "completed";
    }
    if (normalized === "inprogress" || normalized === "in-progress" || normalized === "active") {
      return "inprogress";
    }
    return "to-do"; // Default fallback
  };

  // Compile all tasks into wrapped items
  const allTasks: TaskItem[] = [
    ...assignedJobs.map(task => ({ task, type: "assignedJob" as const })),
    ...reminderTasks.map(task => ({ task, type: "reminderTask" as const })),
    ...personalTasks.map(task => ({ task, type: "personalTask" as const })),
  ];

  // Group items by status
  const todoTasks = allTasks.filter(item => getStatusCategory(item.task.status) === "to-do");
  const inprogressTasks = allTasks.filter(item => getStatusCategory(item.task.status) === "inprogress");
  const completedTasks = allTasks.filter(item => getStatusCategory(item.task.status) === "completed");

  return (
    <div className="flex-1 overflow-x-auto min-h-0 select-none pb-4">
      <div className="flex gap-5 min-w-[900px] h-full">
        {/* COLUMN 1: TO-DO */}
        <TodoColumn
          status="to-do"
          title="To Do"
          tasks={todoTasks}
          accentClass="bg-slate-400"
          onStatusChange={onStatusChange}
          onToggleComplete={onToggleComplete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* COLUMN 2: IN PROGRESS */}
        <TodoColumn
          status="inprogress"
          title="In Progress"
          tasks={inprogressTasks}
          accentClass="bg-blue-500"
          onStatusChange={onStatusChange}
          onToggleComplete={onToggleComplete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* COLUMN 3: COMPLETED */}
        <TodoColumn
          status="completed"
          title="Completed"
          tasks={completedTasks}
          accentClass="bg-emerald-500"
          onStatusChange={onStatusChange}
          onToggleComplete={onToggleComplete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
