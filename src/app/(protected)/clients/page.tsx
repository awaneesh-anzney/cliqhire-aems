"use client";
 import { useState, useMemo } from "react";
 import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
 import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
 import {
   updateClientStage,
   updateClientStageStatus,
   ClientStageStatus,
   deleteClient,
 } from "@/services/clientService";
 
 import Dashboardheader from "@/components/dashboard-header";
 import ClientTableRow from "@/components/clients/ClientTableRow";
 import ClientPaginationControls from "@/components/clients/ClientPaginationControls";
 import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
 import { Loader, Building2, Search, FilterX, Lock } from "lucide-react";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
 import { FilterModal } from "@/components/filter-modal";
 import { Checkbox } from "@/components/ui/checkbox";
 import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
 import { useExportClients } from "@/hooks/useExportClients";
 import { useClients } from "@/hooks/useClient";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import { TooltipProvider } from "@/components/ui/tooltip";
 
 interface Client {
   clientId?: string;
   _id?: string;
   id: string;
   name: string;
   industry: string;
   countryOfBusiness: string;
   clientStage: "Lead" | "Engaged" | "Signed";
   clientSubStage?: ClientStageStatus;
   owner: string;
   team: string;
   createdAt: string;
   jobCount: number;
   incorporationDate: string;
   createdBy?: string;
   clientAge?: {
     years: number;
     months: number;
     days: number;
   };
 }
 
 interface Filters {
   name: string;
   industry: string;
   maxAge: string;
 }
 
 export default function ClientsPage() {
   const { user } = useAuth();
   const { hasPermission } = usePermissions();
   const isAdmin = user?.role === 'ADMIN';
 
   const canViewClients = isAdmin || hasPermission("clients", "view");
   const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");
   const canDeleteClients = isAdmin || hasPermission("clients", "delete");
 
   const [open, setOpen] = useState(false);
   const [filterOpen, setFilterOpen] = useState(false);
   const [filterName, setFilterName] = useState("");
   const [filterIndustry, setFilterIndustry] = useState("");
   const [filterLocation, setFilterLocation] = useState("");
   const [filterStages, setFilterStages] = useState<Client["clientStage"][]>([]);
   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
   const [openExportDialog, setOpenExportDialog] = useState(false);
   const { mutateAsync: exportClientsMutation } = useExportClients();
 
   const toggleRowSelection = (clientId: string) => {
     if (!canDeleteClients) return;
     setSelectedRows(prevSelected => {
       const newSelected = new Set(prevSelected);
       if (newSelected.has(clientId)) {
         newSelected.delete(clientId);
       } else {
         newSelected.add(clientId);
       }
       return newSelected;
     });
   };
 
   const toggleSelectAll = () => {
     if (!canDeleteClients) return;
     if (selectedRows.size === pagedClients.length && pagedClients.length > 0) {
       setSelectedRows(new Set());
     } else {
       const newSelectedRows = new Set(selectedRows);
       pagedClients.forEach((client: Client) => {
         newSelectedRows.add(client.id);
       });
       setSelectedRows(newSelectedRows);
     }
   };
 
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
 
   const handleDeleteSelected = async () => {
     if (selectedRows.size === 0 || !canDeleteClients) return;
     setShowDeleteDialog(true);
   };
 
   const confirmDeleteSelected = async () => {
     if (selectedRows.size === 0 || !canDeleteClients) return;
     setIsDeleting(true);
     try {
       await Promise.all(
         Array.from(selectedRows).map((clientId) => deleteClient(clientId))
       );
       await refetch();
       setSelectedRows(new Set());
       toast.success(`${selectedRows.size} client(s) deleted successfully`);
     } catch (error) {
       toast.error('Failed to delete selected clients. Please try again.');
     } finally {
       setIsDeleting(false);
       setShowDeleteDialog(false);
     }
   };
 
   const [filters, setFilters] = useState<Filters>({
     name: "",
     industry: "",
     maxAge: "",
   });
 
   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
   const [pendingChange, setPendingChange] = useState<{ clientId: string; stage: Client["clientStage"]; } | null>(null);
   const [pendingStatusChange, setPendingStatusChange] = useState<{ clientId: string; status: ClientStageStatus; } | null>(null);
   const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
   const [currentPage, setCurrentPage] = useState<number>(1);
   const [pageSize, setPageSize] = useState<number>(10);
 
   const { data: clientsPage, isLoading, isFetching, refetch } = useClients({
     page: currentPage,
     limit: pageSize,
     ...(filterName.trim() && { search: filterName.trim() }),
     ...(filterIndustry.trim() && { industry: filterIndustry.trim() }),
   });
 
   const allClients: Client[] = useMemo(() => {
     return (clientsPage?.clients ?? []).map((c) => ({
       clientId: c.clientId,
       _id: c._id,
       id: c._id,
       name: c.name,
       industry: c.industry ?? "",
       countryOfBusiness: (c as any).countryOfBusiness ?? c.location ?? "",
       clientStage: (c.clientStage ?? "Lead") as Client["clientStage"],
       clientSubStage: (c.clientSubStage ?? "") as ClientStageStatus,
       owner: (c as any).owner ?? "",
       team: (c as any).team ?? "",
       createdAt: c.createdAt,
       jobCount: c.jobCount ?? 0,
       incorporationDate: (c as any).incorporationDate ?? "",
       createdBy: c.createdBy?.name || (typeof c.createdBy === 'string' ? c.createdBy : ""),
       clientAge: (c as any).clientAge,
     }));
   }, [clientsPage]);
 
   const handleStageChange = (clientId: string, newStage: Client["clientStage"]) => {
     if (!canModifyClients) return;
     setPendingChange({ clientId, stage: newStage });
     setShowConfirmDialog(true);
   };
 
   const handleStageStatusChange = (clientId: string, newStatus: ClientStageStatus) => {
     if (!canModifyClients) return;
     setPendingStatusChange({ clientId, status: newStatus });
     setShowStatusConfirmDialog(true);
   };
 
   const pagedClients = useMemo(() => {
     let result = allClients;
     const locQ = filterLocation.trim().toLowerCase();
     const stagesQ = filterStages;
     if (locQ) result = result.filter((c) => (c.countryOfBusiness || "").toLowerCase().includes(locQ));
     if (stagesQ.length > 0) result = result.filter((c) => stagesQ.includes(c.clientStage));
     if (filters.maxAge) {
       const maxAgeMonths = parseInt(filters.maxAge);
       if (!isNaN(maxAgeMonths)) {
         result = result.filter((c) => {
           if (!c.clientAge) return false;
           return (c.clientAge.years * 12 + c.clientAge.months) <= maxAgeMonths;
         });
       }
     }
     return result;
   }, [allClients, filterLocation, filterStages, filters.maxAge]);
 
   const totalClientsCalc = clientsPage?.totalCount ?? 0;
   const totalPagesCalc = clientsPage?.totalPages ?? 1;
   const handlePageChange = (newPage: number) => {
     if (newPage >= 1 && newPage <= totalPagesCalc) setCurrentPage(newPage);
   };
 
   const [error, setError] = useState<string | null>(null);
   const handleConfirmStatusChange = async () => {
     if (!pendingStatusChange) return;
     setError(null);
     try {
       await updateClientStageStatus(pendingStatusChange.clientId, pendingStatusChange.status);
       refetch();
     } catch (err: any) {
       setError(err.message || "An unexpected error occurred.");
     } finally {
       setShowStatusConfirmDialog(false);
     }
   };
 
   const handleConfirmChange = async () => {
     if (!pendingChange) return;
     setError(null);
     try {
       await updateClientStage(pendingChange.clientId, pendingChange.stage);
       setShowConfirmDialog(false);
       refetch();
     } catch (error: any) {
       setError(error.message || "Failed to update client stage. Please try again.");
     }
   };
 
   if (!canViewClients) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
         <div className="p-4 rounded-full bg-red-50 text-red-500">
           <Lock className="w-8 h-8" />
         </div>
         <div className="text-center font-black text-slate-900 tracking-tight">Access Denied</div>
         <div className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest">You do not have permission to view clients.</div>
       </div>
     );
   }
 
   return (
     <TooltipProvider delayDuration={200}>
       <ConfirmDialog
         open={showConfirmDialog}
         onOpenChange={setShowConfirmDialog}
         onConfirm={handleConfirmChange}
         onCancel={() => setShowConfirmDialog(false)}
         title="Confirm Stage Change"
         description="Are you sure you want to update the client stage?"
         confirmText="Confirm"
         cancelText="Cancel"
         loading={isLoading}
         error={error}
       />
 
       <ConfirmDialog
         open={showStatusConfirmDialog}
         onOpenChange={setShowStatusConfirmDialog}
         onConfirm={handleConfirmStatusChange}
         onCancel={() => setShowStatusConfirmDialog(false)}
         title="Confirm Status Change"
         description="This will update the client's stage status."
         confirmText="Confirm"
         cancelText="Cancel"
         loading={isLoading}
         error={error}
       />
 
       <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Compressed Sticky Header Section */}
         <div className="flex-shrink-0 relative overflow-hidden bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-1.5">
           <div className="absolute top-0 right-0 w-48 h-full bg-brand/5 rounded-full blur-2xl pointer-events-none" />
           <Dashboardheader
             setOpen={setOpen}
             setFilterOpen={setFilterOpen}
             initialLoading={isLoading || isFetching}
             heading="Clients"
             buttonText="Create"
             showCreateButton={canModifyClients}
             onRefresh={() => refetch()}
             selectedCount={selectedRows.size}
             onDelete={handleDeleteSelected}
             isFilterActive={Boolean(filterName || filterIndustry || filterLocation || filterStages.length > 0)}
             filterCount={(filterName ? 1 : 0) + (filterIndustry ? 1 : 0) + (filterLocation ? 1 : 0) + (filterStages.length > 0 ? 1 : 0)}
             onExport={() => setOpenExportDialog(true)}
           />
         </div>
 
         {/* Table Content Area - Optimized for No Horizontal Scroll */}
         <div className="flex-1 min-h-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
           <div className="flex-1 overflow-auto custom-scrollbar relative">
             <Table className="w-full border-separate border-spacing-0 table-auto">
               <TableHeader className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md">
                 <TableRow className="hover:bg-slate-50/95 transition-colors">
                   <TableHead className="w-[48px] px-3 py-3 border-b border-slate-100">
                     <div className="flex items-center justify-center">
                       <Checkbox
                         checked={selectedRows.size > 0 && selectedRows.size === pagedClients.length}
                         onCheckedChange={() => toggleSelectAll()}
                         className="h-4 w-4 rounded border-slate-300"
                       />
                     </div>
                   </TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">ID</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Name</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Industry</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Location</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Stage</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Status</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Age</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Jobs</TableHead>
                   <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right pr-6">Created By</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading && allClients.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : pagedClients.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No clients available</p>
                     </TableCell>
                   </TableRow>
                 ) : (
                   pagedClients.map((client: Client) => (
                     <TableRow
                       key={client.id ?? client._id}
                       className={cn(
                         "group border-b border-slate-50 transition-all duration-300",
                         "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
                         selectedRows.has(client.id) ? "bg-brand/[0.02]" : ""
                       )}
                     >
                       <TableCell className="px-3 py-2.5 w-[48px]">
                         <div className="flex items-center justify-center">
                           <Checkbox
                             checked={selectedRows.has(client.id)}
                             onCheckedChange={() => toggleRowSelection(client.id)}
                             className="h-4 w-4 rounded border-slate-300"
                             onClick={(e) => e.stopPropagation()}
                           />
                         </div>
                       </TableCell>
                       <ClientTableRow
                         client={client}
                         onStageChange={handleStageChange}
                         onStatusChange={handleStageStatusChange}
                         canModify={canModifyClients}
                       />
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </div>
           
           {/* Compact Pagination Footer */}
           <div className="flex-shrink-0 bg-white border-t border-slate-100 p-1.5">
             <ClientPaginationControls
               currentPage={currentPage}
               totalPages={totalPagesCalc}
               totalClients={totalClientsCalc}
               pageSize={pageSize}
               setPageSize={(s) => { setPageSize(s); setCurrentPage(1); }}
               handlePageChange={handlePageChange}
               clientsLength={allClients?.length}
             />
           </div>
         </div>
 
         {canModifyClients && <CreateClientModal open={open} onOpenChange={setOpen} />}
 
         <DeleteConfirmationDialog
           isOpen={showDeleteDialog}
           onClose={() => setShowDeleteDialog(false)}
           onConfirm={confirmDeleteSelected}
           title={`Delete ${selectedRows.size} client(s)?`}
           description={`Confirming deletion of ${selectedRows.size} records.`}
           confirmText={isDeleting ? "Processing..." : "Delete"}
           cancelText="Cancel"
           isDeleting={isDeleting}
         />
 
         <FilterModal
           open={filterOpen}
           onOpenChange={setFilterOpen}
           module="clients"
           initialFilters={{
             name: filterName,
             industry: filterIndustry,
             location: filterLocation,
             stage: filterStages,
           }}
           onApplyFilters={(newFilters) => {
             setFilterName(newFilters.name || "");
             setFilterIndustry(newFilters.industry || "");
             setFilterLocation(newFilters.location || "");
             setFilterStages(newFilters.stage || []);
             setCurrentPage(1);
             setFilterOpen(false);
           }}
         />
 
         <ExportDialog
           isOpen={openExportDialog}
           onClose={() => setOpenExportDialog(false)}
           title="Export"
           description="Download CSV report."
           onExport={(params: ExportFilterParams | undefined) => exportClientsMutation(params)}
           filename="clients"
         />
       </div>
     </TooltipProvider>
   );
 }
