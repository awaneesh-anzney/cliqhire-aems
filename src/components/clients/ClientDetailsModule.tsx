"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button as MuiButton,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  Checkbox as MuiCheckbox,
  FormControlLabel,
  Menu,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

import { api } from "@/lib/axios-config";
import { SummaryContent } from "@/components/clients/summary/summary-content";
import { ActivitiesContent } from "@/components/clients/activities/activities-content";
import { TimelineContent } from "@/components/clients/timeline/timeline-content";
import { NotesContent } from "@/components/clients/notes/notes-content";
import { AttachmentsContent } from "@/components/clients/attachments/attachments-content";
import { ContactsContent } from "@/components/clients/contacts/contacts-content";
import { HierarchyContent } from "@/components/clients/hierarchy/hierarchy-content";
import { HistoryContent } from "@/components/clients/history/history-content";
import { JobsContent } from "@/components/clients/jobs/jobs-content";
import { EmailTemplatesContent } from "@/components/clients/email-templates";
import { updateClientStageStatus, ClientStageStatus, changeClientStage, linkClientToGroup } from "@/services/clientService";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useClientById } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { FollowUpModal } from "@/components/clients/modals/follow-up-modal";
import { AddClientToGroupModal } from "@/components/client-groups/AddClientToGroupModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
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

