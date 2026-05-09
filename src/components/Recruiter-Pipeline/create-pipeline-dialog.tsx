"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Briefcase, Building, MapPin, DollarSign, Calendar, X, Check } from "lucide-react";
import { getJobs, Job, ClientRef } from "@/services/jobService";
import { getClientById } from "@/services/clientService";
import { createPipeline } from "@/services/recruitmentPipelineService";
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
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  // Helper function to get job display name (just the job title)
  const getJobDisplayName = (job: Job) => job.jobTitle;
  
  // Create a mapping from job display name to job ID
  const getJobIdFromDisplayName = (displayName: string) => {
    const job = jobs.find(job => job.jobTitle === displayName);
    return job?._id;
  };
  
  // Create a mapping from job ID to job display name
  const getDisplayNameFromJobId = (jobId: string) => {
    const job = jobs.find(job => job._id === jobId);
    return job ? job.jobTitle : '';
  };
  
  // Convert selected job IDs to display names for the MultiSelector
  const selectedJobDisplayNames = selectedJobIds.map(id => getDisplayNameFromJobId(id)).filter(Boolean);
  
  // Handle selection changes from MultiSelector (display names)
  const handleSelectionChange = (displayNames: string[]) => {
    const jobIds = displayNames.map(name => getJobIdFromDisplayName(name)).filter(Boolean) as string[];
    setSelectedJobIds(jobIds);
  };

  // Fetch jobs when dialog opens
  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open]);

  // Reset search term when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedJobIds([]);
    }
  }, [open]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getJobs();
      
      let jobsData: Job[] = [];
      if (response?.jobs) {
        jobsData = response.jobs;
      } else {
        jobsData = [];
      }
      
      setJobs(jobsData);
      
      // No need to fetch client names anymore
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePipeline = async () => {
    if (selectedJobIds.length === 0) {
      toast.error("Please select at least one job");
      return;
    }

    setCreatingPipeline(true);
    try {
      // Get the selected job data
      const selectedJobs = jobs.filter(job => selectedJobIds.includes(job._id));
      
      // Validate team assignment for each selected job
      const hasTeamAssignment = (job: Job) => {
        const anyFromJobTeamInfo = (() => {
          const jti: any = (job as any).jobTeamInfo;
          return !!(jti && (jti.hiringManager || jti.recruiter || jti.teamLead || jti.recruitmentManager));
        })();

        const anyFromFlatFields = !!(
          (job as any).recruiterId || (job as any).recruiter ||
          (job as any).teamLeadId || (job as any).teamLead ||
          (job as any).recruitmentManagerId || (job as any).recruitmentManager
        );

        let anyFromTeamAssignment = false;
        const ta: any = (job as any).teamAssignment;
        if (ta && typeof ta === 'string') {
          try {
            const parsed = JSON.parse(ta);
            anyFromTeamAssignment = !!(parsed && (parsed.hiringManager || parsed.recruiter || parsed.teamLead || parsed.recruitmentManager));
          } catch {}
        } else if (ta && typeof ta === 'object') {
          anyFromTeamAssignment = !!(ta.hiringManager || ta.recruiter || ta.teamLead || ta.recruitmentManager);
        }

        return anyFromJobTeamInfo || anyFromFlatFields || anyFromTeamAssignment;
      };

      const jobsWithTeam = selectedJobs.filter(hasTeamAssignment);
      const jobsWithoutTeam = selectedJobs.filter(j => !hasTeamAssignment(j));

      if (jobsWithoutTeam.length > 0) {
        const names = jobsWithoutTeam.map(j => j.jobTitle).join(', ');
        toast.error(`Team Assignment required. The following job(s) have no team set: ${names}`);
        if (jobsWithTeam.length === 0) {
          setCreatingPipeline(false);
          return;
        }
      }

      // Create pipeline entries for each selected job
      const results = await Promise.allSettled(
        jobsWithTeam.map(job => createPipeline({ jobId: job._id }))
      );
      
      // Check results
      const successfulJobs: Job[] = [];
      const failedJobs: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulJobs.push(jobsWithTeam[index]);
        } else {
          failedJobs.push(jobsWithTeam[index].jobTitle);
        }
      });
      
      if (successfulJobs.length > 0) {
        toast.success(`Successfully created pipeline with ${successfulJobs.length} job(s)`);
        
        // Call the callback to handle pipeline creation
        if (onPipelineCreated) {
          onPipelineCreated(successfulJobs.map(job => job._id), successfulJobs);
        }
      }
      
      if (failedJobs.length > 0) {
        toast.error(`Failed to create pipeline for: ${failedJobs.join(', ')}`);
      }
      
      // Reset and close dialog
      setSelectedJobIds([]);
      setOpen(false);
    } catch (error) {
      console.error("Error creating pipeline:", error);
      toast.error("Failed to create pipeline. Please try again.");
    } finally {
      setCreatingPipeline(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Client name fetching has been removed as it's not needed for pipeline creation

  const getSalaryRange = (job: Job) => {
    if (job.minimumSalary && job.maximumSalary) {
      return `${job.minimumSalary} - ${job.maximumSalary}`;
    } else if (job.minimumSalary) {
      return `${job.minimumSalary}+`;
    } else if (job.maximumSalary) {
      return `Up to ${job.maximumSalary}`;
    }
    return "—";
  };

  const getJobLocation = (job: Job) => {
    if (Array.isArray(job.location)) {
      return job.location.join(", ") || "Location not specified";
    }
    return job.location || "Location not specified";
  };

  const getJobType = (job: Job) => {
    return job.jobType || "—";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Create Pipeline
          </DialogTitle>
          <DialogDescription>
            Select one or more jobs to create a recruitment pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh]  h-[500px] ">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : (
            <>
              <div className="">
                <label className="text-sm font-medium">Search and select jobs</label>
                <MultiSelector
                  values={selectedJobDisplayNames}
                  onValuesChange={handleSelectionChange}
                  className="w-full"
                >
                  <MultiSelectorTrigger className="min-h-10">
                    <MultiSelectorInput 
                      placeholder="Search jobs..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                          <MultiSelectorItem
                            key={job._id}
                            value={getJobDisplayName(job)}
                            className="flex items-center gap-2"
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{job.jobTitle}</span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Building className="h-3 w-3" />
                                {typeof job.client === 'string' ? job.client : job.client?.name || "—"}
                              </div>
                            </div>
                          </MultiSelectorItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          {searchTerm ? "No jobs found matching your search" : "No jobs available"}
                        </div>
                      )}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </div>

              {/* Detailed view of selected jobs */}
              {selectedJobIds.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Selected Job Details</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedJobIds.map((jobId) => {
                      const job = jobs.find(j => j._id === jobId);
                      if (!job) return null;
                      
                      return (
                        <div key={jobId} className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Job Title:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {job.jobTitle || "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Client:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {typeof job.client === 'string' ? job.client : job.client?.name || "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Location:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {getJobLocation(job)}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Salary:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {getSalaryRange(job)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Job Type:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {getJobType(job)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                    Experience:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {job.experience || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                setSelectedJobIds((ids) =>
                                  ids.filter((id) => id !== job._id),
                                )
                              }
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePipeline}
            disabled={selectedJobIds.length === 0 || loading || creatingPipeline}
          >
            {creatingPipeline ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Pipeline...
              </>
            ) : (
              `Create Pipeline with ${selectedJobIds.length > 0 ? `${selectedJobIds.length} Job${selectedJobIds.length > 1 ? 's' : ''}` : 'Jobs'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
