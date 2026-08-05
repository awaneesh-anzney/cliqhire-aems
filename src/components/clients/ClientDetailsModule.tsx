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
  LayoutDashboard,
  Briefcase,
  History,
  Activity,
  GitCommit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios-config"; // Import directly as used in jobs-content
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryContent } from "@/components/clients/summary/summary-content";
import { ActivitiesContent } from "@/components/clients/activities/activities-content";
import { TimelineContent } from "@/components/clients/timeline/timeline-content";
import { NotesContent } from "@/components/clients/notes/notes-content";
import { AttachmentsContent } from "@/components/clients/attachments/attachments-content";
import TeamContent from "@/components/clients/team/team-content";
import { ContactsContent } from "@/components/clients/contacts/contacts-content";
import { HistoryContent } from "@/components/clients/history/history-content";
import { JobsContent } from "@/components/clients/jobs/jobs-content";
import { getClientById, updateClientStageStatus, ClientStageStatus, changeClientStage } from "@/services/clientService";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useClientById } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { EmailTemplatesContent } from "@/components/clients/email-templates";
import { FollowUpModal } from "@/components/clients/modals/follow-up-modal";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Ensure Avatar component is imported
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

interface ClientDetailsModuleProps {
  id: string;
  moduleType?: "clients" | "leads";
}

export default function ClientDetailsModule({ id, moduleType = "clients" }: ClientDetailsModuleProps) {
  const router = useRouter();
  const entityName = moduleType === "leads" ? "Lead" : "Client";
  const entityNameLower = entityName.toLowerCase();
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
  const [stageChangeReason, setStageChangeReason] = useState("");
  const [stageChangeClosureSummary, setStageChangeClosureSummary] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: string;
    status: ClientStageStatus;
  } | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

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
        await changeClientStage(pendingChange.clientId, {
          stage: pendingChange.stage,
          reason: stageChangeReason,
          closureSummary: stageChangeClosureSummary
        });
      }
      setShowConfirmDialog(false);
      setStageChangeReason("");
      setStageChangeClosureSummary("");
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
    const fallbackName = `weekly-report-${client?.name || entityNameLower}-${new Date().toISOString().split("T")[0]
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
          <div className="text-foreground">Something went wrong! Please try again later</div>
        </div>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center flex-col justify-center">
          <Loader className="size-6 animate-spin" />
          <p className="text-foreground">Loading {entityNameLower} data...</p>
        </div>
      </div>
    );
  }

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          You do not have permission to view this {entityNameLower}.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden">
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Stage Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the {entityNameLower} stage to {pendingChange?.stage}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reason (Optional)</Label>
              <Input 
                value={stageChangeReason} 
                onChange={(e) => setStageChangeReason(e.target.value)}
                placeholder="e.g. Client agreed to terms"
              />
            </div>
            <div className="grid gap-2">
              <Label>Closure Summary (Optional)</Label>
              <Input 
                value={stageChangeClosureSummary} 
                onChange={(e) => setStageChangeClosureSummary(e.target.value)}
                placeholder="Summary of the previous stage"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmChange} disabled={isLoading}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={showStatusConfirmDialog}
        onOpenChange={setShowStatusConfirmDialog}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => { setShowStatusConfirmDialog(false); setError(null); }}
        title="Are you sure?"
        description={`This will update the ${entityNameLower}'s stage status.`}
        confirmText="Confirm"
        cancelText="Cancel"
        loading={isLoading}
        error={error}
        confirmVariant="default"
      />

      {/* Compact Modern Header */}
      <div className="w-full">
  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center ">
    {/* Left */}
    <section className="flex-1 min-w-0 p-3">