const DETAIL_TABS = [
  { id: "Summary", label: "Summary", icon: DashboardOutlinedIcon },
  { id: "Jobs", label: "Jobs", icon: WorkOutlineOutlinedIcon },
  { id: "Hierarchy", label: "Hierarchy", icon: AccountTreeOutlinedIcon },
  { id: "Notes", label: "Notes", icon: NoteAltOutlinedIcon },
  { id: "Attachments", label: "Attachments", icon: AttachFileOutlinedIcon },
  { id: "Contacts", label: "Contacts", icon: PeopleAltOutlinedIcon },
  { id: "History", label: "History", icon: HistoryOutlinedIcon },
  { id: "Activities", label: "Activities", icon: BoltOutlinedIcon },
  { id: "Timeline", label: "Timeline", icon: TimelineOutlinedIcon },
  { id: "EmailTemplates", label: "Email Templates", icon: EmailOutlinedIcon },
] as const;

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
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // Group Dropdown Menu Anchor
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<null | HTMLElement>(null);

  const {
    data: client,
    isLoading,
    isError,
    refetch,
    isFetching,
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
        // Fallback
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
        // Fallback
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
    toast.success(`${entityName} data refreshed`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`${entityName} ID copied`);
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
      console.error("Error updating stage:", error);
      setError(error.message || `Failed to update ${entityNameLower} stage. Please try again.`);
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
      <Box className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Box className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
          <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h6" className="font-bold text-foreground mb-1">
          Failed to load {entityNameLower} details
        </Typography>
        <Typography variant="body2" className="text-muted-foreground max-w-sm mb-4">
          An error occurred while fetching information for this {entityNameLower}.
        </Typography>
        <MuiButton
          onClick={() => refetch()}
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlinedIcon />}
          className="rounded-xl capitalize"
        >
          Try Again
        </MuiButton>
      </Box>
    );
  }

  if (isLoading || !client) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <CircularProgress size={32} thickness={4} sx={{ color: "var(--color-primary-base, #1976d2)", mb: 2 }} />
        <Typography variant="body2" className="text-muted-foreground font-medium">
          Loading {entityNameLower} profile...
        </Typography>
      </Box>
    );
  }

  if (!canViewClients) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Typography variant="body1" className="text-muted-foreground font-medium">
          You do not have permission to view this {entityNameLower}.
        </Typography>
      </Box>
    );
  }

  const isFollowUpOverdue = client.nextFollowUpDate && new Date(client.nextFollowUpDate) < new Date();
  const clientInitials = client.name ? client.name.slice(0, 2).toUpperCase() : "CL";
  const avatarSrc = (client as any).avatarUrl || (client as any).logo;

  return (
    <Box className="flex flex-col h-full w-full max-w-full overflow-hidden bg-background">
      {/* 1. Sleek Compact Header Bar (Breadcrumb & Action Bar) */}
      <Box className="bg-card/80 border-b border-border/70 backdrop-blur-md sticky top-0 z-20">
        <Box className="px-3 sm:px-6 py-1.5 border-b border-border/40 flex items-center justify-between gap-2">
          {/* Breadcrumb Navigation */}
          <Box className="flex items-center gap-2 min-w-0">
            <MuiButton
              variant="text"
              size="small"
              onClick={() => router.push(`/${moduleType === "leads" ? "leads" : "clients"}`)}
              startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "var(--color-slate-600, #475569)",
                px: 1,
                py: 0.25,
                borderRadius: "8px",
                minWidth: "auto",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)", color: "var(--foreground)" },
              }}
            >
              {entityName}s
            </MuiButton>

            <Typography variant="caption" sx={{ color: "text.disabled", mx: 0.25 }}>
              /
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "0.8125rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: 160, sm: 260, md: 360 },
              }}
            >
              {client.name || "Unnamed"}
            </Typography>

            {/* ID Chip with Copy */}
            <Tooltip title={copiedId ? "Copied!" : "Click to copy ID"} arrow>
              <Chip
                label={id.slice(-6).toUpperCase()}
                size="small"
                onClick={handleCopyId}
                icon={
                  copiedId ? (
                    <CheckOutlinedIcon sx={{ fontSize: "14px !important", color: "#10b981 !important" }} />
                  ) : (
                    <ContentCopyOutlinedIcon sx={{ fontSize: "13px !important" }} />
                  )
                }
                sx={{
                  height: 22,
                  fontSize: "0.6875rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  bgcolor: "var(--color-slate-100, #f1f5f9)",
                  border: "1px solid var(--color-slate-200, #e2e8f0)",
                  cursor: "pointer",
                  "& .MuiChip-label": { px: 0.75 },
                  "&:hover": { bgcolor: "var(--color-slate-200, #e2e8f0)" },
                }}
              />
            </Tooltip>
          </Box>

          {/* Quick Refresh */}
          <Tooltip title="Refresh Profile" arrow>
            <IconButton
              size="small"
              onClick={handleRefresh}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                border: "1px solid var(--border)",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <RefreshOutlinedIcon
                sx={{
                  fontSize: 16,
                  color: isFetching ? "primary.main" : "text.secondary",
                  animation: isFetching ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 2. Executive Hero Banner (Compact & Polished) */}
        <Box className="px-3 sm:px-6 py-2.5 sm:py-3">
          <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Identity Column */}
            <Box className="flex items-center gap-3 min-w-0 flex-1">
              {/* Client Avatar / Logo */}
              <Box className="relative shrink-0">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={client.name || "Client"}
                    className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl object-cover border border-border shadow-xs"
                  />
                ) : (
                  <Box className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-gradient-to-br from-[#1C252E] to-[#2563EB] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs border border-border/80">
                    {clientInitials}
                  </Box>
                )}
              </Box>

              {/* Title & Metadata Strip */}
              <Box className="min-w-0 flex-1 space-y-1">
                <Box className="flex flex-wrap items-center gap-2">
                  <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.125rem", sm: "1.25rem" },
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                    className="truncate max-w-[280px] sm:max-w-md"
                  >
                    {client.name || `Unnamed ${entityName}`}
                  </Typography>

                  {/* Subsidiary Tag */}
                  {client.parentClientId && (
                    <Chip
                      size="small"
                      icon={<ApartmentOutlinedIcon sx={{ fontSize: "14px !important", color: "inherit" }} />}
                      label={`Subsidiary of ${client.parentCompany?.name || "Parent"}`}
                      sx={{
                        height: 22,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        bgcolor: "rgba(37, 99, 235, 0.08)",
                        color: "#2563EB",
                        border: "1px solid rgba(37, 99, 235, 0.2)",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}

                  {/* Client Group Dropdown / Add Badge */}
                  {client.groupId ? (
                    <>
                      <Chip
                        size="small"
                        icon={<GroupOutlinedIcon sx={{ fontSize: "14px !important", color: "inherit" }} />}
                        label={client.group?.name ? `Group: ${client.group.name}` : "Group Member"}
                        onClick={(e) => setGroupMenuAnchor(e.currentTarget)}
                        sx={{
                          height: 22,
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          bgcolor: "rgba(245, 158, 11, 0.1)",
                          color: "#D97706",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          cursor: "pointer",
                          "& .MuiChip-label": { px: 0.75 },
                          "&:hover": { bgcolor: "rgba(245, 158, 11, 0.18)" },
                        }}
                      />
                      <Menu
                        anchorEl={groupMenuAnchor}
                        open={Boolean(groupMenuAnchor)}
                        onClose={() => setGroupMenuAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                        slotProps={{
                          paper: {
                            sx: {
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                              border: "1px solid var(--border)",
                              minWidth: 180,
                              py: 0.5,
                            },
                          },
                        }}
                      >
                        <MenuItem
                          dense
                          onClick={() => {
                            setGroupMenuAnchor(null);
                            router.push(`/client-groups/${client.groupId}`);
                          }}
                          sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                        >
                          View Group Details
                        </MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            setGroupMenuAnchor(null);
                            setIsGroupModalOpen(true);
                          }}
                          sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                        >
                          Move to Another Group
                        </MenuItem>
                        <MenuItem
                          dense
                          onClick={async () => {
                            setGroupMenuAnchor(null);
                            if (window.confirm("Client will stay as-is, only its group tag is removed. Are you sure?")) {
                              await linkClientToGroup(client._id, null);
                              refetch();
                            }
                          }}
                          sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "error.main" }}
                        >
                          Remove from Group
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Chip
                      size="small"
                      icon={<AddOutlinedIcon sx={{ fontSize: "14px !important", color: "inherit" }} />}
                      label="Add to Group"
                      onClick={() => setIsGroupModalOpen(true)}
                      sx={{
                        height: 22,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        bgcolor: "var(--muted)",
                        color: "text.secondary",
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        "& .MuiChip-label": { px: 0.75 },
                        "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                      }}
                    />
                  )}
                </Box>

                {/* Subtitle Status & Follow-Up Badges */}
                <Box className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

                  {/* Follow-Up Pill */}
                  <Tooltip
                    title={
                      client.nextFollowUpOwner
                        ? typeof client.nextFollowUpOwner === "string"
                          ? `Follow-up Owner: ${client.nextFollowUpOwner}`
                          : `Owner: ${client.nextFollowUpOwner.firstName} ${client.nextFollowUpOwner.lastName}`
                        : "Click to set next follow-up date and owner"
                    }
                    arrow
                  >
                    <button
                      type="button"
                      onClick={() => setIsFollowUpModalOpen(true)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all shadow-2xs cursor-pointer",
                        isFollowUpOverdue
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                          : "border-border/80 bg-background hover:bg-muted text-foreground",
                      )}
                    >
                      <AccessTimeOutlinedIcon
                        sx={{
                          fontSize: 14,
                          color: isFollowUpOverdue ? "#E11D48" : "var(--color-primary-base, #2563EB)",
                        }}
                      />
                      <span>
                        {client.nextFollowUpDate
                          ? new Date(client.nextFollowUpDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "Set Follow-up"}
                      </span>
                    </button>
                  </Tooltip>

                  {/* Industry & Location */}
                  {client.industry && (
                    <Box className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground ml-1">
                      <WorkOutlineOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                      <span className="truncate max-w-[130px]">{client.industry}</span>
                    </Box>
                  )}

                  {(client.location || client.address) && (
                    <Box className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <LocationOnOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                      <span className="truncate max-w-[130px]">{client.location || client.address}</span>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Action Buttons Toolbar */}
            <Box className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
              {/* Contract Action */}
              <MuiButton
                variant="outlined"
                size="small"
                startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => router.push(`/${moduleType === "leads" ? "leads" : "clients"}/${id}/contract`)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderRadius: "10px",
                  borderColor: "var(--border)",
                  color: "text.primary",
                  bgcolor: "background.paper",
                  px: 1.5,
                  py: 0.6,
                  height: 32,
                  "&:hover": { bgcolor: "action.hover", borderColor: "var(--border)" },
                }}
              >
                Contract
              </MuiButton>

              {/* Weekly Report Action */}
              {jobsAvailable &&
                (reportStatus === "idle" ? (
                  <MuiButton
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleGenerateReportClick}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "10px",
                      borderColor: "var(--border)",
                      color: "text.primary",
                      bgcolor: "background.paper",
                      px: 1.5,
                      py: 0.6,
                      height: 32,
                      "&:hover": { bgcolor: "action.hover", borderColor: "var(--border)" },
                    }}
                  >
                    Weekly Report
                  </MuiButton>
                ) : reportStatus === "generating" ? (
                  <Box
                    sx={{
                      height: 32,
                      minWidth: 120,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      bgcolor: "var(--muted)",
                      px: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: `${reportProgress}%`,
                        bgcolor: "rgba(37, 99, 235, 0.2)",
                        transition: "width 0.15s ease",
                      }}
                    />
                    <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={12} thickness={5} />
                      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700 }}>
                        {reportProgress}%
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <MuiButton
                    variant="contained"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleDownloadReport}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "10px",
                      bgcolor: "#10B981",
                      color: "#FFFFFF",
                      px: 1.5,
                      py: 0.6,
                      height: 32,
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Download Excel
                  </MuiButton>
                ))}

              {/* New Job Action */}
              {canModifyJobs && (
                <MuiButton
                  variant="contained"
                  size="small"
                  startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setIsCreateJobOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    borderRadius: "10px",
                    bgcolor: "var(--color-primary-base, #1C252E)",
                    color: "#FFFFFF",
                    px: 1.75,
                    py: 0.6,
                    height: 32,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
                    "&:hover": {
                      bgcolor: "var(--color-primary-dark, #0F172A)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
                    },
                  }}
                >
                  New Job
                </MuiButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* 3. Modern Material UI Compact Tab Navigation Strip */}
        <Box className="w-full border-t border-border/60 bg-muted/20 px-2 sm:px-4">
          <Box
            className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1"
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {DETAIL_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0",
                    isActive
                      ? "bg-background text-primary shadow-xs border border-border/80 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                  )}
                >
                  <IconComp
                    sx={{
                      fontSize: 16,
                      color: isActive ? "var(--color-primary-base, #2563EB)" : "inherit",
                      opacity: isActive ? 1 : 0.8,
                    }}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* 4. Tab Content Panels Viewport */}
      <Box className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-5 max-w-7xl w-full mx-auto">
        {activeTab === "Summary" && (
          <Box className="animate-in fade-in-50 duration-200">
            <SummaryContent
              clientId={id}
              clientData={client}
              onTabSwitch={handleTabSwitch}
              canModify={canModifyClients}
            />
          </Box>
        )}

        {activeTab === "Jobs" && (
          <Box className="animate-in fade-in-50 duration-200">
            <JobsContent clientId={id} clientName={client.name} setJobsAvailable={setJobsAvailable} />
          </Box>
        )}

        {activeTab === "Hierarchy" && (
          <Box className="animate-in fade-in-50 duration-200">
            <HierarchyContent clientId={id} />
          </Box>
        )}

        {activeTab === "Notes" && (
          <Box className="animate-in fade-in-50 duration-200">
            <NotesContent clientId={id} canModify={canModifyClients} />
          </Box>
        )}

        {activeTab === "Attachments" && (
          <Box className="animate-in fade-in-50 duration-200">
            <AttachmentsContent clientId={id} canModify={canModifyClients} />
          </Box>
        )}

        {activeTab === "Contacts" && (
          <Box className="animate-in fade-in-50 duration-200">
            <ContactsContent clientId={id} clientData={client} canModify={canModifyClients} />
          </Box>
        )}

        {activeTab === "History" && (
          <Box className="animate-in fade-in-50 duration-200">
            <HistoryContent clientId={id} />
          </Box>
        )}

        {activeTab === "Activities" && (
          <Box className="animate-in fade-in-50 duration-200">
            <ActivitiesContent clientId={id} />
          </Box>
        )}

        {activeTab === "Timeline" && (
          <Box className="animate-in fade-in-50 duration-200">
            <TimelineContent clientId={id} />
          </Box>
        )}

        {activeTab === "EmailTemplates" && (
          <Box className="animate-in fade-in-50 duration-200">
            <EmailTemplatesContent clientId={id} clientData={client} canModify={canModifyClients} />
          </Box>
        )}
      </Box>

      {/* 5. Modals & Dialogs (Preserving all Real API Logic) */}

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
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid var(--border)",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.05rem", pb: 0.5 }}>
          Confirm Stage Change
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Update the {entityNameLower} stage to <strong className="text-foreground">{pendingChange?.stage}</strong>?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="Reason (Optional)"
              value={stageChangeReason}
              onChange={(e) => setStageChangeReason(e.target.value)}
              placeholder="e.g. Client agreed to terms"
              fullWidth
              slotProps={{
                input: { sx: { borderRadius: "10px", fontSize: "0.8125rem" } },
                inputLabel: { sx: { fontSize: "0.8125rem" } },
              }}
            />
            <TextField
              size="small"
              label="Closure Summary (Optional)"
              value={stageChangeClosureSummary}
              onChange={(e) => setStageChangeClosureSummary(e.target.value)}
              placeholder="Summary of the previous stage"
              fullWidth
              multiline
              rows={2}
              slotProps={{
                input: { sx: { borderRadius: "10px", fontSize: "0.8125rem" } },
                inputLabel: { sx: { fontSize: "0.8125rem" } },
              }}
            />
          </Box>

          {error && (
            <Typography variant="caption" sx={{ color: "error.main", mt: 1.5, display: "block" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <MuiButton
            onClick={() => setShowConfirmDialog(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmChange}
            variant="contained"
            size="small"
            disabled={isLoading}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "var(--color-primary-base, #1C252E)",
              "&:hover": { bgcolor: "var(--color-primary-dark, #0F172A)" },
            }}
          >
            Confirm Change
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Confirm Status Change Dialog */}
      <Dialog
        open={showStatusConfirmDialog}
        onClose={() => setShowStatusConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid var(--border)",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.05rem", pb: 0.5 }}>
          Confirm Status Change
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Update the {entityNameLower} stage status to{" "}
            <strong className="text-foreground">{pendingStatusChange?.status}</strong>.
          </Typography>

          {pendingStatusChange?.status === "Profile Sent" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.8125rem" }}>Channel *</InputLabel>
                <MuiSelect
                  value={subStageChannel}
                  label="Channel *"
                  onChange={(e) => setSubStageChannel(e.target.value)}
                  sx={{ borderRadius: "10px", fontSize: "0.8125rem" }}
                >
                  <MenuItem value="Email" sx={{ fontSize: "0.8125rem" }}>Email</MenuItem>
                  <MenuItem value="LinkedIn" sx={{ fontSize: "0.8125rem" }}>LinkedIn</MenuItem>
                  <MenuItem value="WhatsApp" sx={{ fontSize: "0.8125rem" }}>WhatsApp</MenuItem>
                </MuiSelect>
              </FormControl>

              <TextField
                size="small"
                type="date"
                label="Sent Date (Optional)"
                value={subStageSentDate}
                onChange={(e) => setSubStageSentDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true, sx: { fontSize: "0.8125rem" } },
                  input: { sx: { borderRadius: "10px", fontSize: "0.8125rem" } },
                }}
                fullWidth
              />
            </Box>
          )}

          <FormControlLabel
            control={
              <MuiCheckbox
                size="small"
                checked={scheduleFollowUpOnSubstage}
                onChange={(e) => setScheduleFollowUpOnSubstage(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                Schedule Follow-up for this Activity
              </Typography>
            }
            sx={{ mt: 1 }}
          />

          {error && (
            <Typography variant="caption" sx={{ color: "error.main", mt: 1.5, display: "block" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <MuiButton
            onClick={() => setShowStatusConfirmDialog(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmStatusChange}
            variant="contained"
            size="small"
            disabled={isLoading}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "var(--color-primary-base, #1C252E)",
              "&:hover": { bgcolor: "var(--color-primary-dark, #0F172A)" },
            }}
          >
            Confirm Status
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog
        open={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid var(--border)",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", pb: 0.5 }}>
          Generate Weekly Report
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Select position and stages to compile the comprehensive Excel report.
          </Typography>

          <FormControl size="small" fullWidth sx={{ mb: 2.5 }}>
            <InputLabel sx={{ fontSize: "0.8125rem" }}>Position</InputLabel>
            <MuiSelect
              value={selectedPositionId}
              label="Position"
              onChange={(e) => {
                const val = e.target.value;
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
              sx={{ borderRadius: "10px", fontSize: "0.8125rem" }}
            >
              <MenuItem value="all" sx={{ fontSize: "0.8125rem" }}>All Positions</MenuItem>
              {clientJobsData?.jobs?.map((job: Job) => (
                <MenuItem key={job._id} value={job._id} sx={{ fontSize: "0.8125rem" }}>
                  {job.jobTitle}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {/* Job Stages Box */}
            <Box sx={{ border: "1px solid var(--border)", borderRadius: "12px", p: 1.5, bgcolor: "var(--muted)/30" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", mb: 1, display: "block" }}>
                Job Stages
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {JOB_STAGES.map((stage) => {
                  const checked = selectedJobStages.includes(stage);
                  return (
                    <FormControlLabel
                      key={stage}
                      control={
                        <MuiCheckbox
                          size="small"
                          checked={checked}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedJobStages((prev) =>
                              isChecked ? [...prev, stage] : prev.filter((s) => s !== stage),
                            );
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{stage}</Typography>}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Candidate Stages Box */}
            <Box sx={{ border: "1px solid var(--border)", borderRadius: "12px", p: 1.5, bgcolor: "var(--muted)/30" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", mb: 1, display: "block" }}>
                Candidate Stages
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {CANDIDATE_STAGES.map((stage) => {
                  const checked = selectedCandidateStages.includes(stage);
                  return (
                    <FormControlLabel
                      key={stage}
                      control={
                        <MuiCheckbox
                          size="small"
                          checked={checked}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
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
                      }
                      label={<Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{stage}</Typography>}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <MuiButton
            onClick={() => setIsReportDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmGenerate}
            variant="contained"
            size="small"
            disabled={selectedJobStages.length === 0 && selectedCandidateStages.length === 0}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "var(--color-primary-base, #1C252E)",
              "&:hover": { bgcolor: "var(--color-primary-dark, #0F172A)" },
            }}
          >
            Generate Excel
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
