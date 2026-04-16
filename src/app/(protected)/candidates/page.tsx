"use client";
import { Candidate, candidateService } from "@/services/candidateService";
import { useCandidates, useUpdateCandidate, useDeleteCandidate } from "@/hooks/useCandidate";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Loader } from "lucide-react";
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

const columsArr = [
  "Profile ID",
  "Candidate Name",
  "Candidate Email",
  "Candidate Phone",
  "Location",
  "Status",
  "Experience",
  "Resume",
  "Created By",
];

export default function CandidatesPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';

  const canViewCandidates = isAdmin || hasPermission('candidates', 'view');
  const canModifyCandidates = isAdmin || hasPermission('candidates', 'create') || hasPermission('candidates', 'edit');
  const canDeleteCandidates = isAdmin || hasPermission('candidates', 'delete');
  const router = useRouter();
  const queryClient = useQueryClient();
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

  // Server-side pagination: totals come from API response

  const toggleRowSelection = (candidateId: string) => {
    if (!canDeleteCandidates) return;
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!canDeleteCandidates) return;
    if (selectedRows.size === candidates.length) {
      setSelectedRows(new Set());
    } else {
      const newSelected = new Set<string>();
      candidates.forEach((c) => {
        if (c._id) newSelected.add(c._id);
      });
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
      await Promise.all(
        Array.from(selectedRows).map((candidateId) =>
          deleteCandidateMutation(candidateId)
        )
      );
      await refetch();
      setSelectedRows(new Set());
      toast.success(`${selectedRows.size} candidate(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting candidates:', error);
      toast.error('Failed to delete selected candidates. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const { mutateAsync: updateCandidateMutation } = useUpdateCandidate();
  const { mutateAsync: deleteCandidateMutation } = useDeleteCandidate();

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    if (!canModifyCandidates) return;
    await updateCandidateMutation({ id: candidateId, data: { status: newStatus } });
  };

  if (!canViewCandidates) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">You do not have permission to view candidates.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50/50 p-2 space-y-2" style={{ height: 'calc(100vh - 20px)' }}>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2">
        <Dashboardheader
          setOpen={setOpen}
          setFilterOpen={setFilterOpen}
          initialLoading={isFetching}
          heading="Candidates"
          buttonText="Create Candidate"
          showCreateButton={canModifyCandidates}
          showFilterButton={true}
          isFilterActive={selectedStatuses.length > 0 || !!filterName.trim() || !!filterEmail.trim() || !!filterExperience.trim() || !!filterLocation.trim()}
          filterCount={(selectedStatuses.length > 0 ? 1 : 0) + (filterName.trim() ? 1 : 0) + (filterEmail.trim() ? 1 : 0) + (filterExperience.trim() ? 1 : 0) + (filterLocation.trim() ? 1 : 0)}
          selectedCount={selectedRows.size}
          onDelete={handleDeleteSelected}
          onRefresh={() => {
            refetch();
          }}
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
                  <Checkbox
                    checked={selectedRows.size > 0 && selectedRows.size === candidates.length}
                    onCheckedChange={() => toggleSelectAll()}
                    className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                    disabled={!canDeleteCandidates}
                  />
                </TableHead>
                {columsArr.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-[calc(100vh-300px)]">
                    <div className="flex items-center justify-center gap-2 flex-col">
                      <Loader className="size-6 animate-spin" />
                      <div className="text-center">Loading candidates...</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-[calc(100vh-300px)] text-center">
                    <div className="py-24">
                      <CandidatesEmptyState />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow
                    key={candidate._id}
                    className={`${candidate._id && selectedRows.has(candidate._id) ? 'bg-brand/5' : ''} hover:bg-muted/50`}
                  >
                    <TableCell className="w-12 px-4">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={candidate._id ? selectedRows.has(candidate._id) : false}
                          onCheckedChange={() => candidate._id && toggleRowSelection(candidate._id)}
                          className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                          disabled={!canDeleteCandidates}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{
                      <span
                        className="font-medium text-slate-900 hover:text-brand hover:underline cursor-pointer transition-colors block"
                        onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                      >
                        {candidate.profileId || "N/A"}
                      </span>
                    }</TableCell>
                    <TableCell className="text-sm font-medium w-52">
                      <span
                        className="font-medium text-slate-900 hover:text-brand hover:underline cursor-pointer transition-colors block"
                        onClick={() => candidate._id && router.push(`/candidates/${candidate._id}`)}
                      >
                        {candidate.name || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{candidate.email || "N/A"}</TableCell>
                    <TableCell className="text-sm">{candidate.phone || "N/A"}</TableCell>
                    <TableCell className="text-sm">{candidate.location || "N/A"}</TableCell>
                    <TableCell className="text-sm">
                      <CandidateStatusBadge
                        id={candidate._id}
                        status={(candidate.status as any) || "Active"}
                        onStatusChange={handleStatusChange}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{candidate.experience || "N/A"}</TableCell>
                    <TableCell className="text-sm">
                      {candidate.resume ? (
                        <a
                          href={candidate.resume.startsWith('http') ? candidate.resume : `${process.env.NEXT_PUBLIC_API_URL || ''}${candidate.resume.startsWith('/') ? '' : '/'}${candidate.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Resume
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {candidate.createdBy?.name || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="sticky bottom-0 bg-slate-50/50 z-40 border-slate-200 p-1">
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
        title="Delete Candidates"
        description={`Are you sure you want to delete ${selectedRows.size} selected candidate(s)? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
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
        onApply={() => {
          setFilterOpen(false);
          setCurrentPage(1);
        }}
        onClear={() => {
          setFilterName("");
          setFilterEmail("");
          setFilterExperience("");
          setFilterLocation("");
          setSelectedStatuses([]);
          setCurrentPage(1);
        }}
      />

      {/*Open the candidate Dialog  */}
      <CreateCandidateModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCandidateCreated={() => {
          setOpen(false);
          setCurrentPage(1);
          refetch();
        }}
      />
      <ExportDialog
        isOpen={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        title="Export Candidate Data"
        description="Select whether to export all candidate data or filter by a specific period."
        onExport={(params: ExportFilterParams | undefined) => exportCandidatesMutation(params)}
        filename="candidates_export"
      />
    </div>
  );
}
