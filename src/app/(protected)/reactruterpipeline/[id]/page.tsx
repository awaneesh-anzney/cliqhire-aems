"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  FilterX,
  X,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  RotateCw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { type Job, type Candidate, mapUIStageToBackendStage } from "@/components/Recruiter-Pipeline/dummy-data";
import {
  getPipelineEntry,
  updateCandidateStage,
  deleteCandidateFromPipeline,
  updateCandidateStatus,
} from "@/services/recruitmentPipelineService";
import { StatusChangeConfirmationDialog } from "@/components/Recruiter-Pipeline/status-change-confirmation-dialog";
import { AddCandidateDialog } from "@/components/Recruiter-Pipeline/add-candidate-dialog";
import { AddExistingCandidateDialog } from "@/components/common/add-existing-candidate-dialog";
import { CreateCandidateDialog, type CreateCandidateValues } from "@/components/Recruiter-Pipeline/create-candidate-dialog";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { validateTempCandidateStageChange, validateTempCandidateStatusChange } from "@/lib/temp-candidate-validation";
import { TempCandidateAlertDialog } from "@/components/Recruiter-Pipeline/temp-candidate-alert-dialog";
import { DisqualificationDialog, type DisqualificationData } from "@/components/Recruiter-Pipeline/disqualification-dialog";
import { PipelineJobHeader } from "@/components/Recruiter-Pipeline/PipelineJobHeader";
import { PipelineStageFilters } from "@/components/Recruiter-Pipeline/PipelineStageFilters";
import { PipelineCandidatesTable } from "@/components/Recruiter-Pipeline/PipelineCandidatesTable";
import { mapEntryToJob } from "@/components/Recruiter-Pipeline/pipeline-mapper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { usePermissions } from "@/contexts/PermissionContext";