<div className="flex flex-wrap items-center gap-2.5">
  {/* Client Avatar Section */}
  <Avatar className="h-8 w-8 border border-white/40 shadow-sm ring-2 ring-emerald-400/30">
    <AvatarImage 
      src={client.avatarUrl || client.logo} 
      alt={client.name || "Client"} 
    />
    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-700 text-white font-extrabold text-xs">
      {client.name ? client.name.slice(0, 2).toUpperCase() : "CL"}
    </AvatarFallback>
  </Avatar>

  {/* Vibrant & Colorful Client Name (No Black/Dark Shadow) */}
  <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
    {client.name || `Unnamed ${entityName}`}
  </h1>

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
    onStageChange={handleStageStatusChange}
    disabled={!canModifyClients}
  />

  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setIsFollowUpModalOpen(true)}
          className="ml-1 flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs transition-colors hover:bg-muted"
        >
          <Clock
            className={`h-3.5 w-3.5 ${
              client.nextFollowUpDate &&
              new Date(client.nextFollowUpDate) < new Date()
                ? "text-destructive"
                : "text-brand"
            }`}
          />
          <span
            className={`font-semibold ${
              client.nextFollowUpDate &&
              new Date(client.nextFollowUpDate) < new Date()
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {client.nextFollowUpDate
              ? new Date(client.nextFollowUpDate).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )
              : "Set Follow-up"}
          </span>
        </button>
      </TooltipTrigger>

      {client.nextFollowUpOwner && (
        <TooltipContent className="text-xs">
          {typeof client.nextFollowUpOwner === "string"
            ? client.nextFollowUpOwner
            : `${client.nextFollowUpOwner.firstName} ${client.nextFollowUpOwner.lastName}`}
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
</div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {client.industry && (
          <span className="flex items-center gap-1.5">
            <Forklift className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="truncate">{client.industry}</span>
          </span>
        )}

        {(client.address || client.location) && (
          <span className="flex items-center gap-1.5 border-l border-border pl-4">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="max-w-[200px] truncate">
              {client.location || client.address}
            </span>
          </span>
        )}

        <button
          type="button"
          onClick={handleRefresh}
          className="group flex items-center gap-1.5 border-l border-border pl-4 transition-colors hover:text-foreground"
        >
          <RefreshCcw
            className={`h-3.5 w-3.5 text-brand transition-transform duration-500 group-hover:rotate-180 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
          <span>Just now</span>
        </button>
      </div>
    </section>

    {/* Right */}
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-lg border-border bg-card px-3 text-xs font-semibold shadow-sm hover:bg-muted"
        onClick={() =>
          router.push(
            `/${moduleType === "leads" ? "leads" : "clients"}/${id}/contract`
          )
        }
      >
        <FilePen className="mr-1.5 h-3.5 w-3.5" />
        Contract
      </Button>

      {jobsAvailable &&
        (reportStatus === "idle" ? (
          <Button
            ref={buttonRef}
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-brand/30 px-3 text-xs font-semibold text-brand shadow-sm hover:bg-brand/10"
            onClick={handleGenerateReportClick}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Report
          </Button>
        ) : reportStatus === "generating" ? (
          <div
            className="relative inline-flex h-8 min-w-[100px] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted px-3 shadow-inner"
            style={{
              width: buttonWidth ? `${buttonWidth}px` : undefined,
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-brand/20 transition-all duration-100"
              style={{ width: `${reportProgress}%` }}
            />

            <span className="relative z-10 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              <Loader className="h-3 w-3 animate-spin text-brand" />
              {reportProgress}%
            </span>
          </div>
        ) : (
          <Button
            size="sm"
            className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white animate-in zoom-in duration-300 hover:bg-emerald-700"
            onClick={handleDownloadReport}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
        ))}

      {canModifyJobs && (
        <Button
          size="sm"
          className="h-8 rounded-lg bg-brand px-3 text-xs font-semibold text-primary-foreground shadow-md transition-all active:scale-95 hover:bg-brand/90"
          onClick={() => setIsCreateJobOpen(true)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Job
        </Button>
      )}
    </div>
  </div>
</div>

      <FollowUpModal 
        clientId={id} 
        open={isFollowUpModalOpen} 
        onOpenChange={setIsFollowUpModalOpen} 
        currentDate={client.nextFollowUpDate} 
        currentOwner={typeof client.nextFollowUpOwner === 'string' ? client.nextFollowUpOwner : client.nextFollowUpOwner?._id}
      />

      {/* Tabs */}

<Tabs 
  value={activeTab} 
  onValueChange={setActiveTab} 
  className="w-full flex-1 max-w-full min-w-0 overflow-hidden flex flex-col"
>
  {/* Tabs Header Navigation */}
  <div className="w-full border-b border-emerald-900/10 bg-white/40 dark:bg-black/20 backdrop-blur-md ">
    <TabsList className="flex w-full items-center justify-start gap-1 p-1 bg-transparent overflow-x-auto scrollbar-none max-w-full min-w-0 h-auto">
      
      {/* Summary */}
      <TabsTrigger
        value="Summary"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
        <span>Summary</span>
      </TabsTrigger>

      {/* Jobs */}
      <TabsTrigger
        value="Jobs"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
        <span>Jobs</span>
      </TabsTrigger>

      {/* Notes */}
      <TabsTrigger
        value="Notes"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <StickyNote className="h-3.5 w-3.5 text-amber-500" />
        <span>Notes</span>
      </TabsTrigger>

      {/* Attachments */}
      <TabsTrigger
        value="Attachments"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <Paperclip className="h-3.5 w-3.5 text-blue-500" />
        <span>Attachments</span>
      </TabsTrigger>

      {/* Contacts */}
      <TabsTrigger
        value="Contacts"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <Users className="h-3.5 w-3.5 text-indigo-500" />
        <span>Contacts</span>
      </TabsTrigger>

      {/* History */}
      <TabsTrigger
        value="History"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <History className="h-3.5 w-3.5 text-purple-500" />
        <span>History</span>
      </TabsTrigger>

      {/* Activities */}
      <TabsTrigger
        value="Activities"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <Activity className="h-3.5 w-3.5 text-teal-600" />
        <span>Activities</span>
      </TabsTrigger>

      {/* Timeline */}
      <TabsTrigger
        value="Timeline"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <GitCommit className="h-3.5 w-3.5 text-cyan-600" />
        <span>Timeline</span>
      </TabsTrigger>

      {/* Email Templates */}
      <TabsTrigger
        value="EmailTemplates"
        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0"
      >
        <Mail className="h-3.5 w-3.5 text-rose-500" />
        <span>Email Templates</span>
      </TabsTrigger>

    </TabsList>
  </div>

  {/* Tab Contents with Fade-In Smooth Animation */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    <TabsContent 
      value="Summary" 
      className="p-2 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <SummaryContent
        clientId={id}
        clientData={client}
        onTabSwitch={handleTabSwitch}
        canModify={canModifyClients}
      />
    </TabsContent>

    <TabsContent 
      value="Jobs" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <JobsContent clientId={id} clientName={client.name} setJobsAvailable={setJobsAvailable} />
    </TabsContent>

    <TabsContent 
      value="Notes" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <NotesContent clientId={id} canModify={canModifyClients} />
    </TabsContent>

    <TabsContent 
      value="Attachments" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <AttachmentsContent clientId={id} canModify={canModifyClients} />
    </TabsContent>

    <TabsContent 
      value="ClientTeam" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <TeamContent clientId={id} />
    </TabsContent>

    <TabsContent 
      value="Contacts" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <ContactsContent clientId={id} clientData={client} canModify={canModifyClients} />
    </TabsContent>

    <TabsContent 
      value="History" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <HistoryContent clientId={id} />
    </TabsContent>

    <TabsContent 
      value="Activities" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <ActivitiesContent clientId={id} />
    </TabsContent>

    <TabsContent 
      value="Timeline" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <TimelineContent clientId={id} />
    </TabsContent>

    <TabsContent 
      value="EmailTemplates" 
      className="p-3 sm:p-5 max-w-full m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
    >
      <EmailTemplatesContent clientId={id} clientData={client} canModify={canModifyClients} />
    </TabsContent>
  </div>
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
              Choose stages to include in the report for this {entityNameLower}.
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

