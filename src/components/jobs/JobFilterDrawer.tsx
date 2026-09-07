"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  MapPin,
  Building2,
  Users2,
  Hash,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface JobFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitleInput: string;
  setJobTitleInput: (val: string) => void;
  jobIdInput: string;
  setJobIdInput: (val: string) => void;
  locationInput: string;
  setLocationInput: (val: string) => void;
  clientInput: string;
  setClientInput: (val: string) => void;
  headcountInput: string;
  setHeadcountInput: (val: string) => void;
  jobTypeInput: string;
  setJobTypeInput: (val: string) => void;
  selectedStage: string;
  setSelectedStage: (val: string) => void;
  includeInactive: boolean;
  setIncludeInactive: (val: boolean) => void;
  onClearAll: () => void;
  activeCount: number;
}

export const JobFilterDrawer: React.FC<JobFilterDrawerProps> = ({
  open,
  onOpenChange,
  jobTitleInput,
  setJobTitleInput,
  jobIdInput,
  setJobIdInput,
  locationInput,
  setLocationInput,
  clientInput,
  setClientInput,
  headcountInput,
  setHeadcountInput,
  jobTypeInput,
  setJobTypeInput,
  selectedStage,
  setSelectedStage,
  includeInactive,
  setIncludeInactive,
  onClearAll,
  activeCount,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">
                Filter Jobs
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Filter positions by requirements and criteria
              </SheetDescription>
            </div>
          </div>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              {activeCount} active
            </span>
          )}
        </SheetHeader>

        {/* Form Inputs Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Stage Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Job Stage</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-muted/30 border-border/80 focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="All" className="text-xs">All Stages</SelectItem>
                <SelectItem value="Open" className="text-xs">Open</SelectItem>
                <SelectItem value="Active" className="text-xs">Active</SelectItem>
                <SelectItem value="Onboarding" className="text-xs">Onboarding</SelectItem>
                <SelectItem value="Hired" className="text-xs">Hired</SelectItem>
                <SelectItem value="On Hold" className="text-xs">On Hold</SelectItem>
                <SelectItem value="Closed" className="text-xs">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Title Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Job Title / Position</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer..."
                value={jobTitleInput}
                onChange={(e) => setJobTitleInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {jobTitleInput && (
                <button
                  type="button"
                  onClick={() => setJobTitleInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Job ID Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Job ID</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. JOB-1029..."
                value={jobIdInput}
                onChange={(e) => setJobIdInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {jobIdInput && (
                <button
                  type="button"
                  onClick={() => setJobIdInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Client Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Client Name or ID</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Acme Corp..."
                value={clientInput}
                onChange={(e) => setClientInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {clientInput && (
                <button
                  type="button"
                  onClick={() => setClientInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Location</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. London, Riyadh, Remote..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => setLocationInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Job Type Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>Job Type</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Full-time, Contract, Part-time..."
                value={jobTypeInput}
                onChange={(e) => setJobTypeInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {jobTypeInput && (
                <button
                  type="button"
                  onClick={() => setJobTypeInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Headcount Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Headcount</span>
            </Label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={headcountInput}
              onChange={(e) => setHeadcountInput(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
            />
          </div>

          {/* Show Inactive Checkbox */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
            <Checkbox
              id="inactive-toggle"
              checked={includeInactive}
              onCheckedChange={(c) => setIncludeInactive(c === true)}
              className="rounded-md border-border"
            />
            <Label
              htmlFor="inactive-toggle"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              Include inactive or closed jobs
            </Label>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-between gap-2 shrink-0 sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="text-xs h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset All
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JobFilterDrawer;
