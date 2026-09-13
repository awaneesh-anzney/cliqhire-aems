"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FilterX, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Briefcase, 
  MapPin, 
  Calendar, 
  RefreshCw,
  Building2,
  LayoutGrid,
  TableProperties,
  Kanban,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Flame,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineJobCard } from "./pipeline-job-card";
import { PipelineTableView } from "./PipelineTableView";
import { PipelineBoardView } from "./PipelineBoardView";
import { CreatePipelineDialog } from "./create-pipeline-dialog";
import { type Job } from "./dummy-data";
import { convertPipelineListDataToJob } from "./utils/convert";
import { useAuth } from "@/contexts/AuthContext";
import { getAllPipelineEntries, deleteBulkPipelines } from "@/services/recruitmentPipelineService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RecruiterPipeline() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN";

  const canViewPipeline = isAdmin || hasPermission("pipeline", "view");
  const canModifyPipeline = isAdmin || hasPermission("pipeline", "create") || hasPermission("pipeline", "edit");
  const canDeletePipeline = isAdmin || hasPermission("pipeline", "delete") || (user as any)?.role?.permissions?.pipeline?.delete === true;

  // View mode: cards | table | board (Default: table)
  const [viewMode, setViewMode] = useState<"cards" | "table" | "board">("table");

  // Primary filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  // Advanced filters toggle & states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobType, setJobType] = useState("all");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [minCandidates, setMinCandidates] = useState("");
  const [maxCandidates, setMaxCandidates] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  // Sort states
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced filters state
  const [debouncedParams, setDebouncedParams] = useState<any>({
    search: "",
    location: "",
    clientName: "",
    minCandidates: undefined,
    maxCandidates: undefined,
    createdFrom: "",
    createdTo: "",
  });

  // Debounce text inputs to avoid API spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams({
        search,
        location,
        clientName,
        minCandidates: minCandidates ? parseInt(minCandidates, 10) : undefined,
        maxCandidates: maxCandidates ? parseInt(maxCandidates, 10) : undefined,
        createdFrom,
        createdTo,
      });
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, location, clientName, minCandidates, maxCandidates, createdFrom, createdTo]);

  // Instantly reset page on select changes
  useEffect(() => {
    setCurrentPage(1);
  }, [status, priority, jobType, sortBy, sortOrder, pageSize]);

  const { data: listResponse, isLoading: listLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "pipelineEntries",
      user?._id,
      currentPage,
      pageSize,
      status,
      priority,
      jobType,
      sortBy,
      sortOrder,
      debouncedParams,
    ],
    queryFn: async () => {
      return await getAllPipelineEntries({
        page: currentPage,
        limit: pageSize,
        search: debouncedParams.search || undefined,
        status: status !== "all" ? status : undefined,
        priority: priority !== "all" ? priority : undefined,
        jobType: jobType !== "all" ? jobType : undefined,
        location: debouncedParams.location || undefined,
        clientName: debouncedParams.clientName || undefined,
        minCandidates: debouncedParams.minCandidates,
        maxCandidates: debouncedParams.maxCandidates,
        createdFrom: debouncedParams.createdFrom || undefined,
        createdTo: debouncedParams.createdTo || undefined,
        sortBy,
        sortOrder,
        isAdmin,
      });
    },
    enabled: !!user,
  });

  const renderJobs: Job[] = useMemo(() => {
    return (listResponse?.data?.pipelines || []).map((p: any) => convertPipelineListDataToJob(p, false));
  }, [listResponse]);

  const totalItems = listResponse?.data?.pagination?.total || listResponse?.data?.pagination?.totalPipelines || 0;
  const totalPages = listResponse?.data?.pagination?.totalPages || 1;
  const currentPageRes = listResponse?.data?.pagination?.currentPage || 1;
  const hasNextPage = listResponse?.data?.pagination?.hasNextPage;
  const hasPrevPage = listResponse?.data?.pagination?.hasPrevPage;

  // Compute live intelligence KPI stats from current pipelines
  const kpiStats = useMemo(() => {
    let activePipelines = 0;
    let totalTalent = 0;
    let interviewCount = 0;
    let hiredCount = 0;

    renderJobs.forEach((job) => {
      const pStatus = (job.pipelineStatus || job.jobId?.stage || "").toLowerCase();
      if (pStatus === "active" || pStatus === "open") {
        activePipelines += 1;
      }
      const stageCounts = job.stageCounts || {};
      totalTalent += job.totalCandidates ?? stageCounts.total ?? 0;
      interviewCount += (stageCounts.interview || 0) + (stageCounts.clientScreening || 0);
      hiredCount += (stageCounts.hired || 0) + (stageCounts.onboarding || 0);
    });

    return {
      activePipelines,
      totalTalent,
      interviewCount,
      hiredCount,
    };
  }, [renderJobs]);

  const handleSelectPipeline = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPipelines((prev) => [...prev, id]);
    } else {
      setSelectedPipelines((prev) => prev.filter((pId) => pId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPipelines(renderJobs.map((j) => j.id));
    } else {
      setSelectedPipelines([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedPipelines.length) return;
    setIsDeleting(true);
    try {
      await deleteBulkPipelines(selectedPipelines);
      toast.success(`${selectedPipelines.length} pipeline(s) removed successfully`);
      setSelectedPipelines([]);
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete pipelines");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Active filter chip management
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    if (search) chips.push({ key: "search", label: `Search: "${search}"`, clear: () => setSearch("") });
    if (status && status !== "all") chips.push({ key: "status", label: `Status: ${status}`, clear: () => setStatus("all") });
    if (priority && priority !== "all") chips.push({ key: "priority", label: `Priority: ${priority}`, clear: () => setPriority("all") });
    if (jobType && jobType !== "all") chips.push({ key: "jobType", label: `Type: ${jobType}`, clear: () => setJobType("all") });
    if (location) chips.push({ key: "location", label: `Location: "${location}"`, clear: () => setLocation("") });
    if (clientName) chips.push({ key: "clientName", label: `Client: "${clientName}"`, clear: () => setClientName("") });
    if (minCandidates) chips.push({ key: "minCandidates", label: `Min Candidates: ${minCandidates}`, clear: () => setMinCandidates("") });
    if (maxCandidates) chips.push({ key: "maxCandidates", label: `Max Candidates: ${maxCandidates}`, clear: () => setMaxCandidates("") });
    if (createdFrom) chips.push({ key: "createdFrom", label: `From: ${createdFrom}`, clear: () => setCreatedFrom("") });
    if (createdTo) chips.push({ key: "createdTo", label: `To: ${createdTo}`, clear: () => setCreatedTo("") });
    return chips;
  }, [search, status, priority, jobType, location, clientName, minCandidates, maxCandidates, createdFrom, createdTo]);

  const handleClearAll = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setJobType("all");
    setLocation("");
    setClientName("");
    setMinCandidates("");
    setMaxCandidates("");
    setCreatedFrom("");
    setCreatedTo("");
  };

  const advancedFiltersCount = [
    jobType !== "all",
    !!location,
    !!clientName,
    !!minCandidates,
    !!maxCandidates,
    !!createdFrom,
    !!createdTo,
  ].filter(Boolean).length;

  if (!canViewPipeline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <div className="p-5 rounded-2xl bg-destructive/10 text-destructive shadow-sm">
          <FilterX className="w-10 h-10" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Access Restricted</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            You do not have the required permissions to view recruitment pipelines. Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      
      {/* 1. Header & Command Bar */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-border bg-gradient-to-b from-card to-muted/15 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-foreground tracking-tight">
                  Recruiter Pipelines
                </h1>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live Synced" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Talent pipeline command center & active requisition tracking
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap self-end md:self-auto">
          {/* Multi-Delete Action */}
          {canDeletePipeline && selectedPipelines.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setIsDeleteDialogOpen(true)} 
              className="h-8 px-2.5 rounded-lg flex items-center shadow-xs font-bold text-xs transition-all active:scale-95 animate-in fade-in"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete ({selectedPipelines.length})
            </Button>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all",
                viewMode === "table" 
                  ? "bg-card text-brand shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Dense Table View"
            >
              <TableProperties className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all",
                viewMode === "cards" 
                  ? "bg-card text-brand shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all",
                viewMode === "board" 
                  ? "bg-card text-brand shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Funnel Stage Board View"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Funnel</span>
            </button>
          </div>

          {/* Sync Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2.5 rounded-lg border-border hover:bg-muted font-bold text-xs shadow-2xs flex items-center gap-1"
            title="Refresh Data"
          >
            <RefreshCw className={cn("h-3 w-3 text-muted-foreground", isFetching && "animate-spin text-brand")} />
            <span className="hidden sm:inline">Sync</span>
          </Button>

          {/* "+ Launch Pipeline" Button */}
          {canModifyPipeline && (
            <CreatePipelineDialog
              trigger={
                <Button
                  size="sm"
                  className="h-8 px-3 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-sm shadow-brand/20 flex items-center gap-1.5 transition-all active:scale-98"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Launch Pipeline</span>
                </Button>
              }
              onPipelineCreated={() => {
                refetch();
                queryClient.invalidateQueries({ queryKey: ["pipelineEntries"] });
              }}
            />
          )}
        </div>
      </div>

      {/* 2. Pipeline Intelligence KPI Banner */}
      <div className="flex-shrink-0 px-4 py-2 bg-muted/20 border-b border-border/80 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Metric 1: Active Pipelines */}
        <div 
          onClick={() => setStatus("Active")}
          className="group relative flex items-center p-2 rounded-lg bg-card border border-border hover:border-brand/30 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="p-2 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 mr-2.5 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Active Requisitions</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-foreground">{kpiStats.activePipelines}</span>
              <span className="text-[9.5px] text-muted-foreground">of {totalItems} total</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Candidates */}
        <div className="group relative flex items-center p-2 rounded-lg bg-card border border-border hover:border-brand/30 hover:shadow-xs transition-all">
          <div className="p-2 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 mr-2.5 shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Talent in Process</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-foreground">{kpiStats.totalTalent}</span>
              <span className="text-[9.5px] text-muted-foreground">candidates</span>
            </div>
          </div>
        </div>

        {/* Metric 3: In Review & Interviews */}
        <div className="group relative flex items-center p-2 rounded-lg bg-card border border-border hover:border-brand/30 hover:shadow-xs transition-all">
          <div className="p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 mr-2.5 shrink-0">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Review & Interviews</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-foreground">{kpiStats.interviewCount}</span>
              <span className="text-[9.5px] text-muted-foreground">in evaluation</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Placements & Hired */}
        <div 
          onClick={() => setStatus("Hired")}
          className="group relative flex items-center p-2 rounded-lg bg-card border border-border hover:border-brand/30 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 mr-2.5 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">Hired & Onboarding</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-foreground">{kpiStats.hiredCount}</span>
              <span className="text-[9.5px] text-emerald-600 font-bold">placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Unified Search & Precision Filter Toolbar */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-2 flex flex-col gap-2 transition-all">
        {/* Main Row: Search + Quick Selects + Sort + Filter Drawer Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Omni Search Box */}
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
            </div>
            <Input
              placeholder="Search by Requisition title, Job ID (e.g. JOB-102), Client, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-8 bg-muted/25 border-border rounded-lg text-xs font-medium text-foreground placeholder:text-muted-foreground focus:bg-card focus:ring-2 focus:ring-brand/10 focus:border-brand/30 transition-all shadow-2xs w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {listLoading && !search && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-3.5 w-3.5 text-brand animate-spin" />
              </div>
            )}
          </div>

          {/* Quick Select Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="w-full lg:w-36">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/20 border-border rounded-lg shadow-2xs">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-muted-foreground font-medium italic">Status: All</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Dropdown */}
            <div className="w-full lg:w-36">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/20 border-border rounded-lg shadow-2xs">
                  <SelectValue placeholder="Priority: All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-muted-foreground font-medium italic">Priority: All</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Select */}
            <div className="w-full lg:w-44">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/20 border-border rounded-lg shadow-2xs">
                  <span className="text-muted-foreground mr-1 font-normal">Sort:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Recently Updated</SelectItem>
                  <SelectItem value="totalCandidates">Candidate Volume</SelectItem>
                  <SelectItem value="jobTitle">Job Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Direction & Advanced Filters Toggle */}
            <div className="flex items-center gap-2 w-full col-span-2 sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="h-9 px-2.5 rounded-lg border-border hover:bg-muted shadow-2xs"
                title={sortOrder === "desc" ? "Sort Descending" : "Sort Ascending"}
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{sortOrder}</span>
              </Button>

              <Button
                variant={showAdvanced ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "h-9 px-3 rounded-lg border-border shadow-2xs font-bold text-xs flex items-center gap-1.5 flex-1 sm:flex-initial",
                  showAdvanced 
                    ? "bg-brand text-white border-brand hover:bg-brand/90" 
                    : "bg-card text-foreground hover:bg-muted"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {advancedFiltersCount > 0 && (
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold",
                    showAdvanced ? "bg-white text-brand" : "bg-brand text-white"
                  )}>
                    {advancedFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="p-4 rounded-xl border border-border bg-muted/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Job Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employment Type</label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="h-8.5 text-xs font-semibold bg-card border-border rounded-lg">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-muted-foreground italic font-medium">All Types</SelectItem>
                  <SelectItem value="Full Time">Full-time</SelectItem>
                  <SelectItem value="Part Time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Name</label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by client..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="City, region, or remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg"
                />
              </div>
            </div>

            {/* Candidate Counts Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Candidate Volume Range</label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minCandidates}
                  onChange={(e) => setMinCandidates(e.target.value)}
                  className="h-8.5 text-xs font-medium bg-card border-border rounded-lg text-center"
                />
                <span className="text-[10px] text-muted-foreground font-semibold">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxCandidates}
                  onChange={(e) => setMaxCandidates(e.target.value)}
                  className="h-8.5 text-xs font-medium bg-card border-border rounded-lg text-center"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Creation Date Range</label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg w-full"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">to</span>
                <div className="relative w-full">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-muted-foreground mr-1">Active Filters:</span>
            {activeChips.map((chip) => (
              <div 
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/5 border border-brand/20 text-[10px] font-bold text-brand shadow-2xs"
              >
                <span>{chip.label}</span>
                <button 
                  onClick={chip.clear}
                  className="rounded-full hover:bg-brand/15 p-0.5 text-brand transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="h-6 px-2 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full ml-auto"
            >
              Reset All
            </Button>
          </div>
        )}
      </div>

      {/* Summary Strip */}
      <div className="flex-shrink-0 bg-muted/25 px-4 py-1.5 border-b border-border flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Found {totalItems} recruitment pipelines</span>
          {isFetching && <Loader2 className="h-3 w-3 text-brand animate-spin" />}
        </div>
        {selectedPipelines.length > 0 && (
          <span className="text-brand font-black">{selectedPipelines.length} selected</span>
        )}
      </div>

      {/* 4. Main Pipeline Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-muted/10">
        {listLoading && renderJobs.length === 0 ? (
          /* Skeleton Loading Cards */
          <div className="grid grid-cols-1 gap-2.5 w-full">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3 rounded-xl border border-border bg-card animate-pulse flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-44 bg-muted rounded" />
                      <div className="h-2.5 w-28 bg-muted/70 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded-full" />
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full mt-1" />
              </div>
            ))}
          </div>
        ) : renderJobs.length > 0 ? (
          /* Render Active View Mode */
          viewMode === "cards" ? (
            <div className="flex flex-col gap-2 w-full">
              {renderJobs.map((job: Job) => (
                <PipelineJobCard
                  key={job.id}
                  job={job}
                  showCheckbox={canDeletePipeline}
                  isSelected={selectedPipelines.includes(job.id)}
                  onSelect={(checked) => handleSelectPipeline(job.id, checked)}
                />
              ))}
            </div>
          ) : viewMode === "table" ? (
            <PipelineTableView
              jobs={renderJobs}
              selectedPipelines={selectedPipelines}
              onSelectPipeline={handleSelectPipeline}
              onSelectAll={handleSelectAll}
              showCheckbox={canDeletePipeline}
            />
          ) : (
            <PipelineBoardView
              jobs={renderJobs}
              selectedPipelines={selectedPipelines}
              onSelectPipeline={handleSelectPipeline}
            />
          )
        ) : (
          /* Thoughtful Empty State */
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6 bg-card rounded-xl border border-border shadow-2xs max-w-md mx-auto my-6">
            <div className="p-3.5 rounded-full bg-muted/40 border border-border shadow-2xs">
              <FilterX className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-xs font-black text-foreground tracking-tight">No Pipelines Found</h3>
              <p className="text-[11px] font-medium text-muted-foreground">
                No recruitment pipelines matched your search or filters. You can adjust the parameters or launch a new pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {activeChips.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll} 
                  className="h-8 px-3 rounded-lg font-bold text-xs border-border shadow-2xs"
                >
                  Reset Filters
                </Button>
              )}
              {canModifyPipeline && (
                <CreatePipelineDialog
                  trigger={
                    <Button 
                      size="sm" 
                      className="h-8 px-3 rounded-lg font-bold text-xs bg-brand hover:bg-brand/90 text-white shadow-2xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Launch Pipeline
                    </Button>
                  }
                  onPipelineCreated={() => {
                    refetch();
                    queryClient.invalidateQueries({ queryKey: ["pipelineEntries"] });
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Pagination Footer Controls */}
      <div className="flex-shrink-0 bg-card border-t border-border px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          {/* Left: Records and Page size */}
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md bg-muted/50 border border-border flex items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1.5">Page</span>
              <span className="text-xs font-black text-foreground">{currentPageRes}</span>
              <span className="text-xs font-semibold text-muted-foreground mx-1">/</span>
              <span className="text-xs font-semibold text-muted-foreground">{totalPages}</span>
            </div>

            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {totalItems} total requisitions
            </span>

            {/* Page Size Select */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <span className="text-[10px] uppercase font-bold text-muted-foreground hidden md:inline">Show:</span>
              <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                <SelectTrigger className="h-7 text-xs font-bold bg-muted/30 border-border rounded-md w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right: Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!hasPrevPage || listLoading}
              className="h-8 px-3 rounded-lg border-border font-bold text-xs text-foreground hover:bg-muted disabled:opacity-40 shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={!hasNextPage || listLoading}
              className="h-8 px-3 rounded-lg border-border font-bold text-xs text-foreground hover:bg-muted disabled:opacity-40 shadow-2xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* 6. Bulk Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-border shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-foreground">Confirm Pipeline Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-semibold text-muted-foreground">
              Are you sure you want to permanently delete {selectedPipelines.length} recruitment pipeline(s)? 
              All candidate tracking associations within these pipelines will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-xs font-bold border border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSelected} 
              disabled={isDeleting} 
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl text-xs font-bold"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