const Page = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { hasPermission } = usePermissions();

  const canViewPipeline = isAdmin || hasPermission("pipeline", "view");
  const canModifyPipeline = isAdmin || hasPermission("pipeline", "edit");

  const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Precision Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [isTemp, setIsTemp] = useState<string | null>("all");
  const [addedFrom, setAddedFrom] = useState<Date | undefined>(undefined);
  const [addedTo, setAddedTo] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Search Debouncing (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever any filter condition changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStageFilter, debouncedSearch, currentStatus, priority, isTemp, addedFrom, addedTo, sortBy, sortOrder]);

  const { data: jobResponse, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: [
      "pipelineEntry",
      id,
      currentPage,
      pageSize,
      selectedStageFilter,
      debouncedSearch,
      currentStatus,
      priority,
      isTemp,
      addedFrom,
      addedTo,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getPipelineEntry(id, {
        page: currentPage,
        limit: pageSize,
        stage: selectedStageFilter ? mapUIStageToBackendStage(selectedStageFilter) : undefined,
        search: debouncedSearch || undefined,
        currentStatus: currentStatus || undefined,
        priority: priority || undefined,
        isTemp: isTemp === "all" ? undefined : (isTemp ?? undefined),
        addedFrom: addedFrom ? format(addedFrom, "yyyy-MM-dd") : undefined,
        addedTo: addedTo ? format(addedTo, "yyyy-MM-dd") : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
    enabled: !!id,
  });

  const job = useMemo(() => {
    if (!jobResponse?.data) return null;
    return mapEntryToJob(jobResponse.data);
  }, [jobResponse]);

  // Modals & Dialog states
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  const [stageChangeDialog, setStageChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    currentStage: string;
    newStage: string;
  }>({ isOpen: false, candidate: null, currentStage: "", newStage: "" });

  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string;
  }>({ isOpen: false, candidate: null, newStatus: "" });

  const [deleteCandidateDialog, setDeleteCandidateDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({ isOpen: false, candidate: null });

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    pdfUrl: string | null;
    candidateName: string | null;
  }>({ isOpen: false, pdfUrl: null, candidateName: null });

  const [tempCandidateAlert, setTempCandidateAlert] = useState<{
    isOpen: boolean;
    candidateName: string | null;
    message: string | null;
  }>({ isOpen: false, candidateName: null, message: null });

  const [autoCreateCandidateDialog, setAutoCreateCandidateDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({ isOpen: false, candidate: null });

  const [disqualificationDialog, setDisqualificationDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string;
  }>({ isOpen: false, candidate: null, newStatus: "" });

  // Action Handlers
  const handleAddCandidate = () => {
    const blockedStages = ["Hired", "On Hold", "Closed"];
    const currentStage = job?.jobId?.stage;

    if (currentStage && blockedStages.includes(currentStage)) {
      toast.error(
        `Candidates cannot be added because the job "${job?.title}" is in "${currentStage}" stage.`,
        { duration: 5000 }
      );
      return;
    }

    setIsAddCandidateOpen(true);
  };

  const handleAddExistingCandidate = () => {
    setIsAddCandidateOpen(false);
    setIsAddExistingOpen(true);
  };

  const handleAddNewCandidate = () => {
    setIsAddCandidateOpen(false);
    setIsCreateCandidateOpen(true);
  };

  const handleStageChange = (candidate: Candidate, newStage: string) => {
    if (!canModifyPipeline) return;
    if (candidate.isTempCandidate) {
      const validation = validateTempCandidateStageChange(candidate, newStage);
      if (!validation.canChangeStage) {
        setTempCandidateAlert({
          isOpen: true,
          candidateName: candidate.name,
          message: validation.message || null,
        });
        return;
      }
    }

    setStageChangeDialog({
      isOpen: true,
      candidate,
      currentStage: candidate.currentStage,
      newStage,
    });
  };

  const handleConfirmStageChange = async (data?: Record<string, any>) => {
    if (!stageChangeDialog.candidate || !id) return;
    try {
      const backendStage = mapUIStageToBackendStage(stageChangeDialog.newStage);
      await updateCandidateStage(id, stageChangeDialog.candidate.id, { stage: backendStage, data });
      await queryClient.invalidateQueries({ queryKey: ["pipelineEntry", id] });
      await refetch();
      setStageChangeDialog((prev) => ({ ...prev, isOpen: false }));
      toast.success(`Stage updated to ${stageChangeDialog.newStage}`);
    } catch (err) {
      console.error("Failed to update stage:", err);
      toast.error("Failed to update pipeline stage");
    }
  };

  const handleCancelStageChange = () => {
    setStageChangeDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleStatusChange = (candidate: Candidate, newStatus: string) => {
    if (!canModifyPipeline) return;
    if (candidate.isTempCandidate) {
      const validation = validateTempCandidateStatusChange(candidate, newStatus);
      if (!validation.canChangeStage) {
        setTempCandidateAlert({
          isOpen: true,
          candidateName: candidate.name,
          message: validation.message || null,
        });
        return;
      }

      if (newStatus === "CV Received") {
        setAutoCreateCandidateDialog({
          isOpen: true,
          candidate,
        });
        return;
      }
    }

    if (newStatus === "Disqualified") {
      setDisqualificationDialog({ isOpen: true, candidate, newStatus });
    } else {
      setStatusChangeDialog({ isOpen: true, candidate, newStatus });
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeDialog.candidate || !id) return;
    try {
      await updateCandidateStatus(id, statusChangeDialog.candidate.id, {
        status: statusChangeDialog.newStatus,
      });
      await queryClient.invalidateQueries({ queryKey: ["pipelineEntry", id] });
      await refetch();
      setStatusChangeDialog((prev) => ({ ...prev, isOpen: false }));
      toast.success(`Status updated to ${statusChangeDialog.newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update candidate status");
    }
  };

  const handleCancelStatusChange = () => {
    setStatusChangeDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    if (!canModifyPipeline) return;
    setDeleteCandidateDialog({ isOpen: true, candidate });
  };

  const handleConfirmDeleteCandidate = async () => {
    if (!deleteCandidateDialog.candidate || !id) return;
    try {
      await deleteCandidateFromPipeline(id, deleteCandidateDialog.candidate.id);
      await queryClient.invalidateQueries({ queryKey: ["pipelineEntry", id] });
      await refetch();
      setDeleteCandidateDialog({ isOpen: false, candidate: null });
      toast.success("Candidate removed from pipeline");
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      toast.error("Failed to remove candidate");
    }
  };

  const handleCancelDeleteCandidate = () => {
    setDeleteCandidateDialog({ isOpen: false, candidate: null });
  };

  const handleViewResume = (candidate: Candidate) => {
    if (candidate.resume) {
      setPdfViewer({
        isOpen: true,
        pdfUrl: candidate.resume,
        candidateName: candidate.name,
      });
    }
  };

  const handleClosePdfViewer = () => {
    setPdfViewer({ isOpen: false, pdfUrl: null, candidateName: null });
  };

  const handleCloseTempCandidateAlert = () => {
    setTempCandidateAlert({ isOpen: false, candidateName: null, message: null });
  };

  const handleCreateCandidateSubmit = async (_values: CreateCandidateValues) => {
    setIsCreateCandidateOpen(false);
    await refetch();
  };

  const handleAutoCreateCandidateSubmit = async () => {
    setAutoCreateCandidateDialog({ isOpen: false, candidate: null });
    await refetch();
  };

  const handleCloseAutoCreateDialog = () => {
    setAutoCreateCandidateDialog({ isOpen: false, candidate: null });
  };

  const handleConfirmDisqualification = async (data: DisqualificationData) => {
    if (!disqualificationDialog.candidate || !id) return;
    try {
      await updateCandidateStatus(id, disqualificationDialog.candidate.id, {
        status: "Disqualified",
        data: data,
      });
      await queryClient.invalidateQueries({ queryKey: ["pipelineEntry", id] });
      await refetch();
      setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: "" });
      toast.success("Candidate disqualified successfully");
    } catch (err) {
      console.error("Failed to disqualify candidate:", err);
      toast.error("Failed to disqualify candidate");
    }
  };

  const handleCloseDisqualificationDialog = () => {
    setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: "" });
  };

  const clearAllFilters = () => {
    setSelectedStageFilter(null);
    setSearch("");
    setCurrentStatus(null);
    setPriority(null);
    setIsTemp("all");
    setAddedFrom(undefined);
    setAddedTo(undefined);
    setSortBy("lastUpdated");
    setSortOrder("desc");
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedStageFilter !== null ||
      search !== "" ||
      currentStatus !== null ||
      priority !== null ||
      (isTemp !== null && isTemp !== "all") ||
      addedFrom !== undefined ||
      addedTo !== undefined
    );
  }, [selectedStageFilter, search, currentStatus, priority, isTemp, addedFrom, addedTo]);

  const pagination = useMemo(() => {
    return jobResponse?.data?.candidates?.pagination || jobResponse?.data?.pagination;
  }, [jobResponse]);

  const paginatedCandidates = useMemo(() => {
    return job?.candidates || [];
  }, [job?.candidates]);

  const totalCandidatesCount = useMemo(() => {
    if (pagination) {
      return pagination.total ?? pagination.totalCandidates ?? pagination.totalItems ?? 0;
    }
    return selectedStageFilter
      ? (job?.stageCounts?.[selectedStageFilter] || 0)
      : (job?.totalCandidates || 0);
  }, [pagination, job?.stageCounts, job?.totalCandidates, selectedStageFilter]);

  const totalPages = useMemo(() => {
    if (pagination) {
      return pagination.totalPages ?? pagination.pages ?? (Math.ceil(totalCandidatesCount / pageSize) || 1);
    }
    return Math.ceil(totalCandidatesCount / pageSize) || 1;
  }, [pagination, totalCandidatesCount, pageSize]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4.25rem)] w-full gap-3">
        <div className="p-4 rounded-xl bg-card shadow-md border border-border flex items-center gap-3 animate-in zoom-in-95 duration-300">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
          <span className="text-xs font-semibold text-muted-foreground">Loading recruitment pipeline...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4.25rem)] w-full gap-4 p-4">
        <div className="p-6 rounded-xl bg-card shadow-md border border-border text-center max-w-md">
          <FilterX className="h-10 w-10 text-destructive/50 mx-auto mb-3" />
          <h2 className="text-base font-bold text-foreground mb-1">Pipeline Unavailable</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {(error as any)?.message || "The requested recruitment pipeline could not be loaded."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="w-full rounded-lg text-xs font-semibold"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Recruitment Pipelines
          </Button>
        </div>
      </div>
    );
  }

  if (!canViewPipeline) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4.25rem)] w-full gap-3 text-center p-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-1">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-base font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          You do not have permission to view this pipeline. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col h-[calc(100vh-4.25rem)] w-full overflow-hidden bg-[hsl(var(--protected-bg))] p-2 md:p-2.5 gap-2">
        {/* Section 1: Executive Job Header */}
        <div className="flex-shrink-0 bg-card rounded-xl border border-border shadow-xs overflow-hidden">
          <PipelineJobHeader job={job} onAddCandidate={handleAddCandidate} />
        </div>

        {/* Section 2: Stage Funnel Ribbon & Precision Filter Toolbar */}
        <div className="flex-shrink-0 bg-card rounded-xl border border-border shadow-xs p-2.5 flex flex-col gap-2">
          <PipelineStageFilters
            job={job}
            selectedStage={selectedStageFilter}
            onSelectStage={setSelectedStageFilter}
          />

          <div className="border-t border-border/60" />

          {/* Precision Filter Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                placeholder="Search candidate name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-7 h-8 text-xs border-border bg-muted/20 focus-visible:ring-brand rounded-lg font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={currentStatus || "all"}
              onValueChange={(val) => setCurrentStatus(val === "all" ? null : val)}
            >
              <SelectTrigger className="h-8 w-[120px] rounded-lg text-xs font-medium border-border bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Statuses</SelectItem>
                {["Pending", "In Progress", "Completed", "Hired", "Disqualified", "On Hold", "Cancelled", "Rescheduled"].map((st) => (
                  <SelectItem key={st} value={st} className="rounded-lg text-xs font-medium">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={priority || "all"}
              onValueChange={(val) => setPriority(val === "all" ? null : val)}
            >
              <SelectTrigger className="h-8 w-[115px] rounded-lg text-xs font-medium border-border bg-card">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Priorities</SelectItem>
                {["High", "Medium", "Low"].map((prio) => (
                  <SelectItem key={prio} value={prio} className="rounded-lg text-xs font-medium">
                    {prio} Priority
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Candidate Type */}
            <Select value={isTemp || "all"} onValueChange={(val) => setIsTemp(val)}>
              <SelectTrigger className="h-8 w-[125px] rounded-lg text-xs font-medium border-border bg-card">
                <SelectValue placeholder="Candidate Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Types</SelectItem>
                <SelectItem value="false" className="rounded-lg text-xs font-medium">Real Candidates</SelectItem>
                <SelectItem value="true" className="rounded-lg text-xs font-medium">Temp Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filters: From Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left text-xs font-medium border-border bg-card rounded-lg px-2.5",
                    !addedFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {addedFrom ? format(addedFrom, "MMM dd, yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-lg" align="start">
                <Calendar
                  mode="single"
                  selected={addedFrom}
                  onSelect={setAddedFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Date Filters: To Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left text-xs font-medium border-border bg-card rounded-lg px-2.5",
                    !addedTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {addedTo ? format(addedTo, "MMM dd, yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-lg" align="start">
                <Calendar
                  mode="single"
                  selected={addedTo}
                  onSelect={setAddedTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Sort & Order Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                <SelectTrigger className="h-8 w-[140px] rounded-lg text-xs font-medium border-border bg-card">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="lastUpdated" className="rounded-lg text-xs font-medium">Recently Updated</SelectItem>
                  <SelectItem value="addedAt" className="rounded-lg text-xs font-medium">Recently Added</SelectItem>
                  <SelectItem value="name" className="rounded-lg text-xs font-medium">Candidate Name</SelectItem>
                  <SelectItem value="priority" className="rounded-lg text-xs font-medium">Priority</SelectItem>
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="h-8 w-8 rounded-lg border-border hover:bg-muted shrink-0"
                  >
                    {sortOrder === "desc" ? (
                      <ArrowDownWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ArrowUpWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="rounded-lg bg-card border border-border text-foreground font-medium text-xs shadow-md p-1.5">
                  <span>{sortOrder === "desc" ? "Sort Descending" : "Sort Ascending"}</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Active Chips Panel (if filters applied) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">Active:</span>

              {selectedStageFilter && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-brand/10 text-brand border border-brand/20 flex items-center gap-1">
                  Stage: {selectedStageFilter}
                  <button onClick={() => setSelectedStageFilter(null)} className="rounded-full p-0.5 hover:bg-brand/20 text-brand transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {search && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  Search: &quot;{search}&quot;
                  <button onClick={() => setSearch("")} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {currentStatus && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  Status: {currentStatus}
                  <button onClick={() => setCurrentStatus(null)} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {priority && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  Priority: {priority}
                  <button onClick={() => setPriority(null)} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {isTemp && isTemp !== "all" && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  Type: {isTemp === "true" ? "Temp Only" : "Real Only"}
                  <button onClick={() => setIsTemp("all")} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {addedFrom && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  From: {format(addedFrom, "MMM dd, yyyy")}
                  <button onClick={() => setAddedFrom(undefined)} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {addedTo && (
                <Badge variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border flex items-center gap-1">
                  To: {format(addedTo, "MMM dd, yyyy")}
                  <button onClick={() => setAddedTo(undefined)} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-[11px] font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md ml-auto"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Section 3: Candidates Table Area */}
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
          {/* Subheader info bar */}
          <div className="px-3 py-1.5 bg-muted/20 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Current View:</span>
              <Badge variant="outline" className="text-xs font-semibold border-brand/30 text-brand bg-brand/5 px-2 py-0.5">
                {selectedStageFilter ? selectedStageFilter : "All Pipeline Stages"}
              </Badge>
              {isFetching && <Loader2 className="h-3 w-3 animate-spin text-brand" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                <strong className="text-foreground">{totalCandidatesCount}</strong> candidate{totalCandidatesCount === 1 ? "" : "s"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Refresh candidates"
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto relative custom-scrollbar">
            <PipelineCandidatesTable
              job={job}
              candidates={paginatedCandidates}
              onStageChange={handleStageChange}
              onStatusChange={handleStatusChange}
              onViewResume={handleViewResume}
              onDeleteCandidate={handleDeleteCandidate}
            />
          </div>

          {/* Compact ATS Pagination Footer */}
          {totalCandidatesCount > 0 && (
            <div className="flex-shrink-0 border-t border-border bg-card px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              {/* Left: Summary & Page Size */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>
                  Showing {totalCandidatesCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{" "}
                  {Math.min(currentPage * pageSize, totalCandidatesCount)} of {totalCandidatesCount}
                </span>

                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span>Show</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[60px] rounded-md border-border bg-transparent text-xs font-semibold px-2 py-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {[15, 30, 50, 100].map((size) => (
                        <SelectItem key={size} value={String(size)} className="rounded-lg text-xs font-semibold">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Pagination Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                {/* Numbered Page Buttons */}
                {(() => {
                  const pages: (number | string)[] = [];
                  const maxVisible = 5;

                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                    }
                  }

                  return pages.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-xs font-semibold text-muted-foreground">
                          ...
                        </span>
                      );
                    }

                    const isCurrent = page === currentPage;
                    return (
                      <Button
                        key={`page-${page}`}
                        variant={isCurrent ? "default" : "outline"}
                        className={cn(
                          "h-7 w-7 rounded-md text-xs font-semibold p-0 border-border transition-all",
                          isCurrent
                            ? "bg-brand hover:bg-brand/90 text-white shadow-xs border-brand"
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => setCurrentPage(page as number)}
                      >
                        {page}
                      </Button>
                    );
                  });
                })()}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Overlays */}
      {stageChangeDialog.isOpen && (
        <StatusChangeConfirmationDialog
          isOpen={stageChangeDialog.isOpen}
          onClose={handleCancelStageChange}
          onConfirm={handleConfirmStageChange}
          candidateName={stageChangeDialog.candidate?.name || ""}
          currentStage={stageChangeDialog.currentStage}
          newStage={stageChangeDialog.newStage}
          candidate={stageChangeDialog.candidate}
        />
      )}

      {isAddCandidateOpen && (
        <AddCandidateDialog
          open={isAddCandidateOpen}
          onOpenChange={setIsAddCandidateOpen}
          onAddExisting={handleAddExistingCandidate}
          onAddNew={handleAddNewCandidate}
          jobTitle={job.title}
        />
      )}

      {isAddExistingOpen && (
        <AddExistingCandidateDialog
          jobId={job.id}
          jobTitle={job.title}
          open={isAddExistingOpen}
          onOpenChange={setIsAddExistingOpen}
          isPipeline={true}
          pipelineId={job.id}
          onCandidatesAdded={async () => {
            await refetch();
          }}
        />
      )}

      {isCreateCandidateOpen && (
        <CreateCandidateDialog
          open={isCreateCandidateOpen}
          onOpenChange={setIsCreateCandidateOpen}
          pipelineId={job.id}
          onSubmit={handleCreateCandidateSubmit}
        />
      )}

      {deleteCandidateDialog.isOpen && (
        <Dialog
          open={deleteCandidateDialog.isOpen}
          onOpenChange={(open) => setDeleteCandidateDialog((prev) => ({ ...prev, isOpen: open }))}
        >
          <DialogContent className="rounded-xl border-border shadow-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold text-foreground text-base">Remove Candidate</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove <strong className="text-foreground">{deleteCandidateDialog.candidate?.name}</strong> from this pipeline? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelDeleteCandidate}
                className="rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteCandidate}
                className="rounded-lg text-xs font-semibold"
              >
                Remove Candidate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {pdfViewer.isOpen && (
        <PDFViewer
          isOpen={pdfViewer.isOpen}
          onClose={handleClosePdfViewer}
          pdfUrl={pdfViewer.pdfUrl || undefined}
          candidateName={pdfViewer.candidateName || undefined}
        />
      )}

      {statusChangeDialog.isOpen && (
        <Dialog
          open={statusChangeDialog.isOpen}
          onOpenChange={(isOpen) => !isOpen && setStatusChangeDialog((prev) => ({ ...prev, isOpen: false }))}
        >
          <DialogContent className="rounded-xl border-border shadow-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold text-foreground text-base">Confirm Status Update</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Confirm changing the status of <strong className="text-foreground">{statusChangeDialog.candidate?.name}</strong> to <strong className="text-brand">{statusChangeDialog.newStatus}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelStatusChange}
                className="rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmStatusChange}
                className="bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirm Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {tempCandidateAlert.isOpen && (
        <TempCandidateAlertDialog
          isOpen={tempCandidateAlert.isOpen}
          onClose={handleCloseTempCandidateAlert}
          candidateName={tempCandidateAlert.candidateName || undefined}
          message={tempCandidateAlert.message || undefined}
        />
      )}

      {autoCreateCandidateDialog.isOpen && (
        <CreateCandidateModal
          isOpen={autoCreateCandidateDialog.isOpen}
          onClose={handleCloseAutoCreateDialog}
          onCandidateCreated={handleAutoCreateCandidateSubmit}
          tempCandidateData={
            autoCreateCandidateDialog.candidate
              ? {
                  name: autoCreateCandidateDialog.candidate.name,
                  email: autoCreateCandidateDialog.candidate.email,
                  phone: autoCreateCandidateDialog.candidate.phone,
                  location: autoCreateCandidateDialog.candidate.location,
                  description: autoCreateCandidateDialog.candidate.description,
                  gender: autoCreateCandidateDialog.candidate.gender,
                  dateOfBirth: autoCreateCandidateDialog.candidate.dateOfBirth,
                  country: autoCreateCandidateDialog.candidate.country,
                  nationality: autoCreateCandidateDialog.candidate.nationality,
                  willingToRelocate: autoCreateCandidateDialog.candidate.willingToRelocate,
                }
              : undefined
          }
          isTempCandidateConversion={true}
          pipelineId={id}
          tempCandidateId={autoCreateCandidateDialog.candidate?.id}
        />
      )}

      {disqualificationDialog.isOpen && (
        <DisqualificationDialog
          isOpen={disqualificationDialog.isOpen}
          onClose={handleCloseDisqualificationDialog}
          onConfirm={handleConfirmDisqualification}
          candidateName={disqualificationDialog.candidate?.name || ""}
          currentStage={disqualificationDialog.candidate?.currentStage || ""}
          currentStageStatus={disqualificationDialog.candidate?.status || ""}
        />
      )}
    </TooltipProvider>
  );
};

export default Page;
