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
import { Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FilterModal } from "@/components/filter-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { useExportClients } from "@/hooks/useExportClients";
import { useClients } from "@/hooks/useClient";
import { usePermissions } from "@/contexts/PermissionContext";

const columnsArr = [
  "", // Empty header for the checkbox column
  "Name",
  "Industry",
  "Location",
  "Stage",
  "Stage Status",
  "Client Age",
  "Job Count",
  "Created By",
];

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

  // Toggle row selection
  const toggleRowSelection = (clientId: string) => {
    if (!canDeleteClients) return; // Prevent selection if user can't delete
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

  // Toggle all rows selection
  const toggleSelectAll = () => {
    if (!canDeleteClients) return; // Prevent selection if user can't delete
    if (selectedRows.size === pagedClients.length) {
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
      // Delete all selected clients in parallel
      await Promise.all(
        Array.from(selectedRows).map((clientId) =>
          deleteClient(clientId).catch(error => {
            console.error(`Error deleting client ${clientId}:`, error);
            throw error; // Re-throw to trigger the catch block
          })
        )
      );

      // Refresh the client list after successful deletion
      await refetch();

      // Clear the selection
      setSelectedRows(new Set());

      // Show success message
      toast.success(`${selectedRows.size} client(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting clients:', error);
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
  const [pendingChange, setPendingChange] = useState<{
    clientId: string;
    stage: Client["clientStage"];
  } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: string;
    status: ClientStageStatus;
  } | null>(null);
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data: clientsPage, isLoading, isFetching, refetch } = useClients({
    page: currentPage,
    limit: pageSize,
    ...(filterName.trim() && { search: filterName.trim() }),
    ...(filterIndustry.trim() && { industry: filterIndustry.trim() }),
  });

  // Map API shape to local Client type
  const allClients: Client[] = useMemo(() => {
    return (clientsPage?.clients ?? []).map((c) => ({
      clientId:c.clientId,
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
      createdBy: c.createdBy?.name ?? "",
      clientAge: (c as any).clientAge,
    }));
  }, [clientsPage]);



  // Note: handlePageChange moved below after we derive total pages





  const handleStageChange = (clientId: string, newStage: Client["clientStage"]) => {
    if (!canModifyClients) return;
    setPendingChange({ clientId, stage: newStage });
    setTimeout(() => {
      setShowConfirmDialog(true);
    }, 0);
  };

  const handleStageStatusChange = (clientId: string, newStatus: ClientStageStatus) => {
    if (!canModifyClients) return;
    setPendingStatusChange({ clientId, status: newStatus });
    setTimeout(() => {
      setShowStatusConfirmDialog(true);
    }, 0);
  };

  // Client-side filters applied to the current page data
  const pagedClients = useMemo(() => {
    let result = allClients;

    const locQ = filterLocation.trim().toLowerCase();
    const stagesQ = filterStages;

    if (locQ) {
      result = result.filter((c) => (c.countryOfBusiness || "").toLowerCase().includes(locQ));
    }
    if (stagesQ.length > 0) {
      result = result.filter((c) => stagesQ.includes(c.clientStage));
    }
    if (filters.maxAge) {
      const maxAgeMonths = parseInt(filters.maxAge);
      if (!isNaN(maxAgeMonths)) {
        result = result.filter((c) => {
          if (!c.clientAge) return false;
          const totalMonths = (c.clientAge.years * 12) + c.clientAge.months;
          return totalMonths <= maxAgeMonths;
        });
      }
    }

    return result;
  }, [allClients, filterLocation, filterStages, filters.maxAge]);

  const totalClientsCalc = clientsPage?.totalCount ?? 0;
  const totalPagesCalc = clientsPage?.totalPages ?? 1;

  // Handle page change — triggers new API request via useClients
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPagesCalc) {
      setCurrentPage(newPage);
    }
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
      const updatedClient = await updateClientStage(pendingChange.clientId, pendingChange.stage);
      setShowConfirmDialog(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating client stage:", error);
      setError(error.message || "Failed to update client stage. Please try again.");
    }
  };

  const handleCancelChange = () => {
    setPendingChange(null);
    setShowConfirmDialog(false);
    setError(null);
  };

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">You do not have permission to view clients.</div>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation Dialog for Stage Change */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        title="Confirm Stage Change"
        description="Are you sure you want to update the client stage?"
        confirmText="Confirm"
        cancelText="Cancel"
        loading={isLoading}
        error={error}
        confirmVariant="default"
      />

      {/* Confirmation Dialog for Stage Status Change */}
      <ConfirmDialog
        open={showStatusConfirmDialog}
        onOpenChange={setShowStatusConfirmDialog}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => {
          setShowStatusConfirmDialog(false);
          setError(null);
        }}
        title="Are you sure?"
        description="This will update the client's stage status."
        confirmText="Confirm"
        cancelText="Cancel"
        loading={isLoading}
        error={error}
        confirmVariant="default"
      />

      <div className="flex flex-col bg-slate-50/50 p-2 space-y-2" style={{ height: 'calc(100vh - 20px)' }}>
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2">
          <Dashboardheader
            setOpen={setOpen}
            setFilterOpen={setFilterOpen}
            initialLoading={isLoading || isFetching}
            heading="Clients"
            buttonText="Create Client"
            showCreateButton={canModifyClients}
            onRefresh={() => refetch()}
            selectedCount={selectedRows.size}
            onDelete={handleDeleteSelected}
            isFilterActive={Boolean(filterName || filterIndustry || filterLocation || filterStages.length > 0)}
            filterCount={(filterName ? 1 : 0) + (filterIndustry ? 1 : 0) + (filterLocation ? 1 : 0) + (filterStages.length > 0 ? 1 : 0)}
            onExport={() => setOpenExportDialog(true)}
          />
        </div>

        {/* Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-auto relative">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 hover:bg-slate-50 text-slate-700">
                  <TableHead className="w-12 px-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === pagedClients.length}
                        onCheckedChange={() => toggleSelectAll()}
                        className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">Client Id</TableHead>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Industry</TableHead>
                  <TableHead className="min-w-[150px]">Location</TableHead>
                  <TableHead className="min-w-[120px]">Stage</TableHead>
                  <TableHead className="min-w-[150px]">Stage Status</TableHead>
                  <TableHead className="min-w-[120px]">Client Age</TableHead>
                  <TableHead className="min-w-[100px]">Job Count</TableHead>
                  <TableHead className="min-w-[150px]">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-[calc(100vh-300px)]">
                      <div className="flex items-center justify-center gap-2 flex-col">
                        <Loader className="size-6 animate-spin" />
                        <div className="text-center">Loading clients...</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : allClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-[calc(100vh-300px)] text-center">
                      <div className="py-24">
                        <div className="text-center">No clients found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedClients.map((client: Client) => (
                    <TableRow
                      key={client.id ?? client._id}
                      className={`hover:bg-muted/50 ${selectedRows.has(client.id) ? 'bg-brand/5' : ''}`}
                    >
                      <TableCell className="px-4 py-2 w-12">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedRows.has(client.id)}
                            onCheckedChange={() => toggleRowSelection(client.id)}
                            className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </TableCell>
                      <ClientTableRow
                        key={client.id}
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
          <div className="sticky bottom-0 bg-slate-50/50 z-40 border-slate-200 p-1">
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
          description={`Are you sure you want to delete ${selectedRows.size} selected client(s)? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
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
          title="Export Client Data"
          description="Select whether to export all client data or filter by a specific period."
          onExport={(params: ExportFilterParams | undefined) => exportClientsMutation(params)}
          filename="clients_export"
        />
      </div>
    </>
  );
}
