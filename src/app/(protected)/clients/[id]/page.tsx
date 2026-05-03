"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCcw,
  StickyNote,
  Paperclip,
  Users,
  Clock,
  FileIcon,
  TriangleAlert,
  Loader,
  FilePen,
  Mail,
  FileText,
  Download,
  MapPin,
  Forklift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios-config"; // Import directly as used in jobs-content
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryContent } from "@/components/clients/summary/summary-content";
import { NotesContent } from "@/components/clients/notes/notes-content";
import { AttachmentsContent } from "@/components/clients/attachments/attachments-content";
import TeamContent from "@/components/clients/team/team-content";
import { ContactsContent } from "@/components/clients/contacts/contacts-content";
import { HistoryContent } from "@/components/clients/history/history-content";
import { JobsContent } from "@/components/clients/jobs/jobs-content";
import { getClientById, updateClientStage, updateClientStageStatus, ClientStageStatus } from "@/services/clientService";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useClientById } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { EmailTemplatesContent } from "@/components/clients/email-templates";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateWeeklyReport } from "@/services/reportService";
import { getJobs, Job } from "@/services/jobService";

const JOB_STAGES = ["Open", "Active", "Onboarding", "Hired", "On Hold", "Closed"];

const CANDIDATE_STAGES = [
  "Sourcing",
  "Screening",
  "Client Review",
  "Interview",
  "Verification",
  "Onboarding",
  "Hired",
];

const CANDIDATE_STAGE_STATUS_MAP: Record<string, string[]> = {
  Sourcing: [
    "Pending",
    "Communication Sent",
    "Communication Acknowledged",
    "CV Recieved",
    "Disqualified",
  ],
  Screening: ["AEMS Interview", "Submission Pending", "CV Submitted", "Disqualified"],
  "Client Review": ["pending", "shortlisted", "Disqualified"],
};

interface PageProps {
  params: { id: string };
}

