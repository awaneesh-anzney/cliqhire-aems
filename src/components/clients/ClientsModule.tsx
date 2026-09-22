"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { useExportClients } from "@/hooks/useExportClients";
import { useClients } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building2,
  Users,
  Search,
  SlidersHorizontal,
  X,
  Lock,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  LayoutGrid,
  List,
  FolderOpen,
  FilterX,
  Sparkles,
} from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center font-bold text-foreground text-lg tracking-tight">
          Access Restricted
        </div>
        <div className="text-center text-muted-foreground text-xs uppercase tracking-wider font-semibold">
          You do not have permission to view {entityNamePlural.toLowerCase()}.
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      {/* Container: strictly fits viewport under Header */}
      <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2.5 select-text">
        {/* Top Workstation Command Panel */}
        <div className="shrink-0 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xs p-3 sm:p-3.5 flex flex-col gap-2.5">
          {/* Main Action Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Title + Entity Icon + Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
                {isLeads ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {entityNamePlural}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-xs font-semibold border border-border/60">
                    {totalClientsCalc}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  {isLeads
                    ? "Track and manage prospective leads and engagement"
                    : "Manage active client partnerships and contracts"}
                </p>
              </div>
            </div>

            {/* Middle: Fast Search */}
            <div className="relative flex-1 max-w-md min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
              <input
                type="text"
                placeholder={`Search ${entityNamePlural.toLowerCase()} by name, ID, or contact...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 h-9 text-xs bg-muted/30 hover:bg-muted/50 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all font-medium"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Right: Actions (Filters, Views, Import, Export, Refresh, Create) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* Filter Drawer Toggle */}
              <Button
                type="button"
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterDrawerOpen(true)}
                className={cn(
                  "h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all",
                  activeFiltersCount > 0
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* View Switcher: Table vs Grid */}
              <div className="flex items-center p-0.5 rounded-xl bg-muted/50 border border-border/80">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-all",
                    viewMode === "table"
                      ? "bg-card text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-all",
                    viewMode === "grid"
                      ? "bg-card text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Refresh Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh"
                className="h-9 w-9 p-0 rounded-xl border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-primary")}
                />
              </Button>

              {/* Import Button */}
              {canModifyClients && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenBulkUpload(true)}
                  title="Import Data"
                  className="h-9 px-2.5 sm:px-3 rounded-xl border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Import</span>
                </Button>
              )}

              {/* Export Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenExportDialog(true)}
                title="Export CSV"
                className="h-9 px-2.5 sm:px-3 rounded-xl border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Export</span>
              </Button>

              {/* Primary Create Button */}
              {canModifyClients && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenCreateModal(true)}
                  className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New {entityName}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Sub-strip: Stats & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
            {/* KPI Metrics & Stage quick switcher */}
            <ClientStatsBar
              totalCount={totalClientsCalc}
              clients={allClients}
              moduleType={moduleType}
              selectedStage={selectedClientStage}
              onSelectStage={isLeads ? setSelectedClientStage : undefined}
            />

            {/* Active Filters Clear Button if any */}
            {(activeFiltersCount > 0 || searchInput) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors self-end sm:self-auto shrink-0"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating / Contextual Bulk Action Bar */}
        {selectedRows.size > 0 && canDeleteClients && (
          <div className="shrink-0 rounded-xl bg-card border border-border shadow-md px-3.5 py-2 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">
                <span className="text-primary font-bold">{selectedRows.size}</span> of{" "}
                {allClients.length} selected
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] text-primary hover:underline font-semibold ml-2"
              >
                {selectedRows.size === allClients.length ? "Deselect All" : "Select All Page"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRows(new Set())}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Selected ({selectedRows.size})</span>
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area: Table / Grid */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col relative">
          {/* Subtle fetching indicator */}
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden z-30">
              <div className="h-full bg-primary animate-pulse w-full" />
            </div>
          )}

          {/* Loading State */}
          {isLoading && allClients.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Loading {entityNamePlural.toLowerCase()}...
              </p>
            </div>
          ) : allClients.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-2xs">
                <FolderOpen className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                No {entityNamePlural} Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
                {activeFiltersCount > 0 || searchInput
                  ? "No records matched your current search filters. Try clearing your filters or changing criteria."
                  : `There are no ${entityNamePlural.toLowerCase()} available yet in the system.`}
              </p>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 || searchInput ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    <FilterX className="w-3.5 h-3.5 mr-1.5" />
                    Reset All Filters
                  </Button>
                ) : null}
                {canModifyClients && (
                  <Button
                    size="sm"
                    onClick={() => setOpenCreateModal(true)}
                    className="text-xs rounded-xl h-8 px-3 bg-primary text-primary-foreground"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add {entityName}
                  </Button>
                )}
              </div>
            </div>
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
                <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
                  <TableRow className="border-b border-border/80 hover:bg-transparent">
                    {canDeleteClients && (
                      <TableHead className="w-[44px] px-3 py-2.5 border-b border-border/80">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={
                              selectedRows.size > 0 &&
                              selectedRows.size === allClients.length
                            }
                            onCheckedChange={toggleSelectAll}
                            className="rounded-md border-border"
                          />
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      ID
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Industry
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Stage
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                      Status
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                      Age
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                      Jobs
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-4">
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
                          "hover:bg-muted/40",
                          isSelected ? "bg-primary/[0.03]" : ""
                        )}
                      >
                        {canDeleteClients && (
                          <TableCell className="px-3 py-2.5 w-[44px]">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRowSelection(client.id)}
                                className="rounded-md border-border"
                                onClick={(e) => e.stopPropagation()}
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

          {/* Integrated Compact Pagination Footer */}
          <div className="shrink-0 bg-card/90 border-t border-border/80">
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
          </div>
        </div>

        {/* Filter Drawer */}
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
          setSelectedClientStage={isLeads ? setSelectedClientStage : undefined}
          isLeads={isLeads}
          onClearAll={clearAllFilters}
          activeCount={activeFiltersCount}
        />

        {/* Create Client Modal */}
        {canModifyClients && (
          <CreateClientModal
            open={openCreateModal}
            onOpenChange={setOpenCreateModal}
          />
        )}

        {/* Bulk Upload Dialog */}
        {canModifyClients && (
          <BulkClientUploadDialog
            open={openBulkUpload}
            onOpenChange={setOpenBulkUpload}
            entityName={entityNamePlural}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeleteSelected}
          title={`Delete ${selectedRows.size} ${entityName.toLowerCase()}(s)?`}
          description={`This action will permanently remove ${selectedRows.size} ${entityName.toLowerCase()}(s). This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          isDeleting={isDeleting}
        />

        {/* Export Dialog */}
        <ExportDialog
          isOpen={openExportDialog}
          onClose={() => setOpenExportDialog(false)}
          title={`Export ${entityNamePlural}`}
          description={`Download CSV report for ${entityNamePlural.toLowerCase()}.`}
          onExport={(params: ExportFilterParams | undefined) =>
            exportClientsMutation(params)
          }
          filename={entityNamePlural.toLowerCase()}
        />

        {/* Stage Change Confirm Dialog */}
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmChange}
          onCancel={() => setShowConfirmDialog(false)}
          title="Confirm Stage Change"
          description={`Are you sure you want to update the stage to "${pendingChange?.stage}"?`}
          confirmText="Confirm"
          cancelText="Cancel"
          loading={isLoading}
          error={error}
        />

        {/* Status Change Dialog (with Profile Sent options) */}
        <Dialog
          open={showStatusConfirmDialog}
          onOpenChange={setShowStatusConfirmDialog}
        >
          <DialogContent className="rounded-2xl border-border bg-card shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Confirm Status Change
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update status to &ldquo;{pendingStatusChange?.status}&rdquo; for this{" "}
                {entityName.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>

            {pendingStatusChange?.status === "Profile Sent" && (
              <div className="grid gap-3.5 py-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Channel <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={subStageChannel}
                    onValueChange={setSubStageChannel}
                  >
                    <SelectTrigger className="rounded-xl h-9 text-xs border-border bg-muted/30">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="Email" className="text-xs">
                        Email
                      </SelectItem>
                      <SelectItem value="LinkedIn" className="text-xs">
                        LinkedIn
                      </SelectItem>
                      <SelectItem value="WhatsApp" className="text-xs">
                        WhatsApp
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Sent Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    value={subStageSentDate}
                    onChange={(e) => setSubStageSentDate(e.target.value)}
                    className="rounded-xl h-9 text-xs border-border bg-muted/30"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-destructive text-xs font-medium bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                {error}
              </div>
            )}

            <DialogFooter className="gap-2 sm:space-x-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusConfirmDialog(false)}
                className="rounded-xl text-xs h-9 px-3.5"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmStatusChange}
                disabled={isLoading}
                className="rounded-xl text-xs h-9 px-4 bg-primary text-primary-foreground"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
