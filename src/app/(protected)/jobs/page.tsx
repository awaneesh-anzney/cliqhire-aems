"use client";
 import { Button } from "@/components/ui/button";
 import { Plus, SlidersHorizontal, RefreshCcw, MoreVertical, Loader, X, Briefcase, MapPin, Users2, Calendar, Search, FilterX, Lock, Hash, DollarSign } from "lucide-react";
 import { toast } from "sonner";
 import { useState, useMemo } from "react";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Label } from "@/components/ui/label";
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
 import { FilterModal } from "@/components/filter-modal";
 import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
 import { useExportJobs } from "@/hooks/useExportJobs";
 import { useJobs, useUpdateJobStage, useDeleteJob } from "@/hooks/useJobs";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 
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
   const [filterOpen, setFilterOpen] = useState(false);
   const [filterPositionName, setFilterPositionName] = useState("");
   const [filterJobOwner, setFilterJobOwner] = useState("");
   const [selectedStages, setSelectedStages] = useState<JobStage[]>([]);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [pendingStageChange, setPendingStageChange] = useState<{
     jobId: string;
     newStage: JobStage;
   } | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [openExportDialog, setOpenExportDialog] = useState(false);
   const { mutateAsync: exportJobsMutation } = useExportJobs();
 
   const router = useRouter();
   const { mutateAsync: updateStageMutation } = useUpdateJobStage();
   const { mutateAsync: deleteJobMutation } = useDeleteJob();
 
   const { data: jobsData, isLoading, isFetching, refetch } = useJobs({
     page: currentPage,
     limit: pageSize,
     ...(filterPositionName.trim() && { search: filterPositionName.trim() }),
   });
 
   const allJobs = useMemo(() => {
       let result = jobsData?.jobs ?? [];
       if (selectedStages.length > 0 || filterJobOwner) {
           const owner = filterJobOwner.trim().toLowerCase();
           result = result.filter((job: any) => {
             const jobStage = (job.stage || job.jobStatus) as JobStage | undefined;
             const matchesStage = selectedStages.length === 0 || (jobStage ? selectedStages.includes(jobStage) : false);
             const clientLabel = typeof job.client === "object" ? (job.client?.name ?? "") : (job.client ?? "");
             const matchesOwner = owner === "" || clientLabel.toLowerCase().includes(owner);
             return matchesStage && matchesOwner;
           });
       }
       return result;
   }, [jobsData, selectedStages, filterJobOwner]);
 
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
             setFilterOpen={setFilterOpen}
             initialLoading={isLoading || isFetching}
             onRefresh={() => refetch()}
             onDelete={handleDeleteSelected}
             heading="Jobs"
             buttonText="Add Job"
             selectedCount={selectedRows.size}
             showCreateButton={canModifyJobs}
             isFilterActive={selectedStages.length > 0 || !!filterPositionName.trim() || !!filterJobOwner.trim()}
             filterCount={(selectedStages.length > 0 ? 1 : 0) + (filterPositionName.trim() ? 1 : 0) + (filterJobOwner.trim() ? 1 : 0)}
             onExport={() => setOpenExportDialog(true)}
           />
         </div>
 
         {/* Table Area */}
         <div className="flex-1 min-h-0 bg-card rounded-[1.5rem] border border-border shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
           <div className="flex-1 overflow-auto custom-scrollbar relative">
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
 
       <FilterModal
         open={filterOpen}
         onOpenChange={setFilterOpen}
         module="jobs"
         initialFilters={{
           name: filterPositionName,
           owner: filterJobOwner,
           stage: selectedStages,
         }}
         onApplyFilters={(newFilters) => {
           setFilterPositionName(newFilters.name || "");
           setFilterJobOwner(newFilters.owner || "");
           setSelectedStages(newFilters.stage || []);
           setCurrentPage(1);
           setFilterOpen(false);
         }}
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
