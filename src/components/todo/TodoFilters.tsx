"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoFiltersProps {
  activeTab: string;
  setActiveTab: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export function TodoFilters({
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  hasActiveFilters,
  clearAllFilters,
}: TodoFiltersProps) {
  return (
    <div className="flex-shrink-0 border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
      {/* Segment Tabs using Shadcn Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          clearAllFilters();
        }}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-[480px] bg-muted/80 p-1 rounded-xl border border-border/60">
          <TabsTrigger value="all" className="text-xs font-semibold py-1.5 px-3">
            All Tasks
          </TabsTrigger>
          <TabsTrigger value="assignedJobs" className="text-xs font-semibold py-1.5 px-3">
            Assigned Jobs
          </TabsTrigger>
          <TabsTrigger value="reminderTasks" className="text-xs font-semibold py-1.5 px-3">
            Reminders
          </TabsTrigger>
          <TabsTrigger value="personalTasks" className="text-xs font-semibold py-1.5 px-3">
            Personal Tasks
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sub-Filters Panel */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>

        {/* Status Select Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[125px] rounded-lg text-xs font-semibold border-border bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            <SelectItem value="all" className="rounded-lg text-xs font-medium">
              All Statuses
            </SelectItem>
            <SelectItem value="to-do" className="rounded-lg text-xs font-medium">
              To-Do
            </SelectItem>
            <SelectItem value="inprogress" className="rounded-lg text-xs font-medium">
              In Progress
            </SelectItem>
            <SelectItem value="completed" className="rounded-lg text-xs font-medium">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Personal Task Specific Filters */}
        {(activeTab === "all" || activeTab === "personalTasks") && (
          <>
            {/* Priority Select Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 w-[125px] rounded-lg text-xs font-semibold border-border bg-card">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">
                  All Priorities
                </SelectItem>
                <SelectItem value="low" className="rounded-lg text-xs font-medium">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="rounded-lg text-xs font-medium">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="rounded-lg text-xs font-medium">
                  High
                </SelectItem>
                <SelectItem value="urgent" className="rounded-lg text-xs font-medium">
                  Urgent
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Category Select Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[125px] rounded-lg text-xs font-semibold border-border bg-card">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">
                  All Categories
                </SelectItem>
                <SelectItem value="recruitment" className="rounded-lg text-xs font-medium">
                  Recruitment
                </SelectItem>
                <SelectItem value="hr" className="rounded-lg text-xs font-medium">
                  HR
                </SelectItem>
                <SelectItem value="admin" className="rounded-lg text-xs font-medium">
                  Admin
                </SelectItem>
                <SelectItem value="meeting" className="rounded-lg text-xs font-medium">
                  Meetings
                </SelectItem>
                <SelectItem value="other" className="rounded-lg text-xs font-medium">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg px-3 transition-colors"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
