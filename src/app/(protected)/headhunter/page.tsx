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
  const userId = user?._id || (user as any)?.profile?._id || "";

  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const canView = hasPermission("Headhunter", "view");

  const { data: dashboardData, isLoading: dashboardLoading, isFetching: dashboardFetching, refetch: refetchDashboard } = useQuery({
    queryKey: ["headhunterDashboard"],
    queryFn: () => headhunterService.getMyDashboard(),
    enabled: canView && !!user,
  });

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

  const jobs: Job[] = useMemo(() => {
    // Handle case where dashboardData might be the array itself or contain the array
    const list = Array.isArray(dashboardData) ? dashboardData : (dashboardData?.jobs || []);
    
    return list.map((j: any) => {
      // Use standard naming from recruiter mapping if possible
      // Support both j.jobId as an ID or as an object
      const jobId = j.jobId?._id || (typeof j.jobId === 'string' ? j.jobId : "") || j._id || "";
      const jobTitle = j.jobTitle || j.title || (typeof j.jobId === 'object' ? j.jobId.jobTitle : "");
      
      // Team members might be in different formats
      const teamMembers = Array.isArray(j.jobTeamMembers) ? j.jobTeamMembers : [];
      const hm = teamMembers.find((m: any) => m.position === "hiringManager") || j.jobTeamMembers?.hiringManager || {};
      const rc = teamMembers.find((m: any) => m.position === "recruiter") || j.jobTeamMembers?.recruiter || {};
      
      const hiringManagerName = hm.fullName || [hm.firstName, hm.lastName].filter(Boolean).join(" ") || hm.name || "";
      const recruiterName = rc.fullName || [rc.firstName, rc.lastName].filter(Boolean).join(" ") || rc.name || "";

      return {
        id: jobId,
        title: jobTitle,
        clientName: j.client?.name || j.clientName || "",
        location: j.location || (typeof j.jobId === 'object' ? j.jobId.location : ""),
        salaryRange: j.salaryRange ? `${j.salaryRange.min ?? ""} - ${j.salaryRange.max ?? ""} ${j.salaryRange.currency ?? ""}`.trim() : "",
        headcount: j.headcount || 1,
        jobType: (j.jobType || (typeof j.jobId === 'object' ? j.jobId.jobType : "") || "").replace(/-/g, " "),
        isExpanded: false,
        candidates: [],
        jobId: {
          _id: jobId,
          jobTitle: jobTitle,
          location: j.location,
          stage: j.stage || (typeof j.jobId === 'object' ? j.jobId.stage : "Active"),
          jobType: j.jobType,
          jobTeamInfo: {
            hiringManager: hiringManagerName ? { name: hiringManagerName } : undefined,
            recruiter: recruiterName ? { name: recruiterName } : undefined,
          },
        },
      } as Job;
    });
  }, [dashboardData]);

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
          initialLoading={candidatesLoading || candidatesFetching || dashboardLoading || dashboardFetching}
          heading="Headhunter Dashboard"
          buttonText="Create Candidate"
          showCreateButton={true}
          selectedCount={selectedRows.size}
          onDelete={handleDeleteSelected}
          onRefresh={() => {
            if (activeTab === "Candidates") refetchCandidates();
            else refetchDashboard();
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
