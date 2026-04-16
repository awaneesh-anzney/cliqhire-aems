"use client";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal, RefreshCcw, MoreVertical, Loader, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { CreateJobModal } from "@/components/jobs/create-job-modal"
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
import Tableheader from "@/components/table-header";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { JobPaginationControls } from "@/components/jobs/JobPaginationControls";
import { getJobs, updateJobStage, deleteJobById } from "@/services/jobService";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import JobsFilter from "@/components/jobs/JobsFilter";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { useExportJobs } from "@/hooks/useExportJobs";
import { useJobs, useUpdateJobStage, useDeleteJob } from "@/hooks/useJobs";
import { usePermissions } from "@/contexts/PermissionContext";

const columsArr = [
  "Job ID",
  "Position Name",
  "Job Type",
  "Job location",
  "Headcount",
  "Job Stage",
  "Minimum salary",
  "Maximum salary",
  "Job Owner",
  "Created By",
];

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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Stage Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to update the job stage? This action will be saved immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
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
  const queryClient = useQueryClient();
  const { mutateAsync: updateStageMutation } = useUpdateJobStage();
  const { mutateAsync: deleteJobMutation } = useDeleteJob();

  const { data: jobsData, isLoading, isFetching, refetch } = useJobs({
    page: currentPage,
    limit: pageSize,
    ...(filterPositionName.trim() && { search: filterPositionName.trim() }),
  });

  // Normalize response — jobs come directly from the hook
  let allJobs = jobsData?.jobs ?? [];

  // Build owner options from current page
  const allOwnerOptions: string[] = Array.from(
    new Set(allJobs.map((j: any) =>
      typeof j.client === "object" ? j.client?.name : j.client
    ).filter(Boolean))
  );

  // Apply client-side filters (stage + jobOwner — not supported as API params)
  if (selectedStages.length > 0 || filterJobOwner) {
    const owner = filterJobOwner.trim().toLowerCase();
    allJobs = allJobs.filter((job: any) => {
      const jobStage = (job.stage || job.jobStatus) as JobStage | undefined;
      const matchesStage = selectedStages.length === 0 || (jobStage ? selectedStages.includes(jobStage) : false);
      const clientLabel = typeof job.client === "object" ? (job.client?.name ?? "") : (job.client ?? "");
      const matchesOwner = owner === "" || clientLabel.toLowerCase().includes(owner);
      return matchesStage && matchesOwner;
    });
  }

  // Totals come from the server — client-side filters may reduce visible rows
  const totalJobs = jobsData?.totalCount ?? 0;
  const totalPages = jobsData?.totalPages ?? 1;
  const jobs = allJobs;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Ensure we always pass a valid JobStage to components expecting it
  const toJobStage = (stage?: string): JobStage => {
    const validStages: JobStage[] = [
      "Open",
      "Hired",
      "On Hold",
      "Closed",
      "Active",
      "Onboarding",
    ];
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
    } catch (error) {
      console.error("Error updating job stage:", error);
    } finally {
      setPendingStageChange(null);
      setConfirmOpen(false);
    }
  };

  // Toggle row selection
  const toggleRowSelection = (jobId: string) => {
    if (!canDeleteJobs) return; // Prevent selection if user can't delete
    setSelectedRows(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(jobId)) {
        newSelected.delete(jobId);
      } else {
        newSelected.add(jobId);
      }
      return newSelected;
    });
  };

  // Toggle all rows selection
  const toggleSelectAll = () => {
    if (!canDeleteJobs) return; // Prevent selection if user can't delete
    if (selectedRows.size === jobs.length) {
      setSelectedRows(new Set());
    } else {
      const newSelectedRows = new Set<string>();
      jobs.forEach((job: any) => {
        newSelectedRows.add(job._id);
      });
      setSelectedRows(newSelectedRows);
    }
  };

  const handleDeleteSelected = async () => {
    console.log('handleDeleteSelected called');
    console.log('selectedRows size:', selectedRows.size, 'canDeleteJobs:', canDeleteJobs);
    if (selectedRows.size === 0 || !canDeleteJobs) {
      console.log('Not showing dialog - no rows selected or no delete permission');
      return;
    }
    console.log('Setting showDeleteDialog to true');
    setShowDeleteDialog(true);
  };

  const confirmDeleteSelected = async () => {
    if (selectedRows.size === 0 || !canDeleteJobs) return;

    setIsDeleting(true);
    try {
      // Delete all selected jobs in parallel
      await Promise.all(
        Array.from(selectedRows).map((jobId) =>
          deleteJobMutation(jobId)
        )
      );

      // Refresh the job list after successful deletion
      await refetch();

      // Clear the selection
      setSelectedRows(new Set());

      // Show success message
      toast.success(`${selectedRows.size} job(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting jobs:', error);
      toast.error('Failed to delete selected jobs. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!canViewJobs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">You do not have permission to view jobs.</div>
      </div>
    );
  }

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">Jobs</h1>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          {canModifyJobs && (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Requirement
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <Table>
            <TableHeader>
              <Tableheader tableHeadArr={columsArr} />
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className="h-[calc(100vh-240px)] text-center">
                  <div className="py-24 flex flex-col items-center gap-2">
                    <Loader className="size-6 animate-spin" />
                    <div className="text-center">Loading Jobs...</div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col bg-slate-50/50 p-2 space-y-2" style={{ height: 'calc(100vh - 20px)' }}>
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2">
          <Dashboardheader
            setOpen={setOpen}
            setFilterOpen={setFilterOpen}
            initialLoading={isLoading}
            onRefresh={() => refetch()}
            onDelete={handleDeleteSelected}
            heading="Jobs"
            buttonText="Add Job"
            selectedCount={selectedRows.size}
            showCreateButton={canModifyJobs}
            isFilterActive={selectedStages.length > 0 || !!filterPositionName.trim() || !!filterJobOwner.trim()}
            filterCount={
              (selectedStages.length > 0 ? 1 : 0) +
              (filterPositionName.trim() ? 1 : 0) +
              (filterPositionName.trim() ? 1 : 0) +
              (filterJobOwner.trim() ? 1 : 0)
            }
            onExport={() => setOpenExportDialog(true)}
          />
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-auto relative">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 hover:bg-slate-50 text-slate-700">
                  <TableHead className="w-12 px-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === jobs.length}
                        onCheckedChange={() => toggleSelectAll()}
                        className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                        disabled={!canDeleteJobs}
                      />
                    </div>
                  </TableHead>
                  {columsArr.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length > 0 ? (
                  jobs.map((job: any) => (
                    <TableRow
                      key={job._id}
                      className={`${selectedRows.has(job._id) ? 'bg-brand/5' : ''} hover:bg-muted/50`}
                    >
                      <TableCell className="w-12 px-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedRows.has(job._id)}
                            onCheckedChange={() => toggleRowSelection(job._id)}
                            className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-brand/10 data-[state=checked]:text-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
                            disabled={!canDeleteJobs}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium w-[200px]">
                        <span
                          className="font-medium text-slate-900 hover:text-brand hover:underline cursor-pointer transition-colors block"
                          onClick={() => router.push(`/jobs/${job._id}`)}
                        >
                          {job.jobId || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium w-[200px]">
                        <span
                          className="font-medium text-slate-900 hover:text-brand hover:underline cursor-pointer transition-colors block"
                          onClick={() => router.push(`/jobs/${job._id}`)}
                        >
                          {job.jobTitle}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{job.jobType}</TableCell>
                      <TableCell className="text-sm">{Array.isArray(job.location) ? job.location.join(", ") : job.location ?? ""}</TableCell>
                      <TableCell className="text-sm">{job.headcount}</TableCell>
                      <TableCell className="text-sm">
                        <JobStageBadge
                          stage={toJobStage(job.stage)}
                          onStageChange={(newStage) => handleStageChange(job._id, newStage)}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{job.salaryCurrency + " " + job.minimumSalary}</TableCell>
                      <TableCell className="text-sm">{job.salaryCurrency + " " + job.maximumSalary}</TableCell>
                      <TableCell className="text-sm">
                        {job.client}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.createdBy?.name || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-[calc(100vh-240px)] text-center">
                      <div className="py-24">
                        <div className="text-center">No jobs found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="sticky bottom-0 bg-slate-50/50 z-40 border-slate-200 p-1">
            <JobPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobs}
              pageSize={pageSize}
              setPageSize={(s) => { setPageSize(s); setCurrentPage(1); }}
              handlePageChange={handlePageChange}
              jobsLength={jobs.length}
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
        onClose={() => {
          setShowDeleteDialog(false);
        }}
        onConfirm={() => {
          confirmDeleteSelected();
        }}
        title="Delete Jobs"
        description={`Are you sure you want to delete ${selectedRows.size} selected job(s)? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        isDeleting={isDeleting}
      />
      <JobsFilter
        open={filterOpen}
        onOpenChange={setFilterOpen}
        positionName={filterPositionName}
        onPositionNameChange={(v) => { setFilterPositionName(v); setCurrentPage(1); }}
        jobOwner={filterJobOwner}
        onJobOwnerChange={setFilterJobOwner}
        selectedStages={selectedStages}
        onStagesChange={setSelectedStages}
        jobOwners={allOwnerOptions}
        onApply={() => setFilterOpen(false)}
        onClear={() => {
          setFilterPositionName("");
          setFilterJobOwner("");
          setSelectedStages([]);
        }}
      />
      {canModifyJobs && <CreateJobRequirementForm open={open} onOpenChange={setOpen} />}

      <ExportDialog
        isOpen={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        title="Export Job Data"
        description="Select whether to export all job data or filter by a specific period."
        onExport={(params: ExportFilterParams | undefined) => exportJobsMutation(params)}
        filename="jobs_export"
      />
    </>
  );
}
