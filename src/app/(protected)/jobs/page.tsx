"use client";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal, RefreshCcw, MoreVertical, Loader, X, Briefcase, MapPin, Users2, Calendar, Search, Lock, Hash, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
 import {
   Table,
   TableHead,
   TableBody,
   TableCell,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { useRouter } from "next/navigation";
 import { JobStageBadge } from "@/components/jobs/job-stage-badge";
 import { JobStage } from "@/types/job";
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
 import Dashboardheader from "@/components/dashboard-header";
 import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
 import { JobPaginationControls } from "@/components/jobs/JobPaginationControls";
 import { useAuth } from "@/contexts/AuthContext";
 import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
 import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
 import { useExportJobs } from "@/hooks/useExportJobs";
 import { useJobs, useUpdateJobStage, useDeleteJob } from "@/hooks/useJobs";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 
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
       <AlertDialogContent className="rounded-[2rem] border-border shadow-2xl">
         <AlertDialogHeader>
           <AlertDialogTitle className="font-black text-foreground">Confirm Stage Change</AlertDialogTitle>
           <AlertDialogDescription className="font-bold text-muted-foreground">
             Are you sure you want to update the job stage? This action will be saved immediately.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel className="rounded-xl font-black text-[11px] uppercase tracking-widest border-border">Cancel</AlertDialogCancel>
           <AlertDialogAction onClick={onConfirm} className="rounded-xl font-black text-[11px] uppercase tracking-widest bg-brand hover:bg-brand/90">Confirm</AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   );
 }
 
 export default function JobsPage() {
   const { user } = useAuth();
   const { hasPermission } = usePermissions();
   const isAdmin = user?.role === 'ADMIN';
 
   const canViewJobs = isAdmin || hasPermission('jobs', 'view');
   const canModifyJobs = isAdmin || hasPermission('jobs', 'create') || hasPermission('jobs', 'edit');
   const canDeleteJobs = isAdmin || hasPermission('jobs', 'delete');
 
   const [open, setOpen] = useState(false);
   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
   const [openExportDialog, setOpenExportDialog] = useState(false);
   const { mutateAsync: exportJobsMutation } = useExportJobs();

   const [searchInput, setSearchInput] = useState("");
   const [jobTitleInput, setJobTitleInput] = useState("");
   const [jobIdInput, setJobIdInput] = useState("");
   const [locationInput, setLocationInput] = useState("");
   const [clientInput, setClientInput] = useState("");
   const [headcountInput, setHeadcountInput] = useState("");
   const [jobTypeInput, setJobTypeInput] = useState("");
   const [selectedStage, setSelectedStage] = useState<string>("All");
   const [includeInactiveInput, setIncludeInactiveInput] = useState(false);

   const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

   const debouncedSearch = useDebounce(searchInput, 300);
   const debouncedJobTitle = useDebounce(jobTitleInput, 300);
   const debouncedJobId = useDebounce(jobIdInput, 300);
   const debouncedLocation = useDebounce(locationInput, 300);
   const debouncedClient = useDebounce(clientInput, 300);
   const debouncedHeadcount = useDebounce(headcountInput, 300);
   const debouncedJobType = useDebounce(jobTypeInput, 300);

   const [confirmOpen, setConfirmOpen] = useState(false);
   const [pendingStageChange, setPendingStageChange] = useState<{
     jobId: string;
     newStage: JobStage;
   } | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const router = useRouter();
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

   const { data: jobsData, isLoading, isFetching, refetch } = useJobs({
     page: currentPage,
     limit: pageSize,
     search: debouncedSearch || undefined,
     jobTitle: debouncedJobTitle || undefined,
     jobId: debouncedJobId || undefined,
     location: debouncedLocation || undefined,
     client: debouncedClient || undefined,
     headcount: debouncedHeadcount ? parseInt(debouncedHeadcount) || undefined : undefined,
     jobType: debouncedJobType || undefined,
     stage: selectedStage === "All" ? undefined : selectedStage,
     includeInactive: includeInactiveInput || undefined,
   });

   const allJobs = jobsData?.jobs ?? [];
 
   const totalJobs = jobsData?.totalCount ?? 0;
   const totalPages = jobsData?.totalPages ?? 1;
 
   const handlePageChange = (newPage: number) => {
     if (newPage >= 1 && newPage <= totalPages) {
       setCurrentPage(newPage);
     }
   };
 
   const toJobStage = (stage?: string): JobStage => {
     const validStages: JobStage[] = ["Open", "Hired", "On Hold", "Closed", "Active", "Onboarding"];
     return validStages.includes(stage as JobStage) ? (stage as JobStage) : "Open";
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
       toast.success("Job stage updated successfully");
       refetch();
     } catch (error) {
       toast.error("Failed to update job stage");
     } finally {
       setPendingStageChange(null);
       setConfirmOpen(false);
     }
   };
 
   const toggleRowSelection = (jobId: string) => {
     if (!canDeleteJobs) return;
     setSelectedRows(prevSelected => {
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
       allJobs.forEach((job: any) => newSelectedRows.add(job._id));
       setSelectedRows(newSelectedRows);
     }
   };
 
   const handleDeleteSelected = async () => {
     if (selectedRows.size === 0 || !canDeleteJobs) return;
     setShowDeleteDialog(true);
   };
 
   const confirmDeleteSelected = async () => {
     if (selectedRows.size === 0 || !canDeleteJobs) return;
     setIsDeleting(true);
     try {
       await Promise.all(Array.from(selectedRows).map((jobId) => deleteJobMutation(jobId)));
       await refetch();
       setSelectedRows(new Set());
       toast.success(`${selectedRows.size} job(s) deleted successfully`);
     } catch (error) {
       toast.error('Failed to delete selected jobs');
     } finally {
       setIsDeleting(false);
       setShowDeleteDialog(false);
     }
   };
 
   if (!canViewJobs) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
         <div className="p-4 rounded-full bg-red-50 text-red-500">
           <Lock className="w-8 h-8" />
         </div>
         <div className="text-center font-black text-foreground tracking-tight">Access Denied</div>
         <div className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">Permission required to view jobs.</div>
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
              setFilterOpen={() => setAdvancedFiltersOpen(prev => !prev)}
              initialLoading={isFetching}
              onRefresh={() => refetch()}
              onDelete={handleDeleteSelected}
              heading="Jobs"
              buttonText="Add Job"
              selectedCount={selectedRows.size}
              showCreateButton={canModifyJobs}
              showFilterButton={true}
              isFilterActive={!!searchInput.trim() || !!jobTitleInput.trim() || !!jobIdInput.trim() || !!locationInput.trim() || !!clientInput.trim() || !!headcountInput.trim() || !!jobTypeInput.trim() || selectedStage !== "All" || includeInactiveInput}
              filterCount={(searchInput.trim() ? 1 : 0) + (jobTitleInput.trim() ? 1 : 0) + (jobIdInput.trim() ? 1 : 0) + (locationInput.trim() ? 1 : 0) + (clientInput.trim() ? 1 : 0) + (headcountInput.trim() ? 1 : 0) + (jobTypeInput.trim() ? 1 : 0) + (selectedStage !== "All" ? 1 : 0) + (includeInactiveInput ? 1 : 0)}
              onExport={() => setOpenExportDialog(true)}
            />
          </div>

          {/* Real-time Filter Bar */}
          <div className="flex-shrink-0 bg-card rounded-[1.5rem] border border-border shadow-md p-4 flex flex-col gap-3 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-3">
              {/* Global Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Global quick search (title or ID)..."
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

              {/* Stage Filter Dropdown */}
              <div className="w-[180px]">
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-full bg-muted/50 border-border rounded-xl text-xs font-bold uppercase tracking-wider h-10">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="All" className="text-xs font-bold uppercase tracking-wider">All Stages</SelectItem>
                    <SelectItem value="Open" className="text-xs font-bold uppercase tracking-wider">Open</SelectItem>
                    <SelectItem value="Hired" className="text-xs font-bold uppercase tracking-wider">Hired</SelectItem>
                    <SelectItem value="On Hold" className="text-xs font-bold uppercase tracking-wider">On Hold</SelectItem>
                    <SelectItem value="Closed" className="text-xs font-bold uppercase tracking-wider">Closed</SelectItem>
                    <SelectItem value="Active" className="text-xs font-bold uppercase tracking-wider">Active</SelectItem>
                    <SelectItem value="Onboarding" className="text-xs font-bold uppercase tracking-wider">Onboarding</SelectItem>
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
                {(jobTitleInput || jobIdInput || locationInput || clientInput || headcountInput || jobTypeInput || includeInactiveInput) && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>

              {/* Reset All Filters Button */}
              {(searchInput || jobTitleInput || jobIdInput || locationInput || clientInput || headcountInput || jobTypeInput || selectedStage !== "All" || includeInactiveInput) && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-3 border-t border-border/60 animate-in slide-in-from-top-2 duration-300">
                {/* Job Title Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    placeholder="Filter by title..."
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Job ID Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Job ID</label>
                  <input
                    type="text"
                    placeholder="Filter by ID..."
                    value={jobIdInput}
                    onChange={(e) => setJobIdInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Location Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Client Name/ID Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Client (Name or ID)</label>
                  <input
                    type="text"
                    placeholder="Filter by client..."
                    value={clientInput}
                    onChange={(e) => setClientInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Headcount Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Headcount</label>
                  <input
                    type="number"
                    placeholder="Exact headcount..."
                    value={headcountInput}
                    onChange={(e) => setHeadcountInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Job Type Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Job Type</label>
                  <input
                    type="text"
                    placeholder="Full-time, Contract..."
                    value={jobTypeInput}
                    onChange={(e) => setJobTypeInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-semibold"
                  />
                </div>

                {/* Include Inactive Checkbox */}
                <div className="flex items-center gap-2 h-full min-h-[40px] pt-4">
                  <Checkbox
                    id="includeInactive"
                    checked={includeInactiveInput}
                    onCheckedChange={(checked) => setIncludeInactiveInput(checked === true)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="includeInactive" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                    Show Inactive
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 min-h-0 bg-card rounded-[1.5rem] border border-border shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              {isFetching && !isLoading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand/20 overflow-hidden z-50">
                  <div className="h-full bg-brand animate-pulse w-full" />
                </div>
              )}
             <Table className="w-full border-separate border-spacing-0 table-auto">
               <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
                 <TableRow className="hover:bg-muted/95 transition-colors">
                   <TableHead className="w-[48px] px-3 py-3 border-b border-border text-center">
                     <Checkbox
                       checked={selectedRows.size > 0 && selectedRows.size === allJobs.length}
                       onCheckedChange={() => toggleSelectAll()}
                       className="h-4 w-4 rounded border-border"
                       disabled={!canDeleteJobs}
                     />
                   </TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Job ID</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Position</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Type</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Location</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground text-center">Headcount</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Stage</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground text-center">Salary Range</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground">Client</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right pr-6">Created By</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading && allJobs.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Jobs...</span>
                     </TableCell>
                   </TableRow>
                 ) : allJobs.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <Search className="size-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">No active jobs found</p>
                     </TableCell>
                   </TableRow>
                 ) : (
                   allJobs.map((job: any) => (
                     <TableRow
                       key={job._id}
                       className={cn(
                         "group border-b border-border transition-all duration-300",
                         "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
                         selectedRows.has(job._id) ? "bg-brand/[0.02]" : ""
                       )}
                     >
                       <TableCell className="px-3 py-2.5 w-[48px] text-center">
                         <Checkbox
                           checked={selectedRows.has(job._id)}
                           onCheckedChange={() => toggleRowSelection(job._id)}
                           className="h-4 w-4 rounded border-border"
                           disabled={!canDeleteJobs}
                           onClick={(e) => e.stopPropagation()}
                         />
                       </TableCell>
                       
                       {/* Job ID */}
                       <TableCell className="px-3 py-2.5">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span 
                               className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-brand transition-colors block truncate max-w-[80px]"
                               onClick={() => router.push(`/jobs/${job._id}`)}
                             >
                               {job.jobId || "—"}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                             {job.jobId}
                           </TooltipContent>
                         </Tooltip>
                       </TableCell>
 
                       {/* Position Name */}
                       <TableCell className="px-3 py-2.5">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <div 
                               className="cursor-pointer group/title max-w-[160px] truncate"
                               onClick={() => router.push(`/jobs/${job._id}`)}
                             >
                               <span className="text-[13px] font-bold text-foreground group-hover/title:text-brand transition-all block truncate">
                                 {job.jobTitle}
                               </span>
                             </div>
                           </TooltipTrigger>
                           <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[11px] border-none shadow-2xl">
                             {job.jobTitle}
                           </TooltipContent>
                         </Tooltip>
                       </TableCell>
 
                       {/* Job Type */}
                       <TableCell className="px-3 py-2.5">
                         <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] font-medium text-foreground capitalize truncate max-w-[80px]">
                              {job.jobType}
                            </span>
                         </div>
                       </TableCell>
 
                       {/* Location */}
                       <TableCell className="px-3 py-2.5">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <div className="flex items-center gap-1.5 max-w-[120px] truncate cursor-help">
                                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span className="text-[11px] font-medium text-foreground truncate">
                                  {Array.isArray(job.location) ? job.location.join(", ") : job.location ?? "—"}
                                </span>
                             </div>
                           </TooltipTrigger>
                           <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                             {Array.isArray(job.location) ? job.location.join(", ") : job.location ?? "Global"}
                           </TooltipContent>
                         </Tooltip>
                       </TableCell>
 
                       {/* Headcount */}
                       <TableCell className="px-3 py-2.5 text-center">
                         <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border">
                            <Users2 className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                            <span className="text-[10px] font-black text-foreground">{job.headcount}</span>
                         </div>
                       </TableCell>
 
                       {/* Stage */}
                       <TableCell className="px-3 py-2.5">
                         <div className="scale-90 origin-left">
                           <JobStageBadge
                             stage={toJobStage(job.stage)}
                             onStageChange={(newStage) => handleStageChange(job._id, newStage)}
                             disabled={!canModifyJobs}
                           />
                         </div>
                       </TableCell>
 
                       {/* Salary Range */}
                       <TableCell className="px-3 py-2.5 text-center">
                         <div className="flex flex-col items-center leading-none gap-0.5">
                            <span className="text-[11px] font-black text-foreground">
                               {job.salaryCurrency} {job.maximumSalary}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Max Range</span>
                         </div>
                       </TableCell>
 
                       {/* Client */}
                       <TableCell className="px-3 py-2.5">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span className="text-[11px] font-bold text-foreground block truncate max-w-[120px] cursor-help">
                                {typeof job.client === "object" ? job.client?.name : job.client || "—"}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                             {typeof job.client === "object" ? job.client?.name : job.client || "No Client Specified"}
                           </TooltipContent>
                         </Tooltip>
                       </TableCell>
 
                       {/* Created By */}
                       <TableCell className="px-3 py-2.5 text-right pr-6">
                         <span className="text-[11px] font-bold text-foreground block truncate max-w-[120px] ml-auto">
                            {job.createdBy?.name || (typeof job.createdBy === 'string' ? job.createdBy : "System")}
                         </span>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </div>
           
           {/* Pagination */}
           <div className="flex-shrink-0 bg-card border-t border-border p-1.5">
             <JobPaginationControls
               currentPage={currentPage}
               totalPages={totalPages}
               totalJobs={totalJobs}
               pageSize={pageSize}
               setPageSize={(s) => { setPageSize(s); setCurrentPage(1); }}
               handlePageChange={handlePageChange}
               jobsLength={allJobs.length}
             />
           </div>
         </div>
       </div>
 
       <ConfirmStageChangeDialog
         open={confirmOpen}
         onOpenChange={setConfirmOpen}
         onConfirm={confirmStageChange}
       />
 
       <DeleteConfirmationDialog
         isOpen={showDeleteDialog}
         onClose={() => setShowDeleteDialog(false)}
         onConfirm={confirmDeleteSelected}
         title={`Delete ${selectedRows.size} job(s)?`}
         description={`Confirm deletion of ${selectedRows.size} job requirements.`}
         confirmText={isDeleting ? 'Processing...' : 'Delete Permanently'}
         isDeleting={isDeleting}
       />
 
       {canModifyJobs && <CreateJobRequirementForm open={open} onOpenChange={setOpen} />}
 
       <ExportDialog
         isOpen={openExportDialog}
         onClose={() => setOpenExportDialog(false)}
         title="Export Jobs"
         description="Generate CSV report for job requirements."
         onExport={(params: ExportFilterParams | undefined) => exportJobsMutation(params)}
         filename="jobs_report"
       />
     </TooltipProvider>
   );
 }
