"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/services/candidateService";
import {
  useCandidates,
  useUpdateCandidate,
  useDeleteCandidate,
} from "@/hooks/useCandidate";
import { useExportCandidates } from "@/hooks/useExportCandidates";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCw,
  Download,
  Plus,
  Trash2,
  Lock,
  Loader2,
  X,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Redesigned components
import { CandidateStatsBar } from "@/components/candidates/CandidateStatsBar";
import { CandidateFilterDrawer } from "@/components/candidates/CandidateFilterDrawer";
import { CandidateTableRow } from "@/components/candidates/CandidateTableRow";
import { CandidateCardView } from "@/components/candidates/CandidateCardView";
import CandidatePaginationControls from "@/components/candidates/CandidatePaginationControls";
import { CandidatesEmptyState } from "@/components/candidates/empty-states";

// Modals
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CandidatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";
  const canViewCandidates = isAdmin || hasPermission("candidates", "view");
  const canModifyCandidates =
    isAdmin || hasPermission("candidates", "create") || hasPermission("candidates", "edit");
  const canDeleteCandidates = isAdmin || hasPermission("candidates", "delete");

  // State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Filter drawer & Modals
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [profileIdInput, setProfileIdInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedNoticePeriod, setSelectedNoticePeriod] = useState<string>("All");

  // Debounced filter values
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedPhone = useDebounce(phoneInput, 300);
  const debouncedProfileId = useDebounce(profileIdInput, 300);
  const debouncedExperience = useDebounce(experienceInput, 300);
  const debouncedLocation = useDebounce(locationInput, 300);

  // Load view mode from local storage
  useEffect(() => {
    const saved = localStorage.getItem("candidates_view_mode") as "grid" | "table";
    if (saved) {
      setViewMode(saved);
    } else {
      setViewMode(window.innerWidth < 1024 ? "grid" : "table");
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("candidates_view_mode", mode);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedPhone,
    debouncedProfileId,
    debouncedExperience,
    debouncedLocation,
    selectedStatus,
    selectedNoticePeriod,
  ]);

  // Query hook
  const { data, isLoading, isFetching, refetch } = useCandidates({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    name: debouncedName || undefined,
    email: debouncedEmail || undefined,
    phone: debouncedPhone || undefined,
    profileId: debouncedProfileId || undefined,
    experience: debouncedExperience || undefined,
    location: debouncedLocation || undefined,
    status: selectedStatus === "All" ? undefined : selectedStatus,
    noticePeriod: selectedNoticePeriod === "All" ? undefined : selectedNoticePeriod,
  });

  const candidates: Candidate[] = data?.candidates ?? [];
  const totalCandidates: number = data?.total ?? 0;
  const totalPages: number = data?.totalPages ?? 1;

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (nameInput.trim()) count++;
    if (emailInput.trim()) count++;
    if (phoneInput.trim()) count++;
    if (profileIdInput.trim()) count++;
    if (experienceInput.trim()) count++;
    if (locationInput.trim()) count++;
    if (selectedStatus !== "All") count++;
    if (selectedNoticePeriod !== "All") count++;
    return count;
  }, [
    nameInput,
    emailInput,
    phoneInput,
    profileIdInput,
    experienceInput,
    locationInput,
    selectedStatus,
    selectedNoticePeriod,
  ]);

  const clearAllFilters = () => {
    setSearchInput("");
    setNameInput("");
    setEmailInput("");
    setPhoneInput("");
    setProfileIdInput("");
    setExperienceInput("");
    setLocationInput("");
    setSelectedStatus("All");
    setSelectedNoticePeriod("All");
    setCurrentPage(1);
  };

  // Selection handlers
  const toggleRowSelection = (id: string) => {
    if (!canDeleteCandidates) return;
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!canDeleteCandidates) return;
    if (selectedRows.size === candidates.length && candidates.length > 0) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set<string>();
      candidates.forEach((c) => {
        if (c._id) allIds.add(c._id);
      });
      setSelectedRows(allIds);
    }
  };

  // Mutations
  const { mutateAsync: updateCandidateMutation } = useUpdateCandidate();
  const { mutateAsync: deleteCandidateMutation } = useDeleteCandidate();
  const { mutateAsync: exportCandidatesMutation } = useExportCandidates();

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    if (!canModifyCandidates) return;
    try {
      await updateCandidateMutation({ id: candidateId, data: { status: newStatus } });
      toast.success("Candidate status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleSingleDelete = (id: string) => {
    setCandidateToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!canDeleteCandidates) return;
    setIsDeleting(true);
    try {
      if (candidateToDelete) {
        await deleteCandidateMutation(candidateToDelete);
        setSelectedRows((prev) => {
          const next = new Set(prev);
          next.delete(candidateToDelete);
          return next;
        });
        toast.success("Candidate deleted successfully");
      } else if (selectedRows.size > 0) {
        await Promise.all(
          Array.from(selectedRows).map((id) => deleteCandidateMutation(id))
        );
        toast.success(`${selectedRows.size} candidates deleted`);
        setSelectedRows(new Set());
      }
      await refetch();
    } catch (error) {
      toast.error("Failed to delete candidate(s)");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    }
  };

  if (!canViewCandidates) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center font-bold text-lg text-foreground tracking-tight">
          Access Denied
        </div>
        <div className="text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Permission required to view candidates database.
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2 select-none">
      {/* Top Command Bar */}
      <div className="flex-shrink-0 bg-card rounded-2xl border border-border/80 shadow-xs p-2.5 sm:px-3.5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Title & Live Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                Candidates
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                {totalCandidates} talent
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              Manage applicant profiles, statuses, and resume pipeline
            </p>
          </div>
        </div>

        {/* Center: Quick Search */}
        <div className="flex-1 max-w-md min-w-[180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Quick search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 h-8.5 text-xs bg-muted/30 border border-border/70 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 px-2.5 rounded-xl border-border/70 text-xs font-semibold hover:bg-muted/60"
            title="Refresh candidates"
          >
            <RotateCw
              className={cn("w-3.5 h-3.5", isFetching && "animate-spin text-primary")}
            />
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/40 border border-border/70 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                viewMode === "table"
                  ? "bg-card text-primary shadow-xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                viewMode === "grid"
                  ? "bg-card text-primary shadow-xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Drawer Button */}
          <Button
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            className="h-8.5 px-2.5 sm:px-3 rounded-xl border-border/70 text-xs font-semibold gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-foreground text-primary text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="h-8.5 px-2.5 sm:px-3 rounded-xl border-border/70 text-xs font-semibold gap-1.5 hover:bg-muted/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Add Candidate */}
          {canModifyCandidates && (
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="h-8.5 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI & Quick Status Strip */}
      <div className="flex-shrink-0">
        <CandidateStatsBar
          totalCount={totalCandidates}
          candidates={candidates}
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <UserCheck className="w-4 h-4" />
            <span>
              {selectedRows.size} candidate{selectedRows.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {selectedRows.size === candidates.length ? "Deselect All" : "Select All"}
            </Button>
            {canDeleteCandidates && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCandidateToDelete(null);
                  setDeleteModalOpen(true);
                }}
                className="h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar relative">
          {isLoading && candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Loading Talent Pool...
              </span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <CandidatesEmptyState />
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-4 rounded-xl text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Responsive Grid Deck */
            <CandidateCardView
              candidates={candidates}
              selectedRows={selectedRows}
              onToggleRow={toggleRowSelection}
              canModify={canModifyCandidates}
              canDelete={canDeleteCandidates}
              onStatusChange={handleStatusChange}
            />
          ) : (
            /* High-Density Data Table */
            <Table className="w-full border-separate border-spacing-0 table-auto min-w-[1100px]">
              <TableHeader className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md">
                <TableRow className="border-b border-border/70 hover:bg-muted/95">
                  <TableHead className="w-10 px-3 py-2 text-center">
                    {canDeleteCandidates && (
                      <Checkbox
                        checked={
                          selectedRows.size > 0 &&
                          selectedRows.size === candidates.length
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded-md border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    )}
                  </TableHead>
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[200px]">
                    Candidate
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[110px]">
                    Profile ID
                  </TableHead>
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[220px]">
                    Contact
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">
                    Location
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[140px]">
                    Status
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[110px]">
                    Experience
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[110px]">
                    Notice Period
                  </TableHead>
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[150px]">
                    Skills
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center w-[80px]">
                    Resume
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right w-[110px]">
                    Created By
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right w-[70px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <CandidateTableRow
                    key={candidate._id || Math.random().toString()}
                    candidate={candidate}
                    isSelected={
                      candidate._id ? selectedRows.has(candidate._id) : false
                    }
                    onToggleSelect={toggleRowSelection}
                    canModify={canModifyCandidates}
                    canDelete={canDeleteCandidates}
                    onStatusChange={handleStatusChange}
                    onDeleteSingle={handleSingleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Compact Single-Line Pagination Footer */}
        <div className="flex-shrink-0 bg-card border-t border-border/70">
          <CandidatePaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCandidates={totalCandidates}
            pageSize={pageSize}
            setPageSize={setPageSize}
            handlePageChange={(page) => {
              if (page >= 1 && page <= totalPages) setCurrentPage(page);
            }}
            candidatesLength={candidates.length}
          />
        </div>
      </div>

      {/* Filter Slide-over Drawer */}
      <CandidateFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        nameInput={nameInput}
        setNameInput={setNameInput}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        phoneInput={phoneInput}
        setPhoneInput={setPhoneInput}
        profileIdInput={profileIdInput}
        setProfileIdInput={setProfileIdInput}
        experienceInput={experienceInput}
        setExperienceInput={setExperienceInput}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedNoticePeriod={selectedNoticePeriod}
        setSelectedNoticePeriod={setSelectedNoticePeriod}
        onClearAll={clearAllFilters}
        activeCount={activeFiltersCount}
      />

      {/* Modals */}
      <CreateCandidateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCandidateCreated={() => {
          setCreateModalOpen(false);
          setCurrentPage(1);
          refetch();
        }}
      />

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        title="Export Candidates"
        description="Download CSV report of candidate talent pool with applied filters."
        onExport={(params: ExportFilterParams | undefined) =>
          exportCandidatesMutation(params)
        }
        filename="candidates"
      />

      <DeleteConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCandidateToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          candidateToDelete
            ? "Delete Candidate?"
            : `Delete ${selectedRows.size} candidate(s)?`
        }
        description={
          candidateToDelete
            ? "Are you sure you want to permanently delete this candidate profile? This action cannot be undone."
            : `Are you sure you want to delete ${selectedRows.size} candidate profiles from the database? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
        isDeleting={isDeleting}
      />
    </div>
  );
}
