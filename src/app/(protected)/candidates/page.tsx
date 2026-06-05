"use client";
import { Candidate, candidateService } from "@/services/candidateService";
import { useCandidates, useUpdateCandidate, useDeleteCandidate } from "@/hooks/useCandidate";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Loader, Mail, Phone, MapPin, Briefcase, FileText, Search, Lock } from "lucide-react";
import { CandidatesEmptyState } from "../../../components/candidates/empty-states";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboardheader from "@/components/dashboard-header";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { CandidateStatusBadge } from "@/components/candidate-status-badge";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { SlidersHorizontal, X, RefreshCw } from "lucide-react";
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
      <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
        {/* Page Header */}
        <div className="flex-shrink-0 relative overflow-hidden bg-card rounded-[1.5rem] border border-border shadow-lg p-1.5">
          <div className="absolute top-0 right-0 w-48 h-full bg-brand/5 rounded-full blur-2xl pointer-events-none" />
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
            onRefresh={() => refetch()}
            onExport={() => setOpenExportDialog(true)}
          />
        </div>

        {/* Real-time Filter Bar */}
        <div className="flex-shrink-0 bg-card rounded-[1.5rem] border border-border shadow-md p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Global Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Global quick search (name or email)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="w-[180px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full bg-muted/50 border-border rounded-xl text-xs font-bold uppercase tracking-wider h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="All" className="text-xs font-bold uppercase tracking-wider">All Statuses</SelectItem>
                  <SelectItem value="Active" className="text-xs font-bold uppercase tracking-wider">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-xs font-bold uppercase tracking-wider">Inactive</SelectItem>
                  <SelectItem value="Shortlisted" className="text-xs font-bold uppercase tracking-wider">Shortlisted</SelectItem>
                  <SelectItem value="Interviewing" className="text-xs font-bold uppercase tracking-wider">Interviewing</SelectItem>
                  <SelectItem value="Offer" className="text-xs font-bold uppercase tracking-wider">Offer</SelectItem>
                  <SelectItem value="Placed" className="text-xs font-bold uppercase tracking-wider">Placed</SelectItem>
                  <SelectItem value="Rejected" className="text-xs font-bold uppercase tracking-wider">Rejected</SelectItem>
                  <SelectItem value="Withdrawn" className="text-xs font-bold uppercase tracking-wider">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notice Period Filter Dropdown */}
            <div className="w-[180px]">
              <Select value={selectedNoticePeriod} onValueChange={setSelectedNoticePeriod}>
                <SelectTrigger className="w-full bg-muted/50 border-border rounded-xl text-xs font-bold uppercase tracking-wider h-10">
                  <SelectValue placeholder="Notice Period" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="All" className="text-xs font-bold uppercase tracking-wider">All Notice Periods</SelectItem>
                  <SelectItem value="15 Days" className="text-xs font-bold uppercase tracking-wider">15 Days</SelectItem>
                  <SelectItem value="1 Month" className="text-xs font-bold uppercase tracking-wider">1 Month</SelectItem>
                  <SelectItem value="2 Months" className="text-xs font-bold uppercase tracking-wider">2 Months</SelectItem>
                  <SelectItem value="3 Months" className="text-xs font-bold uppercase tracking-wider">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filter Toggle */}
            <Button
              variant={advancedFiltersOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="rounded-xl h-10 px-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {advancedFiltersOpen ? "Hide Advanced" : "Advanced Filters"}
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
                className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Collapsible Advanced Filters Panel */}
          {advancedFiltersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border/60 animate-in slide-in-from-top-2 duration-300">
              {/* Name Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Candidate Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>

              {/* Email Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  type="text"
                  placeholder="Filter by email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>

              {/* Phone Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  placeholder="Filter by phone..."
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>

              {/* Profile ID Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Profile ID</label>
                <input
                  type="text"
                  placeholder="Filter by profile ID..."
                  value={profileIdInput}
                  onChange={(e) => setProfileIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>

              {/* Experience Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Experience Level</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Years..."
                  value={experienceInput}
                  onChange={(e) => setExperienceInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>

              {/* Location Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Riyadh..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Table Area */}
        <div className="flex-1 min-h-0 bg-card rounded-[1.5rem] border border-border shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <Table className="w-full border-separate border-spacing-0 table-auto">
              <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
                <TableRow className="hover:bg-muted/95 transition-colors">
                  <TableHead className="w-[48px] px-3 py-3 border-b border-border text-center">
                    <Checkbox
                      checked={selectedRows.size > 0 && selectedRows.size === candidates.length}
                      onCheckedChange={() => toggleSelectAll()}
                      className="h-4 w-4 rounded border-border"
                      disabled={!canDeleteCandidates}
                    />
                  </TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">ID</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Location</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Experience</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground text-center">Resume</TableHead>
                  <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right pr-6">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialLoading && candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-64 text-center">
                       <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Talent Pool...</span>
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-64 text-center">
                       <div className="py-12">
                         <CandidatesEmptyState />
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate) => (
                    <TableRow
                      key={candidate._id}
                      className={cn(
                        "group border-b border-border transition-all duration-300",
                        "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
                        candidate._id && selectedRows.has(candidate._id) ? "bg-brand/[0.02]" : ""
                      )}
                    >
                      <TableCell className="px-3 py-2.5 w-[48px] text-center">
                        <Checkbox
                          checked={candidate._id ? selectedRows.has(candidate._id) : false}
                          onCheckedChange={() => candidate._id && toggleRowSelection(candidate._id)}
                          className="h-4 w-4 rounded border-border"
                          disabled={!canDeleteCandidates}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>

                      {/* Profile ID */}
                      <TableCell className="px-3 py-2.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span 
                              className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-brand transition-colors block truncate max-w-[80px]"
                              onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                            >
                              {candidate.profileId || "—"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                            {candidate.profileId}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Candidate Name */}
                      <TableCell className="px-3 py-2.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="cursor-pointer group/title max-w-[150px] truncate"
                              onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                            >
                              <span className="text-[13px] font-bold text-foreground group-hover/title:text-brand transition-all block truncate">
                                {candidate.name || "N/A"}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[11px] border-none shadow-2xl">
                            {candidate.name}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5 max-w-[140px]">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <div className="flex items-center gap-1.5 overflow-hidden cursor-help">
                                  <Mail className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                  <span className="text-[10px] font-medium text-foreground truncate">{candidate.email}</span>
                               </div>
                             </TooltipTrigger>
                             <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                               {candidate.email}
                             </TooltipContent>
                           </Tooltip>
                           
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <div className="flex items-center gap-1.5 overflow-hidden cursor-help">
                                  <Phone className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                  <span className="text-[10px] font-medium text-foreground truncate">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}</span>
                               </div>
                             </TooltipTrigger>
                             <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                               {formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}
                             </TooltipContent>
                           </Tooltip>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-3 py-2.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 max-w-[100px] truncate cursor-help">
                               <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                               <span className="text-[11px] font-medium text-foreground truncate">{candidate.location || "Global"}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                            {candidate.location || "Global"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-3 py-2.5">
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
                      <TableCell className="px-3 py-2.5">
                         <div className="flex items-center gap-1.5 max-w-[100px] truncate">
                            <Briefcase className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] font-bold text-foreground truncate">{candidate.experience || "N/A"}</span>
                         </div>
                      </TableCell>

                      {/* Resume */}
                      <TableCell className="px-3 py-2.5 text-center">
                        {candidate.resume ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={candidate.resume?.startsWith('http') ? candidate.resume : `${process.env.NEXT_PUBLIC_API_URL || ''}${candidate.resume?.startsWith('/') ? '' : '/'}${candidate.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                              View Resume
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground italic">No File</span>
                        )}
                      </TableCell>

                      {/* Created By */}
                      <TableCell className="px-3 py-2.5 text-right pr-6">
                         <span className="text-[11px] font-bold text-foreground block truncate max-w-[120px] ml-auto">
                            {candidate.createdBy?.name || (typeof candidate.createdBy === 'string' ? candidate.createdBy : "System")}
                         </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex-shrink-0 bg-card border-t border-border p-1.5">
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
