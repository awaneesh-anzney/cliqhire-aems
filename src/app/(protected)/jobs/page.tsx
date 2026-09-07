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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { JobPaginationControls } from "@/components/jobs/JobPaginationControls";
import { JobTableRow } from "@/components/jobs/JobTableRow";
import { JobCardView, JobCardItem } from "@/components/jobs/JobCardView";
import { JobFilterDrawer } from "@/components/jobs/JobFilterDrawer";
import { JobStatsBar } from "@/components/jobs/JobStatsBar";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useExportJobs } from "@/hooks/useExportJobs";
import { useJobs, useUpdateJobStage, useDeleteJob } from "@/hooks/useJobs";
import { JobStage } from "@/types/job";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  X,
  Lock,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  LayoutGrid,
  List,
  FolderOpen,
  FilterX,
} from "lucide-react";

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

function ConfirmStageChangeDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-border bg-card shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Confirm Stage Change
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to update the job stage? This will update the job status across all pipelines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel className="rounded-xl text-xs h-9 px-3.5 border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewJobs = isAdmin || hasPermission("jobs", "view");
  const canModifyJobs =
    isAdmin || hasPermission("jobs", "create") || hasPermission("jobs", "edit");
  const canDeleteJobs = isAdmin || hasPermission("jobs", "delete");

  // View Mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stage change confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState<{
    jobId: string;
    newStage: JobStage;
  } | null>(null);

  // Filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobIdInput, setJobIdInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [clientInput, setClientInput] = useState("");
  const [headcountInput, setHeadcountInput] = useState("");
  const [jobTypeInput, setJobTypeInput] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [includeInactiveInput, setIncludeInactiveInput] = useState(false);

  // Debounced filters
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedJobTitle = useDebounce(jobTitleInput, 300);
  const debouncedJobId = useDebounce(jobIdInput, 300);
  const debouncedLocation = useDebounce(locationInput, 300);
  const debouncedClient = useDebounce(clientInput, 300);
  const debouncedHeadcount = useDebounce(headcountInput, 300);
  const debouncedJobType = useDebounce(jobTypeInput, 300);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { mutateAsync: exportJobsMutation } = useExportJobs();
  const { mutateAsync: updateStageMutation } = useUpdateJobStage();
  const { mutateAsync: deleteJobMutation } = useDeleteJob();

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    debouncedJobTitle,
    debouncedJobId,
    debouncedLocation,
    debouncedClient,
    debouncedHeadcount,
    debouncedJobType,
    selectedStage,
    includeInactiveInput,
  ]);

  const clearAllFilters = () => {
    setSearchInput("");
    setJobTitleInput("");
    setJobIdInput("");
    setLocationInput("");
    setClientInput("");
    setHeadcountInput("");
    setJobTypeInput("");
    setSelectedStage("All");
    setIncludeInactiveInput(false);
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (jobTitleInput.trim()) count++;
    if (jobIdInput.trim()) count++;
    if (locationInput.trim()) count++;
    if (clientInput.trim()) count++;
    if (headcountInput.trim()) count++;
    if (jobTypeInput.trim()) count++;
    if (selectedStage !== "All") count++;
    if (includeInactiveInput) count++;
    return count;
  }, [
    jobTitleInput,
    jobIdInput,
    locationInput,
    clientInput,
    headcountInput,
    jobTypeInput,
    selectedStage,
    includeInactiveInput,
  ]);

  const {
    data: jobsData,
    isLoading,
    isFetching,
    refetch,
  } = useJobs({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    jobTitle: debouncedJobTitle || undefined,
    jobId: debouncedJobId || undefined,
    location: debouncedLocation || undefined,
    client: debouncedClient || undefined,
    headcount: debouncedHeadcount ? parseInt(debouncedHeadcount, 10) || undefined : undefined,
    jobType: debouncedJobType || undefined,
    stage: selectedStage === "All" ? undefined : selectedStage,
    includeInactive: includeInactiveInput || undefined,
  });

  const allJobs: JobCardItem[] = useMemo(() => {
    return (jobsData?.jobs ?? []).map((j: any) => ({
      _id: j._id,
      jobId: j.jobId,
      jobTitle: j.jobTitle,
      jobType: j.jobType,
      location: j.location,
      headcount: j.headcount,
      stage: j.stage,
      salaryCurrency: j.salaryCurrency,
      maximumSalary: j.maximumSalary,
      minimumSalary: j.minimumSalary,
      client: j.client,
      createdBy: j.createdBy,
      createdAt: j.createdAt,
    }));
  }, [jobsData]);

  const totalJobs = jobsData?.totalCount ?? 0;
  const totalPages = jobsData?.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStageChange = (jobId: string, newStage: JobStage) => {
    if (!canModifyJobs) return;
    setPendingStageChange({ jobId, newStage });
    setConfirmOpen(true);
  };

  const confirmStageChange = async () => {
    if (!pendingStageChange) return;
    const { jobId, newStage } = pendingStageChange;
    try {
      await updateStageMutation({ id: jobId, stage: newStage });
      refetch();
    } catch (error) {
      // Handled by mutation onError
    } finally {
      setPendingStageChange(null);
      setConfirmOpen(false);
    }
  };

  // Row selection
  const toggleRowSelection = (jobId: string) => {
    if (!canDeleteJobs) return;
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(jobId)) newSelected.delete(jobId);
      else newSelected.add(jobId);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (!canDeleteJobs) return;
    if (selectedRows.size === allJobs.length && allJobs.length > 0) {
      setSelectedRows(new Set());
    } else {
      const newSelectedRows = new Set<string>();
      allJobs.forEach((job) => newSelectedRows.add(job._id));
      setSelectedRows(newSelectedRows);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedRows.size === 0 || !canDeleteJobs) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((jobId) => deleteJobMutation(jobId))
      );
      await refetch();
      setSelectedRows(new Set());
      toast.success(`${selectedRows.size} job(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete selected jobs");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!canViewJobs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center font-bold text-foreground text-lg tracking-tight">
          Access Restricted
        </div>
        <div className="text-center text-muted-foreground text-xs uppercase tracking-wider font-semibold">
          You do not have permission to view job requirements.
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2.5 select-text">
        {/* Top Workstation Command Panel */}
        <div className="shrink-0 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xs p-3 sm:p-3.5 flex flex-col gap-2.5">
          {/* Main Action Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Title + Icon + Count Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Jobs
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-xs font-semibold border border-border/60">
                    {totalJobs}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Manage active job requirements, stages, and recruitment requisitions
                </p>
              </div>
            </div>

            {/* Middle: Fast Search */}
            <div className="relative flex-1 max-w-md min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search jobs by title, ID, client, or location..."
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

            {/* Right: Action Buttons */}
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

              {/* View Switcher */}
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
              {canModifyJobs && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenCreateModal(true)}
                  className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Job</span>
                </Button>
              )}
            </div>
          </div>

          {/* Sub-strip: Stage Tabs & Filter Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
            <JobStatsBar
              totalCount={totalJobs}
              jobs={allJobs}
              selectedStage={selectedStage}
              onSelectStage={setSelectedStage}
            />

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

        {/* Contextual Bulk Action Bar */}
        {selectedRows.size > 0 && canDeleteJobs && (
          <div className="shrink-0 rounded-xl bg-card border border-border shadow-md px-3.5 py-2 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">
                <span className="text-primary font-bold">{selectedRows.size}</span> of{" "}
                {allJobs.length} selected
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] text-primary hover:underline font-semibold ml-2"
              >
                {selectedRows.size === allJobs.length ? "Deselect All" : "Select All Page"}
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

        {/* Main Content: Table / Grid */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col relative">
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden z-30">
              <div className="h-full bg-primary animate-pulse w-full" />
            </div>
          )}

          {isLoading && allJobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Syncing jobs...
              </p>
            </div>
          ) : allJobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-2xs">
                <FolderOpen className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                No Jobs Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
                {activeFiltersCount > 0 || searchInput
                  ? "No job requirements matched your search criteria. Try clearing your filters or altering search terms."
                  : "No job requirements have been created yet."}
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
                {canModifyJobs && (
                  <Button
                    size="sm"
                    onClick={() => setOpenCreateModal(true)}
                    className="text-xs rounded-xl h-8 px-3 bg-primary text-primary-foreground"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    New Job Requirement
                  </Button>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <JobCardView
              jobs={allJobs}
              selectedRows={selectedRows}
              onToggleSelect={toggleRowSelection}
              onStageChange={handleStageChange}
              canModify={canModifyJobs}
              canDelete={canDeleteJobs}
            />
          ) : (
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <Table className="w-full border-separate border-spacing-0 table-auto">
                <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
                  <TableRow className="border-b border-border/80 hover:bg-transparent">
                    {canDeleteJobs && (
                      <TableHead className="w-[44px] px-3 py-2.5 border-b border-border/80">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={
                              selectedRows.size > 0 &&
                              selectedRows.size === allJobs.length
                            }
                            onCheckedChange={toggleSelectAll}
                            className="rounded-md border-border"
                          />
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Job ID
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Position
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Client
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                      Headcount
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Stage
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                      Salary Range
                    </TableHead>
                    <TableHead className="px-3 py-2.5 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-4">
                      Created By
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allJobs.map((job) => {
                    const isSelected = selectedRows.has(job._id);

                    return (
                      <TableRow
                        key={job._id}
                        className={cn(
                          "group border-b border-border/50 transition-colors",
                          "hover:bg-muted/40",
                          isSelected ? "bg-primary/[0.03]" : ""
                        )}
                      >
                        {canDeleteJobs && (
                          <TableCell className="px-3 py-2.5 w-[44px]">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRowSelection(job._id)}
                                className="rounded-md border-border"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </TableCell>
                        )}
                        <JobTableRow
                          job={job}
                          onStageChange={handleStageChange}
                          canModify={canModifyJobs}
                        />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Integrated Compact Footer */}
          <div className="shrink-0 bg-card/90 border-t border-border/80">
            <JobPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobs}
              pageSize={pageSize}
              setPageSize={(s) => {
                setPageSize(s);
                setCurrentPage(1);
              }}
              handlePageChange={handlePageChange}
              jobsLength={allJobs.length}
            />
          </div>
        </div>

        {/* Filter Drawer */}
        <JobFilterDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          jobTitleInput={jobTitleInput}
          setJobTitleInput={setJobTitleInput}
          jobIdInput={jobIdInput}
          setJobIdInput={setJobIdInput}
          locationInput={locationInput}
          setLocationInput={setLocationInput}
          clientInput={clientInput}
          setClientInput={setClientInput}
          headcountInput={headcountInput}
          setHeadcountInput={setHeadcountInput}
          jobTypeInput={jobTypeInput}
          setJobTypeInput={setJobTypeInput}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          includeInactive={includeInactiveInput}
          setIncludeInactive={setIncludeInactiveInput}
          onClearAll={clearAllFilters}
          activeCount={activeFiltersCount}
        />

        {/* Confirm Stage Change Dialog */}
        <ConfirmStageChangeDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={confirmStageChange}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeleteSelected}
          title={`Delete ${selectedRows.size} job(s)?`}
          description={`Confirm deletion of ${selectedRows.size} job requirement(s). This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          isDeleting={isDeleting}
        />

        {/* Create Job Form Modal */}
        {canModifyJobs && (
          <CreateJobRequirementForm
            open={openCreateModal}
            onOpenChange={setOpenCreateModal}
          />
        )}

        {/* Export Dialog */}
        <ExportDialog
          isOpen={openExportDialog}
          onClose={() => setOpenExportDialog(false)}
          title="Export Jobs"
          description="Download CSV report for job requirements."
          onExport={(params: ExportFilterParams | undefined) =>
            exportJobsMutation(params)
          }
          filename="jobs_report"
        />
      </div>
    </TooltipProvider>
  );
}
