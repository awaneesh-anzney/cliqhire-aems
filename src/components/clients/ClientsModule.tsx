"use client";

import React, { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
import { BulkClientUploadDialog } from "@/components/clients/BulkClientUploadDialog";
import {
  updateClientStage,
  updateClientStageStatus,
  ClientStageStatus,
  deleteClient,
} from "@/services/clientService";

import ClientTableRow from "@/components/clients/ClientTableRow";
import ClientCardView, { ClientCardItem } from "@/components/clients/ClientCardView";
import ClientStatsBar from "@/components/clients/ClientStatsBar";
import ClientFilterDrawer from "@/components/clients/ClientFilterDrawer";
import ClientPaginationControls from "@/components/clients/ClientPaginationControls";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportDialog } from "@/components/common/export-dialog";
import { useExportClients } from "@/hooks/useExportClients";
import { useClients } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Material UI Icons
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

interface Client extends ClientCardItem {}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface ClientsModuleProps {
  moduleType?: "clients" | "leads";
}

export default function ClientsModule({ moduleType = "clients" }: ClientsModuleProps) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewClients = isAdmin || hasPermission("clients", "view");
  const canModifyClients =
    isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");
  const canDeleteClients = isAdmin || hasPermission("clients", "delete");

  const isLeads = moduleType === "leads";
  const entityName = isLeads ? "Lead" : "Client";
  const entityNamePlural = isLeads ? "Leads" : "Clients";

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [clientIdInput, setClientIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [salesLeadInput, setSalesLeadInput] = useState("");
  const [referredByInput, setReferredByInput] = useState("");
  const [createdByInput, setCreatedByInput] = useState("");
  const [selectedClientStage, setSelectedClientStage] = useState<string>("All");

  // Debounced filters
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedClientId = useDebounce(clientIdInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedPhoneNumber = useDebounce(phoneNumberInput, 300);
  const debouncedIndustry = useDebounce(industryInput, 300);
  const debouncedLocation = useDebounce(locationInput, 300);
  const debouncedSalesLead = useDebounce(salesLeadInput, 300);
  const debouncedReferredBy = useDebounce(referredByInput, 300);
  const debouncedCreatedBy = useDebounce(createdByInput, 300);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Stage change confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    clientId: string;
    stage: Client["clientStage"];
  } | null>(null);

  // Status change dialog
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: string;
    status: ClientStageStatus;
  } | null>(null);
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  const [subStageChannel, setSubStageChannel] = useState<string>("Email");
  const [subStageSentDate, setSubStageSentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: exportClientsMutation } = useExportClients();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    debouncedName,
    debouncedClientId,
    debouncedEmail,
    debouncedPhoneNumber,
    debouncedIndustry,
    debouncedLocation,
    debouncedSalesLead,
    debouncedReferredBy,
    debouncedCreatedBy,
    selectedClientStage,
  ]);

  const clearAllFilters = () => {
    setSearchInput("");
    setNameInput("");
    setClientIdInput("");
    setEmailInput("");
    setPhoneNumberInput("");
    setIndustryInput("");
    setLocationInput("");
    setSalesLeadInput("");
    setReferredByInput("");
    setCreatedByInput("");
    setSelectedClientStage("All");
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (nameInput.trim()) count++;
    if (clientIdInput.trim()) count++;
    if (emailInput.trim()) count++;
    if (phoneNumberInput.trim()) count++;
    if (industryInput.trim()) count++;
    if (locationInput.trim()) count++;
    if (salesLeadInput.trim()) count++;
    if (referredByInput.trim()) count++;
    if (createdByInput.trim()) count++;
    if (isLeads && selectedClientStage !== "All") count++;
    return count;
  }, [
    nameInput,
    clientIdInput,
    emailInput,
    phoneNumberInput,
    industryInput,
    locationInput,
    salesLeadInput,
    referredByInput,
    createdByInput,
    isLeads,
    selectedClientStage,
  ]);

  const fetchStage = isLeads
    ? selectedClientStage === "All"
      ? "Lead,Engaged"
      : selectedClientStage
    : "Signed";

  const {
    data: clientsPage,
    isLoading,
    isFetching,
    refetch,
  } = useClients({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    name: debouncedName || undefined,
    clientId: debouncedClientId || undefined,
    email: debouncedEmail || undefined,
    phoneNumber: debouncedPhoneNumber || undefined,
    industry: debouncedIndustry || undefined,
    location: debouncedLocation || undefined,
    salesLead: debouncedSalesLead || undefined,
    referredBy: debouncedReferredBy || undefined,
    createdBy: debouncedCreatedBy || undefined,
    clientStage: fetchStage,
    topLevelOnly: true,
  });

  const allClients: Client[] = useMemo(() => {
    return (clientsPage?.clients ?? []).map((c) => ({
      clientId: c.clientId,
      _id: c._id,
      id: c._id,
      name: c.name,
      industry: c.industry ?? "",
      countryOfBusiness: (c as any).countryOfBusiness ?? c.location ?? "",
      clientStage: (c.clientStage ?? "Lead") as Client["clientStage"],
      clientSubStage: (c.clientSubStage ?? "") as ClientStageStatus,
      owner: (c as any).owner ?? "",
      team: (c as any).team ?? "",
      createdAt: c.createdAt,
      jobCount: c.jobCount ?? 0,
      incorporationDate: (c as any).incorporationDate ?? "",
      createdBy: (typeof c.createdBy === "object" && c.createdBy !== null)
        ? (c.createdBy.firstName && c.createdBy.lastName)
          ? `${c.createdBy.firstName} ${c.createdBy.lastName}`
          : c.createdBy.name || ""
        : (typeof c.createdBy === "string" ? c.createdBy : ""),
      clientAge: (c as any).clientAge,
      clientType: (c as any).clientType || "",
      nextFollowUpDate: (c as any).nextFollowUpDate || "",
      lastContactedAt: (c as any).lastContactedAt || "",
      subsidiaryCount: (c as any).subsidiaryCount || 0,
      role: (c as any).role || "standalone",
      groupId: c.groupId || null,
    }));
  }, [clientsPage]);

  const totalClientsCalc = clientsPage?.totalCount ?? 0;
  const totalPagesCalc = clientsPage?.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPagesCalc) setCurrentPage(newPage);
  };

  // Row selection
  const toggleRowSelection = (clientId: string) => {
    if (!canDeleteClients) return;
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(clientId)) {
        newSelected.delete(clientId);
      } else {
        newSelected.add(clientId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (!canDeleteClients) return;
    if (selectedRows.size === allClients.length && allClients.length > 0) {
      setSelectedRows(new Set());
    } else {
      const newSelectedRows = new Set<string>();
      allClients.forEach((client) => {
        newSelectedRows.add(client.id);
      });
      setSelectedRows(newSelectedRows);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedRows.size === 0 || !canDeleteClients) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((clientId) => deleteClient(clientId))
      );
      await refetch();
      setSelectedRows(new Set());
      toast.success(
        `${selectedRows.size} ${entityName.toLowerCase()}(s) deleted successfully`
      );
    } catch (err) {
      toast.error(
        `Failed to delete selected ${entityNamePlural.toLowerCase()}. Please try again.`
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Stage change logic
  const handleStageChange = (clientId: string, newStage: Client["clientStage"]) => {
    if (!canModifyClients) return;
    setPendingChange({ clientId, stage: newStage });
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingChange) return;
    setError(null);
    try {
      await updateClientStage(pendingChange.clientId, pendingChange.stage);
      setShowConfirmDialog(false);
      refetch();
      toast.success(`${entityName} stage updated to ${pendingChange.stage}`);
    } catch (err: any) {
      setError(
        err.message || `Failed to update ${entityName.toLowerCase()} stage.`
      );
    }
  };

  // Status change logic
  const handleStageStatusChange = (
    clientId: string,
    newStatus: ClientStageStatus
  ) => {
    if (!canModifyClients) return;
    setPendingStatusChange({ clientId, status: newStatus });
    setShowStatusConfirmDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setError(null);
    try {
      let channel: string | undefined = undefined;
      let sentDate: string | undefined = undefined;

      if (pendingStatusChange.status === "Profile Sent") {
        channel = subStageChannel;
        sentDate = subStageSentDate
          ? new Date(subStageSentDate).toISOString()
          : undefined;
      }

      await updateClientStageStatus(
        pendingStatusChange.clientId,
        pendingStatusChange.status,
        channel,
        sentDate
      );
      refetch();
      toast.success(
        `${entityName} status updated to ${pendingStatusChange.status}`
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setShowStatusConfirmDialog(false);
    }
  };

  if (!canViewClients) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
        <Box sx={{ p: 2, borderRadius: "16px", bgcolor: "rgba(255, 86, 48, 0.1)", color: "#FF5630", border: 1, borderColor: "rgba(255, 86, 48, 0.2)" }}>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.125rem", color: "text.primary" }}>
          Access Restricted
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "text.secondary" }}>
          You do not have permission to view {entityNamePlural.toLowerCase()}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 4.25rem)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        p: { xs: 1.5, sm: 2 },
        gap: 1.5,
      }}
    >
      {/* ─── 1. TOP COMMAND & FILTER PANEL ─── */}
      <Box
        sx={{
          flexShrink: 0,
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Main Action Strip: Title, Search, and Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between", gap: 1.5 }}>
          {/* Left: Entity Title & Counter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                bgcolor: isLeads ? "rgba(0, 184, 217, 0.1)" : "rgba(37, 99, 235, 0.1)",
                color: isLeads ? "#00B8D9" : "#2563EB",
                border: 1,
                borderColor: isLeads ? "rgba(0, 184, 217, 0.2)" : "rgba(37, 99, 235, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLeads ? (
                <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                  {entityNamePlural}
                </Typography>
                <Chip
                  label={totalClientsCalc}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    bgcolor: "rgba(145, 158, 171, 0.12)",
                    color: "text.primary",
                    border: 0,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", display: { xs: "none", sm: "block" } }}>
                {isLeads
                  ? "Track and manage prospective enterprise leads & stages"
                  : "Manage active corporate client accounts & service agreements"}
              </Typography>
            </Box>
          </Box>

          {/* Middle: Compact Search Input */}
          <Box sx={{ position: "relative", flex: 1, maxWidth: { md: 400 }, minWidth: 200 }}>
            <Box sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "text.disabled", display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <SearchOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <input
              type="text"
              placeholder={`Search ${entityNamePlural.toLowerCase()} by name, ID, or contact...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-7 h-8 text-xs bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#1C252E] dark:text-white placeholder:text-slate-400 transition-all font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <CloseOutlinedIcon sx={{ fontSize: 13 }} />
              </button>
            )}
          </Box>

          {/* Right: Actions (Filters, View Switcher, Refresh, Import, Export, Create) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
            {/* Filter Drawer Toggle */}
            <Button
              type="button"
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilterDrawerOpen(true)}
              startIcon={<FilterListOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                height: 32,
                px: 1.25,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "11.5px",
                borderColor: activeFiltersCount > 0 ? "transparent" : "divider",
                bgcolor: activeFiltersCount > 0 ? "#2563EB" : "background.paper",
                color: activeFiltersCount > 0 ? "#FFFFFF" : "text.primary",
                "&:hover": {
                  bgcolor: activeFiltersCount > 0 ? "#1D4ED8" : "rgba(145, 158, 171, 0.08)",
                },
              }}
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  sx={{
                    height: 16,
                    ml: 0.5,
                    fontSize: "0.625rem",
                    fontWeight: 800,
                    bgcolor: "rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
                    border: 0,
                    "& .MuiChip-label": { px: 0.5 },
                  }}
                />
              )}
            </Button>

            {/* View Switcher: Table vs Grid */}
            <Box sx={{ display: "flex", alignItems: "center", p: 0.25, borderRadius: "8px", bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={cn(
                  "p-1 rounded-md text-xs transition-all flex items-center justify-center",
                  viewMode === "table"
                    ? "bg-[#2563EB] text-white shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <ViewListOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={cn(
                  "p-1 rounded-md text-xs transition-all flex items-center justify-center",
                  viewMode === "grid"
                    ? "bg-[#2563EB] text-white shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <GridViewOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Box>

            {/* Refresh Button */}
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              sx={{
                height: 32,
                minWidth: 32,
                p: 0,
                borderRadius: "8px",
                borderColor: "divider",
                color: "text.primary",
              }}
            >
              <RefreshOutlinedIcon sx={{ fontSize: 16 }} className={cn(isFetching && "animate-spin text-[#2563EB]")} />
            </Button>

            {/* Import Button */}
            {canModifyClients && (
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setOpenBulkUpload(true)}
                startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  height: 32,
                  px: 1.25,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "11.5px",
                  borderColor: "divider",
                  color: "text.primary",
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                Import
              </Button>
            )}

            {/* Export Button */}
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => setOpenExportDialog(true)}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                height: 32,
                px: 1.25,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "11.5px",
                borderColor: "divider",
                color: "text.primary",
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Export
            </Button>

            {/* Primary Action Button: + New Lead / Client */}
            {canModifyClients && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={() => setOpenCreateModal(true)}
                startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  height: 32,
                  px: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "11.5px",
                  bgcolor: isLeads ? "#00B8D9" : "#2563EB",
                  boxShadow: isLeads ? "0 2px 8px rgba(0, 184, 217, 0.24)" : "0 2px 8px rgba(37, 99, 235, 0.24)",
                  "&:hover": {
                    bgcolor: isLeads ? "#00A3BF" : "#1D4ED8",
                  },
                }}
              >
                <span>New {entityName}</span>
              </Button>
            )}
          </Box>
        </Box>

        {/* Sub-Strip: Quick Stage Filter Pills & Reset */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
          <ClientStatsBar
            totalCount={totalClientsCalc}
            clients={allClients}
            moduleType={moduleType}
            selectedStage={selectedClientStage}
            onSelectStage={isLeads ? setSelectedClientStage : undefined}
          />

          {(activeFiltersCount > 0 || searchInput) && (
            <Button
              type="button"
              onClick={clearAllFilters}
              variant="text"
              size="small"
              startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 13 }} />}
              sx={{
                height: 26,
                px: 1,
                fontSize: "11px",
                fontWeight: 700,
                color: "text.secondary",
                textTransform: "none",
                borderRadius: "6px",
                alignSelf: { xs: "flex-end", sm: "center" },
                "&:hover": {
                  color: "#FF5630",
                  bgcolor: "rgba(255, 86, 48, 0.08)",
                },
              }}
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* ─── 2. CONTEXTUAL BULK SELECTION ACTION BAR ─── */}
      {selectedRows.size > 0 && canDeleteClients && (
        <Box
          sx={{
            flexShrink: 0,
            borderRadius: "10px",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
          className="animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563EB" }} />
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "text.primary" }}>
              <Typography component="span" sx={{ color: "#2563EB", fontWeight: 800, fontSize: "11.5px" }}>
                {selectedRows.size}
              </Typography>{" "}
              of {allClients.length} records selected
            </Typography>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-[11px] text-[#2563EB] hover:underline font-bold ml-1 cursor-pointer"
            >
              {selectedRows.size === allClients.length ? "Deselect All" : "Select All Page"}
            </button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedRows(new Set())}
              sx={{ height: 26, px: 1, fontSize: "11px", fontWeight: 700, textTransform: "none", color: "text.secondary" }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowDeleteDialog(true)}
              startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 26,
                px: 1.5,
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "none",
                bgcolor: "#FF5630",
                "&:hover": { bgcolor: "#E04826" },
              }}
            >
              Delete ({selectedRows.size})
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── 3. MAIN WORKSPACE: TABLE OR GRID VIEW ─── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top subtle fetching pulse */}
        {isFetching && !isLoading && (
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, bgcolor: "rgba(37, 99, 235, 0.2)", overflow: "hidden", zIndex: 30 }}>
            <Box sx={{ height: "100%", width: "100%", bgcolor: "#2563EB" }} className="animate-pulse" />
          </Box>
        )}

        {/* Loading State */}
        {isLoading && allClients.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
              <RefreshOutlinedIcon sx={{ fontSize: 22 }} className="animate-spin" />
            </Box>
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Loading {entityNamePlural.toLowerCase()}...
            </Typography>
          </Box>
        ) : allClients.length === 0 ? (
          /* Empty State */
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, textAlign: "center" }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "rgba(145, 158, 171, 0.08)", border: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", mb: 1.5 }}>
              <FolderOpenOutlinedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              No {entityNamePlural} Found
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", maxWidth: 360, mb: 2 }}>
              {activeFiltersCount > 0 || searchInput
                ? "No records matched your current search filters. Try clearing your filters or changing search criteria."
                : `There are currently no ${entityNamePlural.toLowerCase()} in your system workspace.`}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {activeFiltersCount > 0 || searchInput ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearAllFilters}
                  startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{ height: 30, px: 1.5, fontSize: "11px", fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
                >
                  Reset All Filters
                </Button>
              ) : null}
              {canModifyClients && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenCreateModal(true)}
                  startIcon={<AddOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{ height: 30, px: 1.5, fontSize: "11px", fontWeight: 700, textTransform: "none", borderRadius: "8px", bgcolor: isLeads ? "#00B8D9" : "#2563EB" }}
                >
                  Add {entityName}
                </Button>
              )}
            </Box>
          </Box>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <ClientCardView
            clients={allClients}
            selectedRows={selectedRows}
            onToggleSelect={toggleRowSelection}
            onStageChange={handleStageChange}
            onStatusChange={handleStageStatusChange}
            canModify={canModifyClients}
            canDelete={canDeleteClients}
            moduleType={moduleType}
          />
        ) : (
          /* Table View */
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <Table className="w-full border-separate border-spacing-0 table-auto">
              <TableHeader className="sticky top-0 z-20 bg-slate-50/95 dark:bg-[#1C252E]/95 backdrop-blur-md">
                <TableRow className="border-b border-border/80 hover:bg-transparent">
                  {canDeleteClients && (
                    <TableHead className="w-[40px] px-2 py-2 border-b border-border/80">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          size="small"
                          checked={selectedRows.size > 0 && selectedRows.size === allClients.length}
                          onChange={toggleSelectAll}
                          sx={{ p: 0.25 }}
                        />
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Industry
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Location
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Stage
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-center">
                    Status
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-center">
                    Age
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-center">
                    Jobs
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-right pr-4">
                    Created By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allClients.map((client) => {
                  const isSelected = selectedRows.has(client.id);

                  return (
                    <TableRow
                      key={client.id}
                      className={cn(
                        "group border-b border-border/50 transition-colors",
                        "hover:bg-slate-50/70 dark:hover:bg-slate-800/40",
                        isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      )}
                    >
                      {canDeleteClients && (
                        <TableCell className="px-2 py-2 w-[40px]">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => toggleRowSelection(client.id)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ p: 0.25 }}
                            />
                          </div>
                        </TableCell>
                      )}
                      <ClientTableRow
                        client={client}
                        onStageChange={handleStageChange}
                        onStatusChange={handleStageStatusChange}
                        canModify={canModifyClients}
                        moduleType={moduleType}
                      />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Integrated Pagination Footer */}
        <Box sx={{ flexShrink: 0, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
          <ClientPaginationControls
            currentPage={currentPage}
            totalPages={totalPagesCalc}
            totalClients={totalClientsCalc}
            pageSize={pageSize}
            setPageSize={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            handlePageChange={handlePageChange}
            clientsLength={allClients.length}
            entityName={entityNamePlural.toLowerCase()}
          />
        </Box>
      </Box>

      {/* ─── 4. MODALS & SLIDE-OVER DRAWERS ─── */}
      <ClientFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        entityName={entityName}
        nameInput={nameInput}
        setNameInput={setNameInput}
        clientIdInput={clientIdInput}
        setClientIdInput={setClientIdInput}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        phoneNumberInput={phoneNumberInput}
        setPhoneNumberInput={setPhoneNumberInput}
        industryInput={industryInput}
        setIndustryInput={setIndustryInput}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        salesLeadInput={salesLeadInput}
        setSalesLeadInput={setSalesLeadInput}
        referredByInput={referredByInput}
        setReferredByInput={setReferredByInput}
        createdByInput={createdByInput}
        setCreatedByInput={setCreatedByInput}
        selectedClientStage={selectedClientStage}
        setSelectedClientStage={setSelectedClientStage}
        isLeads={isLeads}
        onClearAll={clearAllFilters}
        activeCount={activeFiltersCount}
      />

      {/* Create Modal */}
      <CreateClientModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
      />

      {/* Bulk Upload Dialog */}
      <BulkClientUploadDialog
        open={openBulkUpload}
        onOpenChange={setOpenBulkUpload}
        entityName={entityNamePlural}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        title={`Export ${entityNamePlural}`}
        description={`Download CSV report for ${entityNamePlural.toLowerCase()}.`}
        onExport={(params) => exportClientsMutation(params)}
      />

      {/* Stage Change Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Stage Update"
        description={`Are you sure you want to change the stage of this ${entityName.toLowerCase()} to "${pendingChange?.stage}"?`}
        onConfirm={handleConfirmChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Delete Selected ${entityNamePlural}`}
        description={`Are you sure you want to permanently delete ${selectedRows.size} selected ${entityName.toLowerCase()}(s)? This action cannot be undone.`}
        onConfirm={confirmDeleteSelected}
      />

      {/* Substage Status Change Modal */}
      <Dialog
        open={showStatusConfirmDialog}
        onOpenChange={setShowStatusConfirmDialog}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Update Status: {pendingStatusChange?.status}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure details for this status change.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          {pendingStatusChange?.status === "Profile Sent" && (
            <div className="grid gap-3 py-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">Channel</Label>
                <Select value={subStageChannel} onValueChange={setSubStageChannel}>
                  <SelectTrigger className="h-8 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Portal">Client Portal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">Date Sent</Label>
                <Input
                  type="date"
                  value={subStageSentDate}
                  onChange={(e) => setSubStageSentDate(e.target.value)}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowStatusConfirmDialog(false)}
              sx={{ fontSize: "11px", borderRadius: "8px", height: 32, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleConfirmStatusChange}
              sx={{ fontSize: "11px", borderRadius: "8px", height: 32, bgcolor: "#2563EB", textTransform: "none" }}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
