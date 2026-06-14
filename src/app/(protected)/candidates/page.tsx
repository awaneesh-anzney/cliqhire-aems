"use client";
import { Candidate, candidateService } from "@/services/candidateService";
import { useCandidates, useUpdateCandidate, useDeleteCandidate } from "@/hooks/useCandidate";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { 
  Loader, Mail, Phone, MapPin, Briefcase, FileText, Search, Lock,
  LayoutGrid, List, ExternalLink, SlidersHorizontal, X
} from "lucide-react";
import { CandidatesEmptyState } from "../../../components/candidates/empty-states";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboardheader from "@/components/dashboard-header";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { CandidateStatusBadge } from "@/components/candidate-status-badge";
import { toast } from "sonner";
import CandidatePaginationControls from "@/components/candidates/CandidatePaginationControls";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { useExportCandidates } from "@/hooks/useExportCandidates";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Standard, high-performance debounce hook
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

// Generate initials for candidate avatar
function getInitials(name: string = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate premium gradient based on candidate name
function getAvatarGradient(name: string = "") {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-purple-500",
    "from-fuchsia-500 to-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function CandidatesPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';

  const canViewCandidates = isAdmin || hasPermission('candidates', 'view');
  const canModifyCandidates = isAdmin || hasPermission('candidates', 'create') || hasPermission('candidates', 'edit');
  const canDeleteCandidates = isAdmin || hasPermission('candidates', 'delete');
  const router = useRouter();
  const { mutateAsync: exportCandidatesMutation } = useExportCandidates();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Real-time filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [profileIdInput, setProfileIdInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedNoticePeriod, setSelectedNoticePeriod] = useState<string>("All");

  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Debounced filters
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedPhone = useDebounce(phoneInput, 300);
  const debouncedProfileId = useDebounce(profileIdInput, 300);
  const debouncedExperience = useDebounce(experienceInput, 300);
  const debouncedLocation = useDebounce(locationInput, 300);

  // Load view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('candidates_view_mode') as 'grid' | 'table';
    if (saved) {
      setViewMode(saved);
    } else {
      const isMobile = window.innerWidth < 1024;
      setViewMode(isMobile ? 'grid' : 'table');
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('candidates_view_mode', mode);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Reset to first page when filters change
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

  const { data, isLoading: initialLoading, isFetching, refetch } = useCandidates({
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
  const [open, setOpen] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);



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

  const toggleRowSelection = (candidateId: string) => {
    if (!canDeleteCandidates) return;
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!canDeleteCandidates) return;
    if (selectedRows.size === candidates.length && candidates.length > 0) {
      setSelectedRows(new Set());
    } else {
      const newSelected = new Set<string>();
      candidates.forEach((c) => { if (c._id) newSelected.add(c._id); });
      setSelectedRows(newSelected);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.size === 0 || !canDeleteCandidates) return;
    setShowDeleteDialog(true);
  };

  const confirmDeleteSelected = async () => {
    if (selectedRows.size === 0 || !canDeleteCandidates) return;
    setIsDeleting(true);
    try {
      await Promise.all(Array.from(selectedRows).map((candidateId) => deleteCandidateMutation(candidateId)));
      await refetch();
      setSelectedRows(new Set());
      toast.success(`${selectedRows.size} candidate(s) deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete selected candidates');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const { mutateAsync: updateCandidateMutation } = useUpdateCandidate();
  const { mutateAsync: deleteCandidateMutation } = useDeleteCandidate();

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    if (!canModifyCandidates) return;
    try {
      await updateCandidateMutation({ id: candidateId, data: { status: newStatus } });
      toast.success("Status updated");
    } catch(e) {
      toast.error("Failed to update status");
    }
  };

  if (!canViewCandidates) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-red-50 text-red-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center font-black text-foreground tracking-tight">Access Denied</div>
        <div className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">Permission required to view candidates.</div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-2.5 gap-2.5 animate-in fade-in duration-700">
        
        {/* Page Header */}
        <div className="flex-shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <Dashboardheader
            setOpen={setOpen}
            setFilterOpen={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            initialLoading={isFetching}
            heading="Candidates"
            buttonText="Add Candidate"
            showCreateButton={canModifyCandidates}
            showFilterButton={true}
            isFilterActive={!!searchInput.trim() || !!nameInput.trim() || !!emailInput.trim() || !!phoneInput.trim() || !!profileIdInput.trim() || !!experienceInput.trim() || !!locationInput.trim() || selectedStatus !== "All" || selectedNoticePeriod !== "All"}
            filterCount={(searchInput.trim() ? 1 : 0) + (nameInput.trim() ? 1 : 0) + (emailInput.trim() ? 1 : 0) + (phoneInput.trim() ? 1 : 0) + (profileIdInput.trim() ? 1 : 0) + (experienceInput.trim() ? 1 : 0) + (locationInput.trim() ? 1 : 0) + (selectedStatus !== "All" ? 1 : 0) + (selectedNoticePeriod !== "All" ? 1 : 0)}
            selectedCount={selectedRows.size}
            onDelete={handleDeleteSelected}
            onRefresh={() => { refetch(); }}
            onExport={() => setOpenExportDialog(true)}
          />
        </div>

        {/* Real-time Filter & View Controls Bar */}
        <div className="flex-shrink-0 bg-card rounded-xl border border-border shadow-sm px-3.5 py-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap flex-1 items-center gap-3">
              {/* Global Search Input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Global quick search (name or email)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-8 h-9 text-xs bg-muted/20 border border-border rounded-xl focus:outline-none focus-visible:ring-1 focus-visible:ring-brand focus:border-brand transition-all font-medium text-foreground"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="w-[150px]">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="All" className="text-xs font-medium">All Statuses</SelectItem>
                    <SelectItem value="Active" className="text-xs font-medium">Active</SelectItem>
                    <SelectItem value="Inactive" className="text-xs font-medium">Inactive</SelectItem>
                    <SelectItem value="Shortlisted" className="text-xs font-medium">Shortlisted</SelectItem>
                    <SelectItem value="Interviewing" className="text-xs font-medium">Interviewing</SelectItem>
                    <SelectItem value="Offer" className="text-xs font-medium">Offer</SelectItem>
                    <SelectItem value="Placed" className="text-xs font-medium">Placed</SelectItem>
                    <SelectItem value="Rejected" className="text-xs font-medium">Rejected</SelectItem>
                    <SelectItem value="Withdrawn" className="text-xs font-medium">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notice Period Filter Dropdown */}
              <div className="w-[150px]">
                <Select value={selectedNoticePeriod} onValueChange={setSelectedNoticePeriod}>
                  <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                    <SelectValue placeholder="Notice Period" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="All" className="text-xs font-medium">All Notice Periods</SelectItem>
                    <SelectItem value="15 Days" className="text-xs font-medium">15 Days</SelectItem>
                    <SelectItem value="1 Month" className="text-xs font-medium">1 Month</SelectItem>
                    <SelectItem value="2 Months" className="text-xs font-medium">2 Months</SelectItem>
                    <SelectItem value="3 Months" className="text-xs font-medium">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filter Toggle */}
              <Button
                variant={advancedFiltersOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                className="rounded-xl h-9 px-3.5 flex items-center gap-2 text-xs font-semibold transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{advancedFiltersOpen ? "Hide Advanced" : "Advanced Filters"}</span>
                {(nameInput || emailInput || phoneInput || profileIdInput || experienceInput || locationInput) && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>

              {/* Reset All Filters Button */}
              {(searchInput || nameInput || emailInput || phoneInput || profileIdInput || experienceInput || locationInput || selectedStatus !== "All" || selectedNoticePeriod !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="rounded-xl h-9 px-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* View Mode Toggle Group */}
            <div className="flex items-center gap-0.5 border border-border bg-muted/30 rounded-xl p-0.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange('table')}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  viewMode === 'table' 
                    ? "bg-card text-brand shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  viewMode === 'grid' 
                    ? "bg-card text-brand shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Panel */}
          {advancedFiltersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2.5 border-t border-border/60 animate-in slide-in-from-top-2 duration-300">
              {/* Name Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Candidate Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>

              {/* Email Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  type="text"
                  placeholder="Filter by email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>

              {/* Phone Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  placeholder="Filter by phone..."
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>

              {/* Profile ID Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Profile ID</label>
                <input
                  type="text"
                  placeholder="Filter by profile ID..."
                  value={profileIdInput}
                  onChange={(e) => setProfileIdInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>

              {/* Experience Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Experience Level</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Years..."
                  value={experienceInput}
                  onChange={(e) => setExperienceInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>

              {/* Location Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Riyadh..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Table/Grid Area */}
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {initialLoading && candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                 <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Talent Pool...</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-12">
                <CandidatesEmptyState />
              </div>
            ) : viewMode === 'grid' ? (
              /* Polished Grid View */
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={cn(
                      "group relative bg-card rounded-xl border border-border p-4 transition-all duration-300 flex flex-col justify-between h-full",
                      "hover:shadow-lg hover:shadow-brand/20 hover:border-brand/40 hover:-translate-y-0.5",
                      candidate._id && selectedRows.has(candidate._id) ? "ring-2 ring-brand border-transparent bg-brand/[0.01] shadow-lg shadow-brand/25" : ""
                    )}
                  >
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Grid Item Header */}
                        <div className="flex items-center justify-between mb-2.5">
                          {canDeleteCandidates ? (
                            <Checkbox
                              checked={candidate._id ? selectedRows.has(candidate._id) : false}
                              onCheckedChange={() => candidate._id && toggleRowSelection(candidate._id)}
                              className="h-4 w-4 rounded-md border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div />
                          )}
                          
                          {/* Quick action buttons */}
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                            {candidate.resume && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={candidate.resume?.startsWith('http') ? candidate.resume : `${process.env.NEXT_PUBLIC_API_URL || ''}${candidate.resume?.startsWith('/') ? '' : '/'}${candidate.resume}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-brand hover:text-white transition-all shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                  View Resume
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                                  className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-brand hover:text-white transition-all shadow-sm"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                View Profile Details
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Avatar & Basic details */}
                        <div className="flex items-center gap-3 mb-2.5 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br shadow-inner",
                            getAvatarGradient(candidate.name)
                          )}>
                            {getInitials(candidate.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                             <h4 
                               onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                              className="font-bold text-[13px] text-candidate-name hover:text-brand transition-colors cursor-pointer truncate leading-tight block w-full"
                            >
                              {candidate.name || "N/A"}
                            </h4>
                            {candidate.profileId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] font-semibold text-candidate-id tracking-wider block mt-0.5 uppercase truncate cursor-pointer hover:text-brand transition-colors">
                                    ID: {candidate.profileId}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                  ID: {candidate.profileId}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-[10px] font-semibold text-candidate-id tracking-wider block mt-0.5 uppercase truncate">
                                ID: —
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badging */}
                        <div className="flex flex-wrap gap-2 items-center mb-2.5">
                          <div className="scale-90 origin-left shrink-0">
                            <CandidateStatusBadge
                              id={candidate._id}
                              status={(candidate.status as any) || "Active"}
                              onStatusChange={handleStatusChange}
                              disabled={!canModifyCandidates}
                            />
                          </div>
                          {candidate.noticePeriod && candidate.noticePeriod !== "All" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border shrink-0 truncate max-w-[100px]">
                              NP: {candidate.noticePeriod}
                            </span>
                          )}
                        </div>

                        {/* Contact row details */}
                        <div className="space-y-1.5 border-t border-b border-border/50 py-2.5 mb-2.5">
                          {candidate.email && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={() => candidate.email && handleCopy(candidate.email, "Email")}
                                  className="flex items-center gap-2.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors w-full min-w-0 overflow-hidden"
                                >
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                  <span className="truncate font-medium block flex-1 w-0">{candidate.email}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                {candidate.email}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {candidate.phone && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={() => candidate.phone && handleCopy(candidate.phone, "Phone")}
                                  className="flex items-center gap-2.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors w-full min-w-0 overflow-hidden"
                                >
                                  <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                  <span className="truncate font-medium block flex-1 w-0">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                {formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        {/* Stats details (location / experience) */}
                        <div className="grid grid-cols-2 gap-2 mb-2.5 w-full min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 text-muted-foreground min-w-0 cursor-pointer">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                <span className="text-[11px] font-semibold truncate text-foreground/80 flex-1 w-0">{candidate.location || "Global"}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                              {candidate.location || "Global"}
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-[11px] font-black truncate text-foreground/80 flex-1 w-0">{candidate.experience || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill pills */}
                    <div className="mt-auto shrink-0 min-h-[32px] flex flex-col justify-end">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border/30 w-full overflow-hidden">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand/5 text-brand border border-brand/10 truncate max-w-[80px] block"
                              title={skill}
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border shrink-0">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-6 flex items-center justify-start pt-2 border-t border-border/30">
                          <span className="text-[10px] text-muted-foreground/50 italic font-medium">No skills listed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Redesigned Modern Table View */
              <Table className="w-full border-separate border-spacing-0 table-auto min-w-[1100px]">
                <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
                  <TableRow className="hover:bg-muted/95 transition-colors border-b border-border">
                    <TableHead className="w-[60px] px-3.5 py-2.5 border-b border-border text-center">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === candidates.length}
                        onCheckedChange={() => toggleSelectAll()}
                        className="h-4 w-4 rounded border-border"
                        disabled={!canDeleteCandidates}
                      />
                    </TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[110px]">Profile ID</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[200px]">Candidate Details</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[220px]">Contact Info</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[140px]">Location</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[160px]">Status</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[130px]">Experience</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center w-[100px]">Resume</TableHead>
                    <TableHead className="px-3.5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right pr-6 min-w-[120px]">Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow
                      key={candidate._id}
                      className={cn(
                        "group border-b border-border/80 transition-all duration-200 cursor-pointer",
                        "hover:relative hover:z-[3] hover:shadow-md hover:shadow-brand/20 hover:bg-brand/[0.02]",
                        candidate._id && selectedRows.has(candidate._id)
                          ? "relative z-[2] shadow-md shadow-brand/30 bg-brand/[0.015] border-brand/20"
                          : ""
                      )}
                      onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                    >
                      {/* Checkbox column */}
                      <TableCell className="px-3.5 py-2 w-[60px] text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={candidate._id ? selectedRows.has(candidate._id) : false}
                          onCheckedChange={() => candidate._id && toggleRowSelection(candidate._id)}
                          className="h-4 w-4 rounded border-border"
                          disabled={!canDeleteCandidates}
                        />
                      </TableCell>

                      {/* Profile ID */}
                      <TableCell className="px-3.5 py-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] font-semibold text-candidate-id cursor-pointer hover:text-brand transition-colors block truncate max-w-[80px]">
                              {candidate.profileId || "—"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                            {candidate.profileId}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Candidate Name & Avatar */}
                      <TableCell className="px-3.5 py-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-7.5 h-7.5 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br shadow-inner",
                            getAvatarGradient(candidate.name)
                          )}>
                            {getInitials(candidate.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[12.5px] font-bold text-candidate-name group-hover:text-brand transition-all truncate block max-w-[160px]">
                              {candidate.name || "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="px-3.5 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 max-w-[200px] min-w-0">
                          {candidate.email && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={() => candidate.email && handleCopy(candidate.email, "Email")}
                                  className="flex items-center gap-2 group/copy cursor-pointer text-muted-foreground hover:text-foreground transition-colors w-full overflow-hidden"
                                >
                                  <Mail className="w-3 h-3 text-muted-foreground/50 shrink-0 group-hover/copy:text-brand" />
                                  <span className="text-[10.5px] font-medium truncate block flex-1 w-0">{candidate.email}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                {candidate.email}
                              </TooltipContent>
                            </Tooltip>
                          )}
                           
                           {candidate.phone && (
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <div 
                                   onClick={() => candidate.phone && handleCopy(candidate.phone, "Phone")}
                                   className="flex items-center gap-2 group/copy cursor-pointer text-muted-foreground hover:text-foreground transition-colors w-full overflow-hidden"
                                 >
                                    <Phone className="w-3 h-3 text-muted-foreground/50 shrink-0 group-hover/copy:text-brand" />
                                    <span className="text-[10.5px] font-medium truncate block flex-1 w-0">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}</span>
                                 </div>
                               </TooltipTrigger>
                               <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                                 {formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}
                               </TooltipContent>
                             </Tooltip>
                           )}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-3.5 py-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 max-w-[130px] cursor-pointer">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                              <span className="text-[11.5px] font-medium text-foreground/80 truncate">{candidate.location || "Global"}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                            {candidate.location || "Global"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="px-3.5 py-2" onClick={(e) => e.stopPropagation()}>
                         <div className="scale-90 origin-left">
                            <CandidateStatusBadge
                              id={candidate._id}
                              status={(candidate.status as any) || "Active"}
                              onStatusChange={handleStatusChange}
                              disabled={!canModifyCandidates}
                            />
                         </div>
                      </TableCell>

                      {/* Experience */}
                      <TableCell className="px-3.5 py-2">
                        <div className="flex items-center gap-2 max-w-[120px] truncate">
                           <Briefcase className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                           <span className="text-[11.5px] font-semibold text-foreground/80 truncate">{candidate.experience || "N/A"}</span>
                        </div>
                      </TableCell>

                      {/* Resume */}
                      <TableCell className="px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        {candidate.resume ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={candidate.resume?.startsWith('http') ? candidate.resume : `${process.env.NEXT_PUBLIC_API_URL || ''}${candidate.resume?.startsWith('/') ? '' : '/'}${candidate.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent className="bg-brand text-brand-foreground font-semibold text-xs rounded-lg shadow-md border-none px-2.5 py-1.5">
                              View Resume
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground/50 italic">No File</span>
                        )}
                      </TableCell>

                      {/* Created By */}
                      <TableCell className="px-3.5 py-2 text-right pr-6">
                         <span className="text-[11px] font-medium text-foreground block truncate max-w-[120px] ml-auto">
                            {candidate.createdBy?.name || (typeof candidate.createdBy === 'string' ? candidate.createdBy : "System")}
                         </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination Footer */}
          <div className="flex-shrink-0 bg-card border-t border-border py-2 px-3">
            <CandidatePaginationControls
              currentPage={currentPage}
              totalPages={data?.totalPages || 1}
              totalCandidates={data?.total || 0}
              pageSize={pageSize}
              setPageSize={setPageSize}
              handlePageChange={(page) => {
                if (page >= 1 && page <= (data?.totalPages || 1)) setCurrentPage(page);
              }}
              candidatesLength={candidates.length}
            />
          </div>
        </div>

        {/* Action Dialogs */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeleteSelected}
          title={`Delete ${selectedRows.size} candidate(s)?`}
          description={`Confirm deletion of ${selectedRows.size} profiles from the database.`}
          confirmText={isDeleting ? 'Processing...' : 'Delete Permanently'}
          isDeleting={isDeleting}
        />

        <CreateCandidateModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onCandidateCreated={() => { setOpen(false); setCurrentPage(1); refetch(); }}
        />

        <ExportDialog
           isOpen={openExportDialog}
           onClose={() => setOpenExportDialog(false)}
           title="Export Talent"
           description="Download CSV candidate report."
           onExport={(params: ExportFilterParams | undefined) => exportCandidatesMutation(params)}
           filename="candidates"
         />
       </div>
     </TooltipProvider>
   );
}
