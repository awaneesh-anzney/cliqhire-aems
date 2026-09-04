"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Briefcase, 
  Building2, 
  MapPin, 
  Users, 
  Sparkles, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Check
} from "lucide-react";
import { getJobs, Job, ClientRef } from "@/services/jobService";
import { createPipeline } from "@/services/recruitmentPipelineService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreatePipelineDialogProps {
  trigger: React.ReactNode;
  onPipelineCreated?: (jobIds: string[], jobData?: Job[]) => void;
}

export function CreatePipelineDialog({ trigger, onPipelineCreated }: CreatePipelineDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingPipeline, setCreatingPipeline] = useState(false);

  // Selected Jobs
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Launch Pipeline Options
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [launchNotes, setLaunchNotes] = useState("");

  // Fetch jobs on modal open
  useEffect(() => {
    if (open) {
      fetchJobs();
    } else {
      // Reset state on close
      setSearchQuery("");
      setSelectedJobIds([]);
      setLaunchNotes("");
      setPriority("Medium");
    }
  }, [open]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getJobs();
      const jobsData: Job[] = response?.jobs || [];
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch available jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getClientName = (job: Job): string => {
    if (typeof job.client === "object" && job.client !== null) {
      return (job.client as ClientRef).name || "Unknown Client";
    }
    return typeof job.client === "string" && job.client ? job.client : "Unknown Client";
  };

  const getJobLocation = (job: Job): string => {
    if (Array.isArray(job.location)) {
      return job.location.join(", ") || "Location not specified";
    }
    return job.location || "Location not specified";
  };

  const hasTeamAssignment = (job: Job): boolean => {
    if (job.jobTeamMembers && Array.isArray(job.jobTeamMembers) && job.jobTeamMembers.length > 0) {
      const memberCount = job.jobTeamMembers.reduce((acc, m: any) => acc + (m.users?.length || 0), 0);
      if (memberCount > 0) return true;
    }
    const jti: any = (job as any).jobTeamInfo;
    if (jti && (jti.hiringManager || jti.recruiter || jti.teamLead || jti.recruitmentManager)) {
      return true;
    }
    const anyFlat = !!(
      (job as any).recruiterId || (job as any).recruiter ||
      (job as any).teamLeadId || (job as any).teamLead ||
      (job as any).recruitmentManagerId || (job as any).recruitmentManager
    );
    if (anyFlat) return true;

    const ta: any = (job as any).teamAssignment;
    if (ta && typeof ta === "string") {
      try {
        const parsed = JSON.parse(ta);
        return !!(parsed && (parsed.hiringManager || parsed.recruiter || parsed.teamLead || parsed.recruitmentManager));
      } catch {}
    } else if (ta && typeof ta === "object") {
      return !!(ta.hiringManager || ta.recruiter || ta.teamLead || ta.recruitmentManager);
    }

    return false;
  };

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const query = searchQuery.toLowerCase().trim();
      const title = (job.jobTitle || "").toLowerCase();
      const client = getClientName(job).toLowerCase();
      const location = getJobLocation(job).toLowerCase();
      const code = ((job as any).jobId || "").toLowerCase();

      const matchesSearch = !query || title.includes(query) || client.includes(query) || location.includes(query) || code.includes(query);

      if (!matchesSearch) return false;

      if (filterType !== "all") {
        const type = (job.jobType || "").toLowerCase();
        return type.includes(filterType.toLowerCase());
      }

      return true;
    });
  }, [jobs, searchQuery, filterType]);

  const selectedJobs = useMemo(() => {
    return jobs.filter((job) => selectedJobIds.includes(job._id));
  }, [jobs, selectedJobIds]);

  const toggleJobSelect = (jobId: string) => {
    setSelectedJobIds((prev) => 
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredJobs.map((j) => j._id);
    const allSelected = filteredIds.every((id) => selectedJobIds.includes(id));
    if (allSelected) {
      setSelectedJobIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedJobIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Launch pipeline execution
  const handleLaunchPipeline = async () => {
    if (selectedJobIds.length === 0) {
      toast.error("Please select at least one job requisition to launch.");
      return;
    }

    setCreatingPipeline(true);
    try {
      const jobsWithTeam = selectedJobs.filter(hasTeamAssignment);
      const jobsWithoutTeam = selectedJobs.filter((j) => !hasTeamAssignment(j));

      if (jobsWithoutTeam.length > 0) {
        const names = jobsWithoutTeam.map((j) => j.jobTitle).join(", ");
        toast.warning(`Team assignment recommended: The following job(s) have no recruitment team configured: ${names}`);
      }

      // Launch pipeline for all selected jobs (passing priority and notes)
      const results = await Promise.allSettled(
        selectedJobs.map((job) => 
          createPipeline({
            jobId: job._id,
            priority,
            notes: launchNotes || undefined,
          })
        )
      );

      const successfulJobs: Job[] = [];
      const failedJobs: string[] = [];

      results.forEach((result, idx) => {
        if (result.status === "fulfilled" && (result.value as any)?.success) {
          successfulJobs.push(selectedJobs[idx]);
        } else {
          failedJobs.push(selectedJobs[idx].jobTitle);
        }
      });

      if (successfulJobs.length > 0) {
        toast.success(`Successfully launched pipeline for ${successfulJobs.length} job requisition(s)!`);
        if (onPipelineCreated) {
          onPipelineCreated(successfulJobs.map((j) => j._id), successfulJobs);
        }
        setOpen(false);
      }

      if (failedJobs.length > 0) {
        toast.error(`Could not launch pipeline for: ${failedJobs.join(", ")}`);
      }
    } catch (error: any) {
      console.error("Error launching pipeline:", error);
      toast.error(error.message || "Failed to launch pipeline. Please try again.");
    } finally {
      setCreatingPipeline(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      
      <DialogContent className="sm:max-w-[920px] p-0 rounded-2xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modern Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-card via-muted/10 to-brand/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                Launch Recruitment Pipeline
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium">
                Select approved job requisitions to activate candidate sourcing, screening, and hiring tracking.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Split Two-Pane Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
          
          {/* Left Pane: Job Browser (7 Cols) */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-card">
            
            {/* Search and Filters Strip */}
            <div className="p-3 border-b border-border/80 flex flex-col gap-2 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by Job Title, ID, Client, or Location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs font-medium bg-card border-border rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Type Pills + Select All */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {["all", "full time", "contract", "remote"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        filterType === type 
                          ? "bg-brand text-white shadow-2xs" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {filteredJobs.length > 0 && (
                  <button
                    onClick={handleSelectAllFiltered}
                    className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
                  >
                    {filteredJobs.every((j) => selectedJobIds.includes(j._id)) ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 text-brand animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading Available Jobs...</span>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const isSelected = selectedJobIds.includes(job._id);
                  const client = getClientName(job);
                  const location = getJobLocation(job);
                  const teamReady = hasTeamAssignment(job);
                  const readableCode = (job as any).jobId;

                  return (
                    <div
                      key={job._id}
                      onClick={() => toggleJobSelect(job._id)}
                      className={cn(
                        "group p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                        isSelected 
                          ? "bg-brand/[0.04] border-brand/40 shadow-xs ring-1 ring-brand/20" 
                          : "bg-card border-border/70 hover:border-brand/30 hover:bg-muted/30"
                      )}
                    >
                      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleJobSelect(job._id)}
                          className="h-4 w-4 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {readableCode && (
                            <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                              {readableCode}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-foreground group-hover:text-brand transition-colors truncate max-w-[240px]">
                            {job.jobTitle}
                          </h4>
                        </div>

                        {/* Client & Location */}
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                          <div className="flex items-center gap-1 text-foreground/80 font-semibold">
                            <Building2 className="h-3 w-3 text-brand shrink-0" />
                            <span className="truncate max-w-[120px]">{client}</span>
                          </div>
                          <span className="text-border">•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate max-w-[110px]">{location}</span>
                          </div>
                        </div>

                        {/* Team assignment status pill */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {teamReady ? (
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded-full">
                              <Check className="h-2.5 w-2.5" />
                              Team Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded-full">
                              <AlertCircle className="h-2.5 w-2.5" />
                              No Team Assigned
                            </span>
                          )}

                          {job.jobType && (
                            <span className="text-[8.5px] uppercase font-bold text-muted-foreground bg-muted/60 px-1 rounded">
                              {job.jobType.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mb-2 opacity-30" />
                  <span className="text-xs font-bold text-foreground">No requisitions match your search</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Try clearing your filters or search query</span>
                </div>
              )}
            </div>

            {/* Bottom count badge */}
            <div className="px-4 py-2 border-t border-border/80 bg-muted/10 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
              <span>{selectedJobIds.length} selected</span>
            </div>
          </div>

          {/* Right Pane: Launch Config & Selected Summary (5 Cols) */}
          <div className="md:col-span-5 flex flex-col min-h-0 bg-muted/15 p-4 gap-3.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-brand" />
                Pipeline Configuration
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                Set priority and launch instructions for the pipeline.
              </p>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Initial Priority</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["High", "Medium", "Low"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "py-1 px-2 rounded-lg text-xs font-bold border transition-all text-center",
                      priority === p
                        ? p === "High" 
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-2xs" 
                          : p === "Medium"
                          ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                          : "bg-sky-50 border-sky-300 text-sky-700 shadow-2xs"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Memo / Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Launch Memo / Notes (Optional)</label>
              <Textarea
                placeholder="Add sourcing instructions, target candidate profiles, or pipeline guidelines..."
                value={launchNotes}
                onChange={(e) => setLaunchNotes(e.target.value)}
                className="h-16 text-xs bg-card border-border rounded-lg resize-none placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Selected Jobs Summary Box */}
            <div className="flex-1 min-h-0 flex flex-col border border-border/80 rounded-xl bg-card overflow-hidden">
              <div className="px-3 py-2 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground">
                  Selected Requisitions ({selectedJobIds.length})
                </span>
                {selectedJobIds.length > 0 && (
                  <button
                    onClick={() => setSelectedJobIds([])}
                    className="text-[9.5px] font-bold text-destructive hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                {selectedJobs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                    <Sparkles className="h-6 w-6 mb-1 text-brand/30" />
                    <span className="text-xs font-bold text-foreground">No jobs selected yet</span>
                    <span className="text-[10.5px] text-muted-foreground mt-0.5">Click any job from the left pane to add it to the launch batch.</span>
                  </div>
                ) : (
                  selectedJobs.map((job) => (
                    <div 
                      key={job._id}
                      className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{job.jobTitle}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{getClientName(job)}</span>
                      </div>
                      <button
                        onClick={() => toggleJobSelect(job._id)}
                        className="h-5 w-5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Dialog Footer */}
        <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedJobIds.length > 0 ? (
              <span className="font-bold text-foreground">
                {selectedJobIds.length} requisition{selectedJobIds.length > 1 ? "s" : ""} selected for launch
              </span>
            ) : (
              <span>Select at least 1 job requisition</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={creatingPipeline}
              className="h-8 px-3 rounded-lg text-xs font-bold border-border"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLaunchPipeline}
              disabled={selectedJobIds.length === 0 || creatingPipeline}
              className="h-8 px-4 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-sm shadow-brand/20 flex items-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
            >
              {creatingPipeline ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch {selectedJobIds.length > 0 ? `${selectedJobIds.length} Pipeline${selectedJobIds.length > 1 ? "s" : ""}` : "Pipeline"}</span>
                </>
              )}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
