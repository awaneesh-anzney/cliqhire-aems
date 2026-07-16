"use client";

import React, { useState } from "react";
import { TodoCard } from "./TodoCard";
import { cn } from "@/lib/utils";

interface TodoColumnProps {
  status: "to-do" | "inprogress" | "completed";
  title: string;
  tasks: Array<{
    task: any;
    type: "assignedJob" | "reminderTask" | "personalTask";
  }>;
  cvSubmissions?: any[];
  accentClass: string;
  onStatusChange: (taskId: string, taskType: string, status: "to-do" | "inprogress" | "completed") => void;
  onToggleComplete?: (task: any) => void;
  onView?: (task: any) => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export function TodoColumn({
  status,
  title,
  tasks,
  cvSubmissions = [],
  accentClass,
  onStatusChange,
  onToggleComplete,
  onView,
  onEdit,
  onDelete,
}: TodoColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const { taskId, taskType } = JSON.parse(dataStr);
      if (taskId && taskType) {
        onStatusChange(taskId, taskType, status);
      }
    } catch (err) {
      console.error("Failed to process dropped item:", err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col flex-1 min-w-[280px] bg-muted/20 border border-border/70 rounded-2xl p-4 space-y-4 transition-all min-h-[480px]",
        isDragOver && "border-primary bg-primary/5 shadow-sm"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", accentClass)} />
          <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 max-h-[70vh]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border/60 rounded-xl bg-card/20 select-none">
            <span className="text-[9px] font-bold uppercase tracking-widest">Drop items here</span>
          </div>
        ) : (
          tasks.map(({ task, type }) => (
            <TodoCard
              key={task.id}
              task={task}
              taskType={type}
              cvSubmissions={cvSubmissions}
              onStatusChange={onStatusChange}
              onToggleComplete={onToggleComplete}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
