"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Check,
  ChevronLeft,
  ChevronRight
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

  // Pagination states (Limit: 10)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Jobs & Cache (to preserve across pages)
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [selectedJobsCache, setSelectedJobsCache] = useState<Record<string, Job>>({});

  // Search with Debounce
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Launch Pipeline Options
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [launchNotes, setLaunchNotes] = useState("");

  // Debounce search query by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when filterType changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedSearch("");
      setCurrentPage(1);
      setSelectedJobIds([]);
      setSelectedJobsCache({});
      setLaunchNotes("");
      setPriority("Medium");
    }
  }, [open]);

  // Fetch jobs with limit of 10, page, debounced search, and jobType
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getJobs({
        page: currentPage,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        jobType: filterType !== "all" ? filterType : undefined,
      });

      const jobsData: Job[] = response?.jobs || [];
      setJobs(jobsData);
      setTotalCount(response?.totalCount || 0);
      setTotalPages(response?.totalPages || 1);

      // Cache fetched jobs so selected items preserve metadata across pagination
      setSelectedJobsCache((prev) => {
        const next = { ...prev };
        jobsData.forEach((j) => {
          next[j._id] = j;
        });
        return next;
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch available jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterType]);

  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open, fetchJobs]);

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

  // Selected Jobs array constructed from cache + current list
  const selectedJobs = useMemo(() => {
    return selectedJobIds
      .map((id) => selectedJobsCache[id] || jobs.find((j) => j._id === id))
      .filter(Boolean) as Job[];
  }, [selectedJobIds, selectedJobsCache, jobs]);

  const toggleJobSelect = (job: Job) => {
    const jobId = job._id;
    if (selectedJobIds.includes(jobId)) {
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId));
    } else {
      setSelectedJobsCache((prev) => ({ ...prev, [jobId]: job }));
      setSelectedJobIds((prev) => [...prev, jobId]);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageIds = jobs.map((j) => j._id);
    const allSelected = pageIds.every((id) => selectedJobIds.includes(id));
    if (allSelected) {
      setSelectedJobIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedJobsCache((prev) => {
        const next = { ...prev };
        jobs.forEach((j) => {
          next[j._id] = j;
        });
        return next;
      });
      setSelectedJobIds((prev) => Array.from(new Set([...prev, ...pageIds])));
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

  const isPageAllSelected = jobs.length > 0 && jobs.every((j) => selectedJobIds.includes(j._id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      
      <DialogContent className="sm:max-w-[920px] p-0 rounded-2xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modern Header */}
        <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-card via-muted/10 to-brand/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
                Launch Recruitment Pipeline
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-medium">
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
            <div className="p-2.5 border-b border-border/80 flex flex-col gap-2 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs (e.g. title, JOB-102, client)..."
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

              {/* Type Pills + Select All on Page */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {["all", "full time", "contract", "remote"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider transition-all",
                        filterType === type 
                          ? "bg-brand text-white shadow-2xs" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {jobs.length > 0 && (
                  <button
                    onClick={handleSelectAllOnPage}
                    className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
                  >
                    {isPageAllSelected ? "Deselect Page" : "Select Page"}
                  </button>
                )}
              </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2">
              {loading ? (
                <div className="h-56 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 text-brand animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading Jobs...</span>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const isSelected = selectedJobIds.includes(job._id);
                  const client = getClientName(job);
                  const location = getJobLocation(job);
                  const teamReady = hasTeamAssignment(job);
                  const readableCode = (job as any).jobId;

                  return (
                    <div
                      key={job._id}
                      onClick={() => toggleJobSelect(job)}
                      className={cn(
                        "group p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5",
                        isSelected 
                          ? "bg-brand/[0.04] border-brand/40 shadow-xs ring-1 ring-brand/20" 
                          : "bg-card border-border/70 hover:border-brand/30 hover:bg-muted/30"
                      )}
                    >
                      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleJobSelect(job)}
                          className="h-3.5 w-3.5 rounded border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {readableCode && (
                            <span className="font-mono text-[8px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.2 rounded border border-border/60">
                              {readableCode}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-foreground group-hover:text-brand transition-colors truncate max-w-[240px]">
                            {job.jobTitle}
                          </h4>
                        </div>

                        {/* Client & Location */}
                        <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground mt-0.5 flex-wrap">
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
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded-full">
                              <Check className="h-2.5 w-2.5" />
                              Team Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded-full">
                              <AlertCircle className="h-2.5 w-2.5" />
                              No Team
                            </span>
                          )}

                          {job.jobType && (
                            <span className="text-[8px] uppercase font-bold text-muted-foreground bg-muted/60 px-1 rounded">
                              {job.jobType.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <Briefcase className="h-7 w-7 mb-1.5 opacity-30" />
                  <span className="text-xs font-bold text-foreground">No requisitions found</span>
                  <span className="text-[10.5px] text-muted-foreground mt-0.5">Try adjusting your search query or type filter</span>
                </div>
              )}
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-3 py-2 border-t border-border/80 bg-muted/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Page <span className="text-foreground font-black">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <span className="text-border">•</span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {totalCount} total jobs
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="h-6.5 px-2 text-[9.5px] font-bold border-border shadow-2xs gap-0.5"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="h-6.5 px-2 text-[9.5px] font-bold border-border shadow-2xs gap-0.5"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Pane: Launch Config & Selected Summary (5 Cols) */}
          <div className="md:col-span-5 flex flex-col min-h-0 bg-muted/15 p-3.5 gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-brand" />
                Pipeline Setup
              </h3>
              <p className="text-[10.5px] text-muted-foreground mt-0.5 font-medium">
                Set priority and launch instructions for the batch.
              </p>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Initial Priority</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["High", "Medium", "Low"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "py-1 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center",
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
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Launch Memo / Notes (Optional)</label>
              <Textarea
                placeholder="Add sourcing guidelines or target profiles..."
                value={launchNotes}
                onChange={(e) => setLaunchNotes(e.target.value)}
                className="h-14 text-xs bg-card border-border rounded-lg resize-none placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Selected Jobs Summary Box */}
            <div className="flex-1 min-h-0 flex flex-col border border-border/80 rounded-xl bg-card overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                  Selected Requisitions ({selectedJobIds.length})
                </span>
                {selectedJobIds.length > 0 && (
                  <button
                    onClick={() => setSelectedJobIds([])}
                    className="text-[9px] font-bold text-destructive hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                {selectedJobs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-3 text-center text-muted-foreground">
                    <Sparkles className="h-5 w-5 mb-1 text-brand/30" />
                    <span className="text-xs font-bold text-foreground">No jobs selected</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Select jobs from any page to add them to the launch queue.</span>
                  </div>
                ) : (
                  selectedJobs.map((job) => (
                    <div 
                      key={job._id}
                      className="p-1.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{job.jobTitle}</span>
                        <span className="text-[9.5px] text-muted-foreground truncate">{getClientName(job)}</span>
                      </div>
                      <button
                        onClick={() => toggleJobSelect(job)}
                        className="h-4.5 w-4.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0 transition-colors"
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
        <div className="px-5 py-2.5 border-t border-border bg-card flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedJobIds.length > 0 ? (
              <span className="font-bold text-foreground text-[11px]">
                {selectedJobIds.length} requisition{selectedJobIds.length > 1 ? "s" : ""} selected
              </span>
            ) : (
              <span className="text-[11px]">Select at least 1 job requisition</span>
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
