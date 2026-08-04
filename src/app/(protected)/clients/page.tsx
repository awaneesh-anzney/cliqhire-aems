"use client";
 import { useState, useMemo, useEffect } from "react";
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
import { Loader, Building2, Search, SlidersHorizontal, X, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { useExportClients } from "@/hooks/useExportClients";
import { useClients } from "@/hooks/useClient";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 
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
   clientType?: string;
   nextFollowUpDate?: string;
   lastContactedAt?: string;
 }
 

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
 
 export default function ClientsPage() {
   const { user } = useAuth();
   const { hasPermission } = usePermissions();
   const isAdmin = user?.role === 'ADMIN';
 
   const canViewClients = isAdmin || hasPermission("clients", "view");
   const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");
   const canDeleteClients = isAdmin || hasPermission("clients", "delete");
 
   const [open, setOpen] = useState(false);
   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
   const [openExportDialog, setOpenExportDialog] = useState(false);
   const { mutateAsync: exportClientsMutation } = useExportClients();

   const [searchInput, setSearchInput] = useState("");
   const [nameInput, setNameInput] = useState("");
   const [clientIdInput, setClientIdInput] = useState("");
   const [emailInput, setEmailInput] = useState("");
   const [phoneNumberInput, setPhoneNumberInput] = useState("");
   const [industryInput, setIndustryInput] = useState("");
   const [locationInput, setLocationInput] = useState("");
   const [selectedClientStage, setSelectedClientStage] = useState<string>("All");

   const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

   const debouncedSearch = useDebounce(searchInput, 300);
   const debouncedName = useDebounce(nameInput, 300);
   const debouncedClientId = useDebounce(clientIdInput, 300);
   const debouncedEmail = useDebounce(emailInput, 300);
   const debouncedPhoneNumber = useDebounce(phoneNumberInput, 300);
   const debouncedIndustry = useDebounce(industryInput, 300);
   const debouncedLocation = useDebounce(locationInput, 300);
 
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
 
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ clientId: string; stage: Client["clientStage"]; } | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ clientId: string; status: ClientStageStatus; } | null>(null);
    const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => {
      setCurrentPage(1);
    }, [
      debouncedSearch,
      debouncedName,
      debouncedClientId,
      debouncedEmail,
      debouncedPhoneNumber,
      debouncedIndustry,
      debouncedLocation,
      selectedClientStage,
    ]);

    const clearAllFilters = () => {
      setSearchInput("");
      setNameInput("");
      setClientIdInput("");
      setEmailInput("");
      setPhoneNumberInput("");
      setIndustryInput("");
      setLocationInput("");
      setSelectedClientStage("All");
      setCurrentPage(1);
    };

    const { data: clientsPage, isLoading, isFetching, refetch } = useClients({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      name: debouncedName || undefined,
      clientId: debouncedClientId || undefined,
      email: debouncedEmail || undefined,
      phoneNumber: debouncedPhoneNumber || undefined,
      industry: debouncedIndustry || undefined,
      location: debouncedLocation || undefined,
      clientStage: selectedClientStage === "All" ? undefined : selectedClientStage,
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
       clientType: (c as any).clientType || "",
       nextFollowUpDate: (c as any).nextFollowUpDate || "",
       lastContactedAt: (c as any).lastContactedAt || "",
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
 
   const pagedClients = allClients;
 
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
         <div className="text-center font-black text-foreground tracking-tight">Access Denied</div>
         <div className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">You do not have permission to view clients.</div>
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
       <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Compressed Sticky Header Section */}
         <div className="flex-shrink-0 bg-card rounded-[1.2rem] border border-border shadow-sm overflow-hidden flex flex-col">
            <Dashboardheader
              setOpen={setOpen}
              setFilterOpen={() => setAdvancedFiltersOpen(prev => !prev)}
              initialLoading={isFetching}
              heading="Clients"
              buttonText="Create"
              showCreateButton={canModifyClients}
              showFilterButton={true}
              onRefresh={() => refetch()}
              selectedCount={selectedRows.size}
              onDelete={handleDeleteSelected}
              isFilterActive={!!searchInput.trim() || !!nameInput.trim() || !!clientIdInput.trim() || !!emailInput.trim() || !!phoneNumberInput.trim() || !!industryInput.trim() || !!locationInput.trim() || selectedClientStage !== "All"}
              filterCount={(searchInput.trim() ? 1 : 0) + (nameInput.trim() ? 1 : 0) + (clientIdInput.trim() ? 1 : 0) + (emailInput.trim() ? 1 : 0) + (phoneNumberInput.trim() ? 1 : 0) + (industryInput.trim() ? 1 : 0) + (locationInput.trim() ? 1 : 0) + (selectedClientStage !== "All" ? 1 : 0)}
              onExport={() => setOpenExportDialog(true)}
            />
          </div>

          {/* Real-time Filter Bar */}
          <div className="flex-shrink-0 bg-card rounded-[1.2rem] border border-border shadow-sm px-4 py-3 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Global Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Global quick search (name or clientId)..."
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

              {/* Stage Filter Dropdown */}
              <div className="w-[160px]">
                <Select value={selectedClientStage} onValueChange={setSelectedClientStage}>
                  <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="All" className="text-xs font-medium">All Stages</SelectItem>
                    <SelectItem value="Lead" className="text-xs font-medium">Lead</SelectItem>
                    <SelectItem value="Engaged" className="text-xs font-medium">Engaged</SelectItem>
                    <SelectItem value="Signed" className="text-xs font-medium">Signed</SelectItem>
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
                {(nameInput || clientIdInput || emailInput || phoneNumberInput || industryInput || locationInput) && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>

              {/* Reset All Filters Button */}
              {(searchInput || nameInput || clientIdInput || emailInput || phoneNumberInput || industryInput || locationInput || selectedClientStage !== "All") && (
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

            {/* Collapsible Advanced Filters Panel */}
            {advancedFiltersOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border/60 animate-in slide-in-from-top-2 duration-300">
                {/* Name Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                  />
                </div>

                {/* Client ID Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client ID</label>
                  <input
                    type="text"
                    placeholder="Filter by ID..."
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
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
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                  />
                </div>

                {/* Industry Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    placeholder="Filter by industry..."
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                  />
                </div>

                {/* Location Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full px-3 h-8 text-xs bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-all font-medium text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
  
          {/* Table Content Area */}
          <div className="flex-1 min-h-0 bg-card rounded-[1.2rem] border border-border shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              {isFetching && !isLoading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand/20 overflow-hidden z-50">
                  <div className="h-full bg-brand animate-pulse w-full" />
                </div>
              )}
             <Table className="w-full border-separate border-spacing-0 table-auto">
               <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
                 <TableRow className="hover:bg-muted/95 transition-colors">
                   <TableHead className="w-[48px] px-3 py-3 border-b border-border">
                     <div className="flex items-center justify-center">
                       <Checkbox
                         checked={selectedRows.size > 0 && selectedRows.size === pagedClients.length}
                         onCheckedChange={() => toggleSelectAll()}
                         className="h-4 w-4 rounded border-border"
                       />
                     </div>
                   </TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Industry</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Stage</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Age</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Jobs</TableHead>
                   <TableHead className="px-3 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Created By</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading && allClients.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : pagedClients.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="h-64 text-center">
                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">No clients available</p>
                     </TableCell>
                   </TableRow>
                 ) : (
                   pagedClients.map((client: Client) => (
                     <TableRow
                       key={client.id ?? client._id}
                       className={cn(
                         "group border-b border-border transition-all duration-300",
                         "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
                         selectedRows.has(client.id) ? "bg-brand/[0.02]" : ""
                       )}
                     >
                       <TableCell className="px-3 py-2.5 w-[48px]">
                         <div className="flex items-center justify-center">
                           <Checkbox
                             checked={selectedRows.has(client.id)}
                             onCheckedChange={() => toggleRowSelection(client.id)}
                             className="h-4 w-4 rounded border-border"
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
           <div className="flex-shrink-0 bg-card border-t border-border py-2 px-3">
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
