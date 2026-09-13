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
  Building2,
  ChevronLeft,
  Copy,
  Check,
  Calendar,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios-config";
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
import { HierarchyContent } from "@/components/clients/hierarchy/hierarchy-content";
import { HistoryContent } from "@/components/clients/history/history-content";
import { JobsContent } from "@/components/clients/jobs/jobs-content";
import { updateClientStageStatus, ClientStageStatus, changeClientStage } from "@/services/clientService";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useClientById } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { EmailTemplatesContent } from "@/components/clients/email-templates";
import { FollowUpModal } from "@/components/clients/modals/follow-up-modal";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddClientToGroupModal } from "@/components/client-groups/AddClientToGroupModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { linkClientToGroup } from "@/services/clientService";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [copiedId, setCopiedId] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewClients = isAdmin || hasPermission("clients", "view");
  const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");
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
  const [subStageChannel, setSubStageChannel] = useState<string>("Email");
  const [subStageSentDate, setSubStageSentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [scheduleFollowUpOnSubstage, setScheduleFollowUpOnSubstage] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

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
      try {
        const legacy = await api.get(`/api/jobs/client/${id}`);
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
        // Fallback to modern getJobs
      }

      try {
        const res = await getJobs({ client: id, clientId: id, limit: 100 });
        if (Array.isArray(res.jobs) && res.jobs.length > 0) {
          return { jobs: res.jobs };
        }
        if (Array.isArray((res as any).data) && (res as any).data.length > 0) {
          return { jobs: (res as any).data };
        }
      } catch (e) {
        // Fallback to client-side filter
      }

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
        console.error("All job fallbacks failed", e);
      }
      return { jobs: [] };
    },
    enabled: Boolean(id) && isReportDialogOpen,
  });

  useEffect(() => {
    if (clientJobsData?.jobs && clientJobsData.jobs.length > 0 && !selectedPositionId) {
      setSelectedPositionId("all");
    }
  }, [clientJobsData, selectedPositionId]);

  const handleRefresh = () => {
    refetch();
    toast.success("Client data refreshed");
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Client ID copied");
    setTimeout(() => setCopiedId(false), 2000);
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
    setScheduleFollowUpOnSubstage(false);
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
          closureSummary: stageChangeClosureSummary,
        });
      }
      setShowConfirmDialog(false);
      setStageChangeReason("");
      setStageChangeClosureSummary("");
      toast.success("Stage updated successfully");
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
      let channel: string | undefined = undefined;
      let sentDate: string | undefined = undefined;

      if (pendingStatusChange.status === "Profile Sent") {
        channel = subStageChannel;
        sentDate = subStageSentDate ? new Date(subStageSentDate).toISOString() : undefined;
      }

      await updateClientStageStatus(pendingStatusChange.clientId, pendingStatusChange.status, channel, sentDate);
      setShowStatusConfirmDialog(false);

      if (scheduleFollowUpOnSubstage) {
        setTimeout(() => setIsFollowUpModalOpen(true), 300);
      }
      toast.success("Stage status updated");
      refetch();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

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
    const fallbackName = `weekly-report-${client?.name || entityNameLower}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    link.download = downloadFilename || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    downloadUrlRef.current = null;

    setReportStatus("idle");
    setReportProgress(0);
    setDownloadFilename(null);
  };

  const handleConfirmGenerate = async () => {
    setIsReportDialogOpen(false);

    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    setReportStatus("generating");
    setReportProgress(0);

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
      toast.error("Failed to generate report");
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Failed to load client details</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
          An error occurred while fetching information for this {entityNameLower}.
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Loading {entityNameLower} profile...</p>
      </div>
    );
  }

  if (!canViewClients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="text-muted-foreground font-medium">
          You do not have permission to view this {entityNameLower}.
        </div>
      </div>
    );
  }

  const isFollowUpOverdue = client.nextFollowUpDate && new Date(client.nextFollowUpDate) < new Date();

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden">
      {/* Top Header & Executive Hero Section */}
      <div className="bg-card/70 border-b border-border/80 backdrop-blur-md sticky top-0 z-10 transition-all">
        {/* Navigation Breadcrumb Bar */}
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80"
              onClick={() => router.push(`/${moduleType === "leads" ? "leads" : "clients"}`)}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>{entityName}s</span>
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
              {client.name || "Unnamed"}
            </span>

            <button
              type="button"
              onClick={handleCopyId}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/70 hover:text-foreground bg-muted/50 hover:bg-muted px-1.5 py-0.5 rounded border border-border/50 transition-colors"
              title="Copy Client ID"
            >
              {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>{id.slice(-6)}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
              title="Refresh Data"
            >
              <RefreshCcw className={`h-3 w-3 ${isLoading ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline text-[11px] font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Hero Identity Banner */}
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 border-background shadow-sm ring-1 ring-border/80 shrink-0">
                <AvatarImage
                  src={(client as any).avatarUrl || (client as any).logo}
                  alt={client.name || "Client"}
                />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white font-extrabold text-sm sm:text-base">
                  {client.name ? client.name.slice(0, 2).toUpperCase() : "CL"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1">
                {/* Title & Organization Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-full">
                    {client.name || `Unnamed ${entityName}`}
                  </h1>

                  {client.parentClientId && (
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider"
                    >
                      <Building2 className="w-3 h-3" />
                      Subsidiary of {client.parentCompany?.name || "Parent"}
                    </Badge>
                  )}

                  {client.groupId ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-amber-500/20 transition-colors"
                        >
                          <Building2 className="w-3 h-3" />
                          {client.group?.name ? `Group: ${client.group.name}` : "Group Member"}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => router.push(`/client-groups/${client.groupId}`)}>
                          View Group details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsGroupModalOpen(true)}>
                          Move to another group
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={async () => {
                            if (window.confirm("Client will stay as-is, only its group tag is removed. Are you sure?")) {
                              await linkClientToGroup(client._id, null);
                              refetch();
                            }
                          }}
                        >
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => setIsGroupModalOpen(true)}
                    >
                      <Plus className="w-3 h-3" />
                      Add to Group
                    </Badge>
                  )}
                </div>

                {/* Status Badges & Follow-Up Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
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

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setIsFollowUpModalOpen(true)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all shadow-2xs",
                            isFollowUpOverdue
                              ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "border-border/70 bg-card hover:bg-muted/80 text-foreground",
                          )}
                        >
                          <Clock className={cn("h-3.5 w-3.5", isFollowUpOverdue ? "text-destructive" : "text-primary")} />
                          <span>
                            {client.nextFollowUpDate
                              ? new Date(client.nextFollowUpDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "Set Follow-up"}
                          </span>
                        </button>
                      </TooltipTrigger>
                      {client.nextFollowUpOwner && (
                        <TooltipContent className="text-xs font-medium">
                          {typeof client.nextFollowUpOwner === "string"
                            ? client.nextFollowUpOwner
                            : `${client.nextFollowUpOwner.firstName} ${client.nextFollowUpOwner.lastName}`}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {/* Metadata Chips */}
                  <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground ml-2">
                    {client.industry && (
                      <span className="flex items-center gap-1">
                        <Forklift className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="truncate max-w-[140px]">{client.industry}</span>
                      </span>
                    )}
                    {(client.location || client.address) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="truncate max-w-[140px]">{client.location || client.address}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-xl border-border/80 bg-card px-3.5 text-xs font-semibold shadow-2xs hover:bg-muted"
                onClick={() => router.push(`/${moduleType === "leads" ? "leads" : "clients"}/${id}/contract`)}
              >
                <FilePen className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                Contract
              </Button>

              {jobsAvailable &&
                (reportStatus === "idle" ? (
                  <Button
                    ref={buttonRef}
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl border-border/80 bg-card px-3.5 text-xs font-semibold shadow-2xs hover:bg-muted"
                    onClick={handleGenerateReportClick}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    Weekly Report
                  </Button>
                ) : reportStatus === "generating" ? (
                  <div
                    className="relative inline-flex h-9 min-w-[120px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted px-3.5 shadow-inner"
                    style={{ width: buttonWidth ? `${buttonWidth}px` : undefined }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-100"
                      style={{ width: `${reportProgress}%` }}
                    />
                    <span className="relative z-10 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
                      <Loader className="h-3.5 w-3.5 animate-spin text-primary" />
                      {reportProgress}%
                    </span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="h-9 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 animate-in zoom-in-95 duration-200"
                    onClick={handleDownloadReport}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                ))}

              {canModifyJobs && (
                <Button
                  size="sm"
                  className="h-9 rounded-xl bg-primary text-primary-foreground px-4 text-xs font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                  onClick={() => setIsCreateJobOpen(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Job
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="w-full border-t border-border/60 bg-muted/20 px-3 sm:px-6">
            <TabsList className="flex w-full items-center justify-start gap-1 p-0 bg-transparent overflow-x-auto scrollbar-none h-11">
              <TabsTrigger
                value="Summary"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Summary</span>
              </TabsTrigger>

              <TabsTrigger
                value="Jobs"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Jobs</span>
              </TabsTrigger>

              <TabsTrigger
                value="Hierarchy"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Network className="h-3.5 w-3.5" />
                <span>Hierarchy</span>
              </TabsTrigger>

              <TabsTrigger
                value="Notes"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span>Notes</span>
              </TabsTrigger>

              <TabsTrigger
                value="Attachments"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Attachments</span>
              </TabsTrigger>

              <TabsTrigger
                value="Contacts"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Contacts</span>
              </TabsTrigger>

              <TabsTrigger
                value="History"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <History className="h-3.5 w-3.5" />
                <span>History</span>
              </TabsTrigger>

              <TabsTrigger
                value="Activities"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Activities</span>
              </TabsTrigger>

              <TabsTrigger
                value="Timeline"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <GitCommit className="h-3.5 w-3.5" />
                <span>Timeline</span>
              </TabsTrigger>

              <TabsTrigger
                value="EmailTemplates"
                className="h-9 px-3 text-xs font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-2xs data-[state=active]:font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email Templates</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Tab Panels with Smooth Animation and Responsive Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="Summary" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <SummaryContent
              clientId={id}
              clientData={client}
              onTabSwitch={handleTabSwitch}
              canModify={canModifyClients}
            />
          </TabsContent>

          <TabsContent value="Jobs" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <JobsContent clientId={id} clientName={client.name} setJobsAvailable={setJobsAvailable} />
          </TabsContent>

          <TabsContent value="Hierarchy" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <HierarchyContent clientId={id} />
          </TabsContent>

          <TabsContent value="Notes" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <NotesContent clientId={id} canModify={canModifyClients} />
          </TabsContent>

          <TabsContent value="Attachments" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <AttachmentsContent clientId={id} canModify={canModifyClients} />
          </TabsContent>

          <TabsContent value="Contacts" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <ContactsContent clientId={id} clientData={client} canModify={canModifyClients} />
          </TabsContent>

          <TabsContent value="History" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <HistoryContent clientId={id} />
          </TabsContent>

          <TabsContent value="Activities" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <ActivitiesContent clientId={id} />
          </TabsContent>

          <TabsContent value="Timeline" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <TimelineContent clientId={id} />
          </TabsContent>

          <TabsContent value="EmailTemplates" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
            <EmailTemplatesContent clientId={id} clientData={client} canModify={canModifyClients} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Follow-up Modal */}
      <FollowUpModal
        clientId={id}
        open={isFollowUpModalOpen}
        onOpenChange={setIsFollowUpModalOpen}
        currentDate={client.nextFollowUpDate}
        currentOwner={typeof client.nextFollowUpOwner === "string" ? client.nextFollowUpOwner : client.nextFollowUpOwner?._id}
      />

      {/* Group Modal */}
      <AddClientToGroupModal
        open={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        mode="pick-group"
        clientId={id}
        onSuccess={() => refetch()}
      />

      {/* Create Job Modal */}
      {canModifyJobs && (
        <CreateJobRequirementForm
          open={isCreateJobOpen}
          onOpenChange={setIsCreateJobOpen}
          lockedClientId={id}
          lockedClientName={client?.name || ""}
        />
      )}

      {/* Confirm Stage Change Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Stage Change</DialogTitle>
            <DialogDescription>
              Update the {entityNameLower} stage to <span className="font-bold text-foreground">{pendingChange?.stage}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason (Optional)</Label>
              <Input
                value={stageChangeReason}
                onChange={(e) => setStageChangeReason(e.target.value)}
                placeholder="e.g. Client agreed to terms"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Closure Summary (Optional)</Label>
              <Input
                value={stageChangeClosureSummary}
                onChange={(e) => setStageChangeClosureSummary(e.target.value)}
                placeholder="Summary of the previous stage"
                className="h-10 rounded-lg"
              />
            </div>
          </div>
          {error && <div className="text-destructive text-xs">{error}</div>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmChange} disabled={isLoading}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Status Change Dialog */}
      <Dialog open={showStatusConfirmDialog} onOpenChange={setShowStatusConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Update the {entityNameLower} stage status to{" "}
              <span className="font-bold text-foreground">{pendingStatusChange?.status}</span>.
            </DialogDescription>
          </DialogHeader>
          {pendingStatusChange?.status === "Profile Sent" && (
            <div className="grid gap-3 py-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Channel <span className="text-destructive">*</span>
                </Label>
                <Select value={subStageChannel} onValueChange={setSubStageChannel}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent Date (Optional)</Label>
                <Input
                  type="date"
                  value={subStageSentDate}
                  onChange={(e) => setSubStageSentDate(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="py-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule-followup"
                checked={scheduleFollowUpOnSubstage}
                onCheckedChange={(checked) => setScheduleFollowUpOnSubstage(checked === true)}
              />
              <Label htmlFor="schedule-followup" className="cursor-pointer text-xs font-medium">
                Schedule Follow-up for this Activity
              </Label>
            </div>
          </div>

          {error && <div className="text-destructive text-xs">{error}</div>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowStatusConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} disabled={isLoading}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Weekly Report</DialogTitle>
            <DialogDescription>
              Select position and stages to include in the Excel report.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</Label>
              <Select
                value={selectedPositionId}
                onValueChange={(val) => {
                  setSelectedPositionId(val);
                  if (val !== "all") {
                    const selectedJob = clientJobsData?.jobs?.find((j: Job) => j._id === val);
                    const currentStage = selectedJob?.stage || "Open";
                    setSelectedJobStages([currentStage]);
                    setSelectedCandidateStages(CANDIDATE_STAGES);

                    const allStatuses: Record<string, string[]> = {};
                    CANDIDATE_STAGES.forEach((stage) => {
                      if (CANDIDATE_STAGE_STATUS_MAP[stage]) {
                        allStatuses[stage] = [...CANDIDATE_STAGE_STATUS_MAP[stage]];
                      }
                    });
                    setSelectedCandidateStageStatuses(allStatuses);
                  } else {
                    setSelectedJobStages([]);
                    setSelectedCandidateStages([]);
                    setSelectedCandidateStageStatuses({});
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded-lg">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Stages</Label>
                <div className="space-y-2 border border-border/70 rounded-xl p-3 bg-muted/20">
                  {JOB_STAGES.map((stage) => {
                    const checked = selectedJobStages.includes(stage);
                    return (
                      <label key={stage} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const isChecked = Boolean(v);
                            setSelectedJobStages((prev) =>
                              isChecked ? [...prev, stage] : prev.filter((s) => s !== stage),
                            );
                          }}
                        />
                        <span>{stage}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate Stages</Label>
                <div className="space-y-2 border border-border/70 rounded-xl p-3 bg-muted/20">
                  {CANDIDATE_STAGES.map((stage) => {
                    const checked = selectedCandidateStages.includes(stage);
                    return (
                      <label key={stage} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
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
                        <span>{stage}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              disabled={selectedJobStages.length === 0 && selectedCandidateStages.length === 0}
            >
              Generate Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
