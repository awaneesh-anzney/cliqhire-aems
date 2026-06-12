"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  FilterX, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Briefcase, 
  MapPin, 
  Calendar, 
  User, 
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp
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
import { PipelineJobCard } from "./pipeline-job-card";
import { type Job } from "./dummy-data";
import { convertPipelineListDataToJob } from "./utils/convert";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAllPipelineEntries, deleteBulkPipelines } from "@/services/recruitmentPipelineService";
import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";

export function RecruiterPipeline() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';

  const canViewPipeline = isAdmin || hasPermission('pipeline', 'view');
  const canDeletePipeline = isAdmin || hasPermission('pipeline', 'delete') || (user as any)?.role?.permissions?.pipeline?.delete === true;

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
  const [pageSize] = useState(10);
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    }, 450);

    return () => clearTimeout(timer);
  }, [search, location, clientName, minCandidates, maxCandidates, createdFrom, createdTo]);

  // Instantly reset page on select changes
  useEffect(() => {
    setCurrentPage(1);
  }, [status, priority, jobType, sortBy, sortOrder]);

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

  const handleSelectPipeline = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPipelines(prev => [...prev, id]);
    } else {
      setSelectedPipelines(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedPipelines.length) return;
    try {
      await deleteBulkPipelines(selectedPipelines);
      setSelectedPipelines([]);
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to delete pipelines');
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  // Active filter chip management
  const activeChips = [];
  if (search) activeChips.push({ key: "search", label: `Search: "${search}"`, clear: () => setSearch("") });
  if (status && status !== "all") activeChips.push({ key: "status", label: `Status: ${status}`, clear: () => setStatus("all") });
  if (priority && priority !== "all") activeChips.push({ key: "priority", label: `Priority: ${priority}`, clear: () => setPriority("all") });
  if (jobType && jobType !== "all") activeChips.push({ key: "jobType", label: `Job Type: ${jobType}`, clear: () => setJobType("all") });
  if (location) activeChips.push({ key: "location", label: `Location: "${location}"`, clear: () => setLocation("") });
  if (clientName) activeChips.push({ key: "clientName", label: `Client: "${clientName}"`, clear: () => setClientName("") });
  if (minCandidates) activeChips.push({ key: "minCandidates", label: `Min Candidates: ${minCandidates}`, clear: () => setMinCandidates("") });
  if (maxCandidates) activeChips.push({ key: "maxCandidates", label: `Max Candidates: ${maxCandidates}`, clear: () => setMaxCandidates("") });
  if (createdFrom) activeChips.push({ key: "createdFrom", label: `From: ${createdFrom}`, clear: () => setCreatedFrom("") });
  if (createdTo) activeChips.push({ key: "createdTo", label: `To: ${createdTo}`, clear: () => setCreatedTo("") });

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

  // Advanced filter count
  const advancedFiltersCount = [
    jobType !== "all",
    !!location,
    !!clientName,
    !!minCandidates,
    !!maxCandidates,
    !!createdFrom,
    !!createdTo
  ].filter(Boolean).length;

  const renderJobs = (listResponse?.data?.pipelines || []).map((p: any) => convertPipelineListDataToJob(p, false));
  const totalItems = listResponse?.data?.pagination?.total || listResponse?.data?.pagination?.totalPipelines || 0;
  const totalPages = listResponse?.data?.pagination?.totalPages || 1;
  const currentPageRes = listResponse?.data?.pagination?.currentPage || 1;
  const hasNextPage = listResponse?.data?.pagination?.hasNextPage;
  const hasPrevPage = listResponse?.data?.pagination?.hasPrevPage;

  if (!canViewPipeline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500">
          <FilterX className="w-8 h-8" />
        </div>
        <div className="text-center font-black text-foreground tracking-tight">Access Restricted</div>
        <div className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">Pipeline visibility requires authorized permissions.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      
      {/* 1. Header Section */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-card to-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand" />
            Recruiter Pipelines
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Monitor stages, apply modern filters, and manage active pipelines seamlessly.
          </p>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {canDeletePipeline && selectedPipelines.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setIsDeleteDialogOpen(true)} 
              className="h-9 px-3 rounded-lg flex items-center shadow-sm font-semibold text-xs transition-all duration-300"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete ({selectedPipelines.length})
            </Button>
          )}

          {/* Sync Button styled in Brand color */}
          <Button
            variant="default"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 border border-brand transition-all"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-white", isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Unified Filter Section */}
      <div className="flex-shrink-0 border-b border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 flex flex-col gap-3.5 transition-all duration-300">
        
        {/* Main Row: Search + Quick Dropdowns + Sort + Advanced Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
            </div>
            <Input
              placeholder="Search by Job Title, Client Name, or pipeline notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-8 bg-muted/20 border-border rounded-lg text-xs font-medium text-foreground placeholder:text-muted-foreground focus:bg-card focus:ring-2 focus:ring-brand/5 focus:border-brand/20 transition-all shadow-sm w-full"
            />
            {listLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader className="h-4 w-4 text-brand animate-spin" />
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2.5">
            {/* Status Select */}
            <div className="w-full lg:w-40">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/15 border-border rounded-lg shadow-sm">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-muted-foreground italic font-medium">Clear Filter</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Select */}
            <div className="w-full lg:w-36">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/15 border-border rounded-lg shadow-sm">
                  <SelectValue placeholder="Priority: All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-muted-foreground italic font-medium">Clear Filter</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Field Select */}
            <div className="w-full lg:w-44">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-muted/15 border-border rounded-lg shadow-sm">
                  <span className="text-muted-foreground mr-1 font-normal">Sort:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Recently Updated</SelectItem>
                  <SelectItem value="totalCandidates">Candidate Count</SelectItem>
                  <SelectItem value="jobTitle">Job Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Direction Toggle & Advanced Toggle */}
            <div className="flex items-center gap-2 w-full col-span-2 sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="h-9 px-2.5 rounded-lg border-border hover:bg-muted flex-1 sm:flex-initial shadow-sm"
                title={sortOrder === "desc" ? "Sort Descending" : "Sort Ascending"}
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1.5">{sortOrder}</span>
              </Button>

              {/* Filters Toggle styled in Brand color when open */}
              <Button
                variant={showAdvanced ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "h-9 px-3 rounded-lg border-border hover:bg-muted relative flex-1 sm:flex-initial shadow-sm font-semibold text-xs flex items-center gap-1.5",
                  showAdvanced ? "bg-brand text-white border-brand hover:bg-brand/90 hover:text-white" : "bg-card text-foreground"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {advancedFiltersCount > 0 && (
                  <span className={cn(
                    "flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-extrabold animate-pulse",
                    showAdvanced ? "bg-white text-brand" : "bg-brand text-white"
                  )}>
                    {advancedFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters panel */}
        {showAdvanced && (
          <div className="p-4 rounded-xl border border-border bg-muted/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Job Type dropdown - Configured with DB values and Clear Filter option */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Type</label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="h-8.5 text-xs font-medium bg-card border-border rounded-lg">
                  <SelectValue placeholder="Job Type: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-muted-foreground italic font-medium">Clear Filter</SelectItem>
                  <SelectItem value="Full Time">Full-time</SelectItem>
                  <SelectItem value="Part Time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Name</label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Acme Corp, Apple, etc."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg"
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Riyadh, Dubai, remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg"
                />
              </div>
            </div>

            {/* Candidate Counts */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Candidates Count Range</label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minCandidates}
                  onChange={(e) => setMinCandidates(e.target.value)}
                  className="h-8.5 text-xs font-medium bg-card border-border rounded-lg w-full text-center"
                />
                <span className="text-[10px] text-muted-foreground font-semibold">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxCandidates}
                  onChange={(e) => setMaxCandidates(e.target.value)}
                  className="h-8.5 text-xs font-medium bg-card border-border rounded-lg w-full text-center"
                />
              </div>
            </div>

            {/* Creation Date Range */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Created Date Range</label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg w-full text-left"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">to</span>
                <div className="relative w-full">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    className="h-8.5 pl-8 text-xs font-medium bg-card border-border rounded-lg w-full text-left"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips row */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-dashed border-border/80 animate-in fade-in duration-300">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground mr-1">Active Filters:</span>
            {activeChips.map(chip => (
              <div 
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand/5 border border-brand/15 text-[10px] font-semibold text-brand transition-all shadow-sm"
              >
                <span>{chip.label}</span>
                <button 
                  onClick={chip.clear}
                  className="rounded-full hover:bg-brand/10 p-0.5 text-brand transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full ml-auto"
            >
              Clear All
            </Button>
          </div>
        )}

      </div>

      {/* Summary Strip */}
      <div className="flex-shrink-0 bg-muted/20 px-6 py-2 border-b border-border flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>Found {totalItems} matching pipelines</span>
        {selectedPipelines.length > 0 && (
          <span className="text-brand">{selectedPipelines.length} selected</span>
        )}
      </div>

      {/* 3. Pipeline Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-muted/10">
        {listLoading && renderJobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
             <div className="p-4.5 rounded-2xl bg-card shadow-sm border border-border flex items-center gap-3 animate-pulse">
                <Loader className="h-5 w-5 text-brand animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Retrieving Pipelines...</span>
             </div>
          </div>
        ) : renderJobs.length > 0 ? (
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
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8 bg-card rounded-2xl border border-border/80 shadow-sm max-w-xl mx-auto my-12">
            <div className="p-5 rounded-full bg-muted/40 border border-border shadow-sm">
               <FilterX className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
               <h3 className="text-sm font-bold text-foreground tracking-tight">No Pipelines Found</h3>
               <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider max-w-[280px]">
                  No recruitment pipelines matched your filters. Adjust search parameters or clear filters to retry.
               </p>
            </div>
            {activeChips.length > 0 && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleClearAll} 
                className="mt-2 h-9 px-4 rounded-lg font-semibold text-xs bg-brand hover:bg-brand/90 text-white border border-brand shadow-sm transition-all"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 4. Pagination Footer */}
      <div className="flex-shrink-0 bg-card border-t border-border px-6 py-3.5">
        {totalPages > 1 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
               <div className="px-2.5 py-1 rounded-md bg-muted border border-border shadow-sm flex items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1.5">Page</span>
                  <span className="text-xs font-bold text-foreground">{currentPageRes}</span>
                  <span className="text-xs font-semibold text-muted-foreground mx-1">/</span>
                  <span className="text-xs font-semibold text-muted-foreground">{totalPages}</span>
               </div>
               <div className="h-4 w-[1px] bg-muted mx-1" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
                  {totalItems} total records
               </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!hasPrevPage}
                className="h-9 px-3.5 rounded-lg border-border font-semibold text-xs text-foreground hover:bg-muted disabled:opacity-45 shadow-sm transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={!hasNextPage}
                className="h-9 px-3.5 rounded-lg border-border font-semibold text-xs text-foreground hover:bg-muted disabled:opacity-45 shadow-sm transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
               Showing all <span className="text-foreground font-extrabold mx-0.5">{totalItems}</span> pipeline entries
            </span>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
       <AlertDialogContent className="rounded-xl border border-border shadow-md">
         <AlertDialogHeader>
           <AlertDialogTitle className="font-bold text-foreground">Are you absolutely sure?</AlertDialogTitle>
           <AlertDialogDescription className="text-xs font-semibold text-muted-foreground">
             This will permanently delete {selectedPipelines.length} pipeline(s) and all associated candidate tracking profiles. This operation is irreversible.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter className="gap-2 sm:gap-0">
           <AlertDialogCancel disabled={listLoading} className="rounded-lg text-xs font-bold border border-border">Cancel</AlertDialogCancel>
           <AlertDialogAction onClick={handleDeleteSelected} disabled={listLoading} className="bg-destructive text-white hover:bg-destructive/90 rounded-lg text-xs font-bold">
             Delete Pipelines
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>

    </div>
  );
}
