"use client";
 import { Candidate, candidateService } from "@/services/candidateService";
 import { useCandidates, useUpdateCandidate, useDeleteCandidate } from "@/hooks/useCandidate";
 import { formatPhoneNumber } from "@/lib/countryCodes";
 import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
 import { Loader, Mail, Phone, MapPin, Briefcase, FileText, Search, Lock } from "lucide-react";
 import { CandidatesEmptyState } from "../../../components/candidates/empty-states";
 import { useState } from "react";
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
 import CandidateFilter, { CandidateStatus as FilterStatus } from "@/components/candidates/CandidateFilter";
 import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
 import { useExportCandidates } from "@/hooks/useExportCandidates";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 
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
   const [filterOpen, setFilterOpen] = useState(false);
   const [filterName, setFilterName] = useState("");
   const [filterEmail, setFilterEmail] = useState("");
   const [filterExperience, setFilterExperience] = useState("");
   const [filterLocation, setFilterLocation] = useState("");
   const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>([]);
   const [openExportDialog, setOpenExportDialog] = useState(false);
 
   const { data, isLoading: initialLoading, isFetching, refetch } = useCandidates({
     page: currentPage,
     limit: pageSize,
     name: filterName || undefined,
     email: filterEmail || undefined,
     experience: filterExperience || undefined,
     location: filterLocation || undefined,
     status: selectedStatuses.join(",") || undefined,
   });
   const candidates: Candidate[] = data?.candidates ?? [];
   const [open, setOpen] = useState(false);
 
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
         <div className="text-center font-black text-slate-900 tracking-tight">Access Denied</div>
         <div className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest">Permission required to view candidates.</div>
       </div>
     );
   }
 
   return (
     <TooltipProvider delayDuration={200}>
       <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Page Header */}
         <div className="flex-shrink-0 relative overflow-hidden bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-1.5">
           <div className="absolute top-0 right-0 w-48 h-full bg-brand/5 rounded-full blur-2xl pointer-events-none" />
           <Dashboardheader
             setOpen={setOpen}
             setFilterOpen={setFilterOpen}
             initialLoading={isFetching}
             heading="Candidates"
             buttonText="Add Candidate"
             showCreateButton={canModifyCandidates}
             showFilterButton={true}
             isFilterActive={selectedStatuses.length > 0 || !!filterName.trim() || !!filterEmail.trim() || !!filterExperience.trim() || !!filterLocation.trim()}
             filterCount={(selectedStatuses.length > 0 ? 1 : 0) + (filterName.trim() ? 1 : 0) + (filterEmail.trim() ? 1 : 0) + (filterExperience.trim() ? 1 : 0) + (filterLocation.trim() ? 1 : 0)}
             selectedCount={selectedRows.size}
             onDelete={handleDeleteSelected}
             onRefresh={() => refetch()}
             onExport={() => setOpenExportDialog(true)}
           />
         </div>
 
         {/* Content Table Area */}
         <div className="flex-1 min-h-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
           <div className="flex-1 overflow-auto custom-scrollbar relative">
             <Table className="w-full border-separate border-spacing-0 table-auto">
               <TableHeader className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md">
                 <TableRow className="hover:bg-slate-50/95 transition-colors">
                   <TableHead className="w-[48px] px-3 py-3 border-b border-slate-100 text-center">
                     <Checkbox
                       checked={selectedRows.size > 0 && selectedRows.size === candidates.length}
                       onCheckedChange={() => toggleSelectAll()}
                       className="h-4 w-4 rounded border-slate-300"
                       disabled={!canDeleteCandidates}
                     />
                   </TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">ID</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Name</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Contact</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Location</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Status</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Experience</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Resume</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right pr-6">Created By</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {initialLoading && candidates.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Talent Pool...</span>
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
                         "group border-b border-slate-50 transition-all duration-300",
                         "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
                         candidate._id && selectedRows.has(candidate._id) ? "bg-brand/[0.02]" : ""
                       )}
                     >
                       <TableCell className="px-3 py-2.5 w-[48px] text-center">
                         <Checkbox
                           checked={candidate._id ? selectedRows.has(candidate._id) : false}
                           onCheckedChange={() => candidate._id && toggleRowSelection(candidate._id)}
                           className="h-4 w-4 rounded border-slate-300"
                           disabled={!canDeleteCandidates}
                           onClick={(e) => e.stopPropagation()}
                         />
                       </TableCell>
 
                       {/* Profile ID */}
                       <TableCell className="px-3 py-2.5">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span 
                               className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-brand transition-colors block truncate max-w-[80px]"
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
                               <span className="text-[13px] font-bold text-slate-900 group-hover/title:text-brand transition-all block truncate">
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
                                   <Mail className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                                   <span className="text-[10px] font-medium text-slate-600 truncate">{candidate.email}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                                {candidate.email}
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 overflow-hidden cursor-help">
                                   <Phone className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                                   <span className="text-[10px] font-medium text-slate-600 truncate">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}</span>
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
                                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                <span className="text-[11px] font-medium text-slate-600 truncate">{candidate.location || "Global"}</span>
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
                             <Briefcase className="w-3 h-3 text-slate-300 shrink-0" />
                             <span className="text-[11px] font-bold text-slate-700 truncate">{candidate.experience || "N/A"}</span>
                          </div>
                       </TableCell>
 
                       {/* Resume */}
                       <TableCell className="px-3 py-2.5 text-center">
                         {candidate.resume ? (
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <a
                                 href={candidate.resume.startsWith('http') ? candidate.resume : `${process.env.NEXT_PUBLIC_API_URL || ''}${candidate.resume.startsWith('/') ? '' : '/'}${candidate.resume}`}
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
                           <span className="text-[10px] font-bold text-slate-300 italic">No File</span>
                         )}
                       </TableCell>
 
                       {/* Created By */}
                       <TableCell className="px-3 py-2.5 text-right pr-6">
                          <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[120px] ml-auto">
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
           <div className="flex-shrink-0 bg-white border-t border-slate-100 p-1.5">
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
 
         <CandidateFilter
           open={filterOpen}
           onOpenChange={setFilterOpen}
           name={filterName}
           onNameChange={setFilterName}
           email={filterEmail}
           onEmailChange={setFilterEmail}
           experience={filterExperience}
           onExperienceChange={setFilterExperience}
           location={filterLocation}
           onLocationChange={setFilterLocation}
           selectedStatuses={selectedStatuses}
           onStatusesChange={setSelectedStatuses}
           onApply={() => { setFilterOpen(false); setCurrentPage(1); }}
           onClear={() => { setFilterName(""); setFilterEmail(""); setFilterExperience(""); setFilterLocation(""); setSelectedStatuses([]); setCurrentPage(1); }}
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
