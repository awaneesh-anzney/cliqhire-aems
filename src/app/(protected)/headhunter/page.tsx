"use client"
import { useEffect, useMemo, useState } from "react";
import { HeadhunterPipeline } from "@/components/Headhunter-Pipeline/headhunter-pipeline";
import Dashboardheader from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { HeadhunterCandidatesTable } from "@/components/Headhunter-Pipeline/headhunter-candidates-table";
import { headhunterCandidatesService } from "@/services/headhunterCandidatesService";
import { headhunterService } from "@/services/headhunterService";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Job } from "@/components/Recruiter-Pipeline/dummy-data";

const HeadhunterPage = () => {
  const [activeTab, setActiveTab] = useState("Candidates");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const userId = (user as any)?.profile?._id || user?._id || "";

  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const canView = hasPermission("Headhunter", "view");

  const { data: rawCandidates, isLoading: candidatesLoading, isFetching: candidatesFetching, refetch: refetchCandidates } = useQuery({
    queryKey: ["headhunterCandidates", userId],
    queryFn: () => headhunterService.getHeadhunterCandidates(userId),
    enabled: !!userId && canView,
  });

  const candidates = useMemo(() => {
    const list = Array.isArray(rawCandidates) ? rawCandidates : [];
    return list.map((item: any) => ({
      id: item._id || item.id || "",
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || item.otherPhone || "",
      status: item.status || "Pending",
      resumeUrl: item.resume || item.resumeUrl || undefined,
      location: item.location || "",
      gender: item.gender || "",
      dateOfBirth: item.dateOfBirth || undefined,
      willingToRelocate: item.willingToRelocate || "",
      description: item.description || "",
      softSkill: Array.isArray(item.softSkill) ? item.softSkill : [],
      technicalSkill: Array.isArray(item.technicalSkill) ? item.technicalSkill : [],
      country: item.country || "",
      nationality: item.nationality || "",
      overallStatus: item.overallStatus || "",
      isTransferred: item.isTransferred ?? false,
      transferredToCandidateId: item.transferredToCandidateId || undefined,
      transferredAt: item.transferredAt || undefined,
      transferredViaAssignment: item.transferredViaAssignment || undefined,
      jobAssignments: Array.isArray(item.jobAssignments) ? item.jobAssignments : [],
      createdAt: item.createdAt || undefined,
      updatedAt: item.updatedAt || undefined,
      stats: item.stats || undefined,
    }));
  }, [rawCandidates]);

  const [pdfViewer, setPdfViewer] = useState<{ isOpen: boolean; pdfUrl: string | null; candidateName: string | null }>({
    isOpen: false,
    pdfUrl: null,
    candidateName: null,
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [rawCandidates]);

  const handleViewResume = (candidate: any) => {
    if (!candidate?.resumeUrl) return;
    setPdfViewer({ isOpen: true, pdfUrl: candidate.resumeUrl, candidateName: candidate.name || null });
  };
  const handleClosePdfViewer = () => {
    setPdfViewer({ isOpen: false, pdfUrl: null, candidateName: null });
  };
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedRows.size === candidates.length) {
      setSelectedRows(new Set());
    } else {
      const all = new Set<string>();
      candidates.forEach(c => all.add(c.id));
      setSelectedRows(all);
    }
  };
  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) return;
    setShowDeleteDialog(true);
  };

  const { data: jobsRaw, isLoading: jobsLoading, isFetching: jobsFetching, refetch: refetchJobs } = useQuery({
    queryKey: ["headhunterJobs", userId],
    queryFn: () => headhunterService.getHeadhunterJobs(userId),
    enabled: !!userId && canView && activeTab === "Jobs",
  });

  const jobs: Job[] = useMemo(() => {
    const list = Array.isArray(jobsRaw) ? jobsRaw : [];
    return list.map((j: any) => {
      const hm = j?.jobTeamMembers?.hiringManager || {};
      const rc = j?.jobTeamMembers?.recruiter || {};
      const hiringManagerName = hm.fullName || [hm.firstName, hm.lastName].filter(Boolean).join(" ");
      const recruiterName = rc.fullName || [rc.firstName, rc.lastName].filter(Boolean).join(" ");

      return {
        id: j.jobId || j._id || "",
        title: j.jobTitle || "",
        clientName: j.clientName || "",
        location: j.location || "",
        salaryRange: j.salaryRange ? `${j.salaryRange.min ?? ""} - ${j.salaryRange.max ?? ""} ${j.salaryRange.currency ?? ""}`.trim() : "",
        headcount: 1,
        jobType: (j.jobType || "").replace(/-/g, " "),
        isExpanded: false,
        candidates: [],
        jobId: {
          _id: j.jobId || j._id,
          jobTitle: j.jobTitle,
          location: j.location,
          stage: "Active",
          jobType: j.jobType,
          jobTeamInfo: {
            hiringManager: hm?._id || hiringManagerName ? { _id: hm._id, name: hiringManagerName, email: hm.email } : undefined,
            recruiter: rc?._id || recruiterName ? { _id: rc._id, name: recruiterName, email: rc.email } : undefined,
          },
        },
      } as Job;
    });
  }, [jobsRaw]);

  const confirmDeleteSelected = async () => {
    if (selectedRows.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(Array.from(selectedRows).map(id => headhunterCandidatesService.deleteCandidate(id)));
      await refetchCandidates();
      toast.success(`${selectedRows.size} candidate(s) deleted successfully`);
      setSelectedRows(new Set());
    } catch (error) {
      toast.error('Failed to delete selected candidates');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (permissionsLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Checking permissions...</div>;
  }

  if (!canView) {
    return <div className="p-4 text-sm text-red-500">You do not have permission to view this page.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="">
        <Dashboardheader
          setOpen={setCreateModalOpen}
          setFilterOpen={() => {}}
          initialLoading={candidatesLoading || candidatesFetching || jobsLoading || jobsFetching}
          heading="Headhunter Dashboard"
          buttonText="Create Candidate"
          showCreateButton={true}
          selectedCount={selectedRows.size}
          onDelete={handleDeleteSelected}
          onRefresh={() => {
            if (activeTab === "Candidates") refetchCandidates();
            else refetchJobs();
          }}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border-t">
          <TabsList className="flex border-b w-full rounded-none justify-start h-12 bg-transparent p-0">
            <TabsTrigger
              value="Candidates"
              className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none h-12 px-6"
            >
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="Jobs"
              className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none h-12 px-6"
            >
              Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Candidates" className="">
            <HeadhunterCandidatesTable
              candidates={candidates}
              onViewResume={handleViewResume}
              selectedIds={selectedRows}
              onToggleSelect={toggleRowSelection}
              onToggleSelectAll={toggleSelectAll}
            />
          </TabsContent>

          <TabsContent value="Jobs" className="pt-4">
            <HeadhunterPipeline jobs={jobs} />
          </TabsContent>
        </Tabs>

        <CreateCandidateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          isHeadhunterCreate={true}
          onCandidateCreated={() => {
            setCreateModalOpen(false);
            refetchCandidates();
          }}
        />

        <PDFViewer
          isOpen={pdfViewer.isOpen}
          onClose={handleClosePdfViewer}
          pdfUrl={pdfViewer.pdfUrl || undefined}
          candidateName={pdfViewer.candidateName || undefined}
        />

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeleteSelected}
          title="Delete Candidates"
          description={`Are you sure you want to delete ${selectedRows.size} selected candidate(s)? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default HeadhunterPage;