export default function ClientPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [jobsAvailable, setJobsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState("Summary");
  const [reportStatus, setReportStatus] = useState<"idle" | "generating" | "completed">("idle");
  const [reportProgress, setReportProgress] = useState(0);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedJobStages, setSelectedJobStages] = useState<string[]>([]);
  const [selectedCandidateStages, setSelectedCandidateStages] = useState<string[]>([]);
  const [selectedCandidateStageStatuses, setSelectedCandidateStageStatuses] = useState<
    Record<string, string[]>
  >({});
  const downloadUrlRef = useRef<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewClients = isAdmin || hasPermission("clients", "view");
  const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");
  const canDeleteClients = isAdmin || hasPermission("clients", "delete");
  const canModifyJobs = isAdmin || hasPermission("jobs", "edit");

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{
    clientId: string;
    stage: any;
  } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: string;
    status: ClientStageStatus;
  } | null>(null);

  const {
    data: client,
    isLoading,
    isError,
    refetch,
  } = useClientById(id);

  const { data: clientJobsData } = useQuery({
    queryKey: ["clientJobsForReport", id],
    queryFn: async () => {
      let allJobs: any[] = [];

      // 1. Try legacy endpoint first (as in jobs-content.tsx)
      try {
        const legacy = await api.get(`/api/jobs/client/${id}`);
        // Handle every possible shape
        const r: any = legacy || {};
        const data = r.data;
        if (Array.isArray(data?.data)) {
          allJobs = data.data;
        } else if (Array.isArray(data?.jobs)) {
          allJobs = data.jobs;
        } else if (Array.isArray(data)) {
          allJobs = data;
        }

        if (allJobs.length > 0) {
          return { jobs: allJobs };
        }
      } catch (e) {
        console.warn("Legacy job fetch failed for report", e);
      }

      // 2. Fallback: modern getJobs
      try {
        let res = await getJobs({ client: id, clientId: id, limit: 100 });
        if (Array.isArray(res.jobs) && res.jobs.length > 0) {
          return { jobs: res.jobs };
        }
        if (Array.isArray((res as any).data) && (res as any).data.length > 0) {
          return { jobs: (res as any).data };
        }
      } catch (e) {
        console.warn("Modern job fetch failed for report", e);
      }

      // 3. Last fallback: fetching larger set and client-side filter
      try {
        const allRes = await getJobs({ limit: 500 });
        const sourceJobs = allRes.jobs || (allRes as any).data || [];
        const filtered = sourceJobs.filter((job: any) => {
          const c = job.client;
          if (typeof c === "string") return c === id;
          if (typeof c === "object") return c?._id === id || c?.id === id;
          return false;
        });
        return { jobs: filtered };
      } catch (e) {
        console.error("All fallbacks failed", e);
      }
      return { jobs: [] };
    },
    enabled: Boolean(id) && isReportDialogOpen,
  });

  // Effect to set default position to "all" when dialog opens
  useEffect(() => {
    if (clientJobsData?.jobs && clientJobsData.jobs.length > 0 && !selectedPositionId) {
      setSelectedPositionId("all");
    }
  }, [clientJobsData, selectedPositionId]);

  const handleRefresh = () => {
    refetch();
  };

  const handleTabSwitch = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  const handleStageChange = (clientId: string, newStage: any) => {
    if (!canModifyClients) return;
    setPendingChange({ clientId, stage: newStage });
    setTimeout(() => setShowConfirmDialog(true), 0);
  };

  const handleStageStatusChange = (clientId: string, newStatus: ClientStageStatus) => {
    if (!canModifyClients) return;
    setPendingStatusChange({ clientId, status: newStatus });
    setTimeout(() => setShowStatusConfirmDialog(true), 0);
  };

  const handleConfirmChange = async () => {
    if (!pendingChange) return;
    setError(null);
    try {
      if (pendingChange.stage) {
        await updateClientStage(pendingChange.clientId, pendingChange.stage);
      }
      setShowConfirmDialog(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating client stage:", error);
      setError(error.message || "Failed to update client stage. Please try again.");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setError(null);
    try {
      if (pendingStatusChange.status) {
        await updateClientStageStatus(pendingStatusChange.clientId, pendingStatusChange.status);
      }
      setShowStatusConfirmDialog(false);
      refetch();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
        downloadUrlRef.current = null;
      }
    };
  }, []);

  const handleGenerateReportClick = () => {
    setIsReportDialogOpen(true);
  };

  const handleDownloadReport = () => {
    const url = downloadUrlRef.current;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    const fallbackName = `weekly-report-${client?.name || "client"}-${new Date().toISOString().split("T")[0]
      }.xlsx`;
    link.download = downloadFilename || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    downloadUrlRef.current = null;

    // Reset to idle state after download
    setReportStatus("idle");
    setReportProgress(0);
    setDownloadFilename(null);
  };

  const handleConfirmGenerate = async () => {
    // Close the dialog
    setIsReportDialogOpen(false);

    // Capture button width before changing state
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    // Revoke previous URL if any
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    setReportStatus("generating");
    setReportProgress(0);

    // Start simulated progress to 90% in case server doesn't send content-length
    progressIntervalRef.current = setInterval(() => {
      setReportProgress((prev) => {
        const next = Math.min(prev + 1, 90);
        return next;
      });
    }, 150);

    try {
      const result = await generateWeeklyReport({
        clientId: id,
        jobStages: selectedJobStages,
        candidateStages: selectedCandidateStages,
        candidateStageStatuses: selectedCandidateStageStatuses,
        positionId: selectedPositionId === "all" ? undefined : selectedPositionId,
        onProgress: (percent: number) => {
          if (percent > 0) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            setReportProgress(percent);
          }
        },
      });

      // Completed
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setReportProgress(100);
      const objectUrl = URL.createObjectURL(result.blob);
      downloadUrlRef.current = objectUrl;
      setDownloadFilename(result.filename);
      setReportStatus("completed");
    } catch (error) {
      console.error("Failed to generate weekly report:", error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setReportStatus("idle");
      setReportProgress(0);
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center">
          <TriangleAlert className="size-4" />
          <div className="text-gray-600">Something went wrong! Please try again later</div>
        </div>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center flex-col justify-center">
          <Loader className="size-6 animate-spin" />
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          You do not have permission to view this client.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmChange}
        onCancel={() => { setShowConfirmDialog(false); setError(null); }}
        title="Confirm Stage Change"
        description="Are you sure you want to update the client stage?"
        confirmText="Confirm"
        cancelText="Cancel"
        loading={isLoading}
        error={error}
        confirmVariant="default"
      />
      <ConfirmDialog
        open={showStatusConfirmDialog}
        onOpenChange={setShowStatusConfirmDialog}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => { setShowStatusConfirmDialog(false); setError(null); }}
        title="Are you sure?"
        description="This will update the client's stage status."
        confirmText="Confirm"
        cancelText="Cancel"
        loading={isLoading}
        error={error}
        confirmVariant="default"
      />

      {/* Header Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.name || "Unnamed Client"}</h1>
                <div className="flex items-center gap-2">
                  <ClientStageBadge
                    id={client._id}
                    stage={client.clientStage || "Lead"}
                    onStageChange={handleStageChange}
                    disabled={!canModifyClients}
                  />
                  <ClientStageStatusBadge
                    id={client._id}
                    status={(client.clientSubStage || "") as any}
                    stage={client.clientStage || "Lead"}
                    onStatusChange={handleStageStatusChange}
                    disabled={!canModifyClients}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                {client.industry && (
                  <div className="flex items-center gap-1.5">
                    <Forklift className="h-4 w-4 text-slate-400" />
                    <span>{client.industry}</span>
                  </div>
                )}
                {(client.address || client.location) && (
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                    <MapPin  className="h-4 w-4 text-slate-400" />
                    <span className="truncate max-w-xs">{ client.location ||client.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                  <RefreshCcw 
                    className={`h-4 w-4 text-brand cursor-pointer hover:rotate-180 transition-transform duration-500 ${isLoading ? "animate-spin" : ""}`} 
                    onClick={handleRefresh}
                  />
                  <span className="text-slate-400">Last updated: Just now</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="bg-brand text-white hover:bg-brand/90 font-semibold shadow-md px-6 h-11 transition-all active:scale-95"
                onClick={() => router.push(`/clients/${id}/contract`)}
              >
                <FilePen className="h-4 w-4 mr-2" />
                View Contract
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Button Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50/50 border-b gap-4">
        <div className="flex items-center gap-3">
          {canModifyJobs && (
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-lg flex items-center gap-2 h-10 px-5 shadow-sm transition-all active:scale-95"
              onClick={() => setIsCreateJobOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Job Requirement
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {jobsAvailable &&
            (reportStatus === "idle" ? (
              <Button
                ref={buttonRef}
                size="sm"
                variant="outline"
                className="h-10 px-5 border-slate-200 hover:bg-white hover:text-brand hover:border-brand transition-all rounded-lg flex items-center gap-2 shadow-sm"
                onClick={handleGenerateReportClick}
              >
                <FileText className="h-4 w-4" />
                Generate Weekly Report
              </Button>
            ) : reportStatus === "generating" ? (
              <div
                className="relative h-10 rounded-lg bg-slate-200 overflow-hidden inline-flex items-center justify-center px-4"
                style={{ width: buttonWidth ? `${buttonWidth}px` : "auto", minWidth: "180px" }}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-brand transition-all duration-100 ease-linear"
                  style={{ width: `${reportProgress}%` }}
                />
                <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-white whitespace-nowrap">
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating ({reportProgress}%)
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="h-10 px-5 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-300"
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex border-b w-full rounded-none justify-start h-12 bg-transparent p-0">
          <TabsTrigger
            value="Summary"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <FileIcon className="h-4 w-4" />
            Summary
          </TabsTrigger>

          <TabsTrigger
            value="Jobs"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <FileIcon className="h-4 w-4" />
            Jobs
          </TabsTrigger>

          <TabsTrigger
            value="Notes"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="Attachments"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <Paperclip className="h-4 w-4" />
            Attachments
          </TabsTrigger>

          <TabsTrigger
            value="Contacts"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger
            value="History"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="EmailTemplates"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6"
          >
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Jobs" className="p-0 mt-0">
          <JobsContent clientId={id} clientName={client.name} setJobsAvailable={setJobsAvailable} />
        </TabsContent>

        <TabsContent value="Summary" className="p-4">
          <SummaryContent
            clientId={id}
            clientData={client}
            onTabSwitch={handleTabSwitch}
            canModify={canModifyClients}
          />
        </TabsContent>

        <TabsContent value="Notes" className="p-4">
          <NotesContent clientId={id} canModify={canModifyClients} />
        </TabsContent>

        <TabsContent value="Attachments" className="p-4">
          <AttachmentsContent clientId={id} canModify={canModifyClients} />
        </TabsContent>

        <TabsContent value="ClientTeam" className="p-4">
          <TeamContent clientId={id} />
        </TabsContent>

        <TabsContent value="Contacts" className="p-4">
          <ContactsContent clientId={id} clientData={client} canModify={canModifyClients} />
        </TabsContent>

        <TabsContent value="History" className="p-4">
          <HistoryContent clientId={id} />
        </TabsContent>

        <TabsContent value="EmailTemplates" className="p-4">
          <EmailTemplatesContent clientId={id} clientData={client} canModify={canModifyClients} />
        </TabsContent>
      </Tabs>

      {/* Create Job Modal */}
      {canModifyJobs && (
        <CreateJobRequirementForm
          open={isCreateJobOpen}
          onOpenChange={setIsCreateJobOpen}
          lockedClientId={id}
          lockedClientName={client?.name || ""}
        />
      )}

      {/* Generate Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Weekly Report</DialogTitle>
            <DialogDescription>
              Choose stages to include in the report for this client.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 pr-2">
            <div className="grid gap-2">
              <Label>Position</Label>
              <Select
                value={selectedPositionId}
                onValueChange={(val) => {
                  setSelectedPositionId(val);
                  if (val !== "all") {
                    // Find the job to get its current stage
                    const selectedJob = clientJobsData?.jobs?.find((j: Job) => j._id === val);
                    const currentStage = selectedJob?.stage || "Open";

                    // Select ONLY the current stage of the specific job
                    setSelectedJobStages([currentStage]);

                    // Auto-select ALL candidate stages
                    setSelectedCandidateStages(CANDIDATE_STAGES);

                    // Also populate statuses map
                    const allStatuses: Record<string, string[]> = {};
                    CANDIDATE_STAGES.forEach((stage) => {
                      if (CANDIDATE_STAGE_STATUS_MAP[stage]) {
                        allStatuses[stage] = [...CANDIDATE_STAGE_STATUS_MAP[stage]];
                      }
                    });
                    setSelectedCandidateStageStatuses(allStatuses);
                  } else {
                    // Clear selections so user must choose manually
                    setSelectedJobStages([]);
                    setSelectedCandidateStages([]);
                    setSelectedCandidateStageStatuses({});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {clientJobsData?.jobs?.map((job: Job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-20 items-start">
              <div className="grid gap-3">
                <Label>Job Stages</Label>
                <div className="grid gap-2">
                  {JOB_STAGES.map((stage) => {
                    const checked = selectedJobStages.includes(stage);
                    return (
                      <label key={stage} className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const isChecked = Boolean(v);
                            setSelectedJobStages((prev) =>
                              isChecked ? [...prev, stage] : prev.filter((s) => s !== stage),
                            );
                          }}
                        />
                        <span className="text-sm">{stage}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Candidate Stages</Label>
                <div className="grid gap-2">
                  {CANDIDATE_STAGES.map((stage) => {
                    const checked = selectedCandidateStages.includes(stage);
                    return (
                      <label key={stage} className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const isChecked = Boolean(v);
                            setSelectedCandidateStages((prev) =>
                              isChecked ? [...prev, stage] : prev.filter((s) => s !== stage),
                            );
                            if (CANDIDATE_STAGE_STATUS_MAP[stage]) {
                              setSelectedCandidateStageStatuses((prev) => {
                                const next = { ...prev };
                                if (isChecked) {
                                  next[stage] = [...CANDIDATE_STAGE_STATUS_MAP[stage]];
                                } else {
                                  delete next[stage];
                                }
                                return next;
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{stage}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Candidate Statuses removed as per request to remove extra options */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              disabled={selectedJobStages.length === 0 && selectedCandidateStages.length === 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent >
      </Dialog >
    </div >
  );
}

