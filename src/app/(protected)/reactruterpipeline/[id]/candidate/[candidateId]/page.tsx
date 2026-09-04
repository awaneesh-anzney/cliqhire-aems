"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  User2, 
  ChevronLeft, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { 
  getPipelineCandidateDetails, 
  updateCandidateStage, 
  updateCandidateStatus, 
  addInterviewRound 
} from "@/services/recruitmentPipelineService";
import { mapPipelineCandidateResponse } from "@/components/Recruiter-Pipeline/pipeline-mapper";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { type Job, type Candidate, mapUIStageToBackendStage } from "@/components/Recruiter-Pipeline/dummy-data";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Redesigned modular components
import { CandidatePageHeader } from "@/components/Recruiter-Pipeline/candidate-details/CandidatePageHeader";
import { CandidatePipelineStepper } from "@/components/Recruiter-Pipeline/candidate-details/CandidatePipelineStepper";
import { CandidateQuickFactsSidebar } from "@/components/Recruiter-Pipeline/candidate-details/CandidateQuickFactsSidebar";
import { CandidateStageWorkspace } from "@/components/Recruiter-Pipeline/candidate-details/CandidateStageWorkspace";
import { CandidateResumeTab } from "@/components/Recruiter-Pipeline/candidate-details/CandidateResumeTab";
import { CandidateTimelineTab } from "@/components/Recruiter-Pipeline/candidate-details/CandidateTimelineTab";

// Workflow Dialogs
import { StatusChangeConfirmationDialog } from "@/components/Recruiter-Pipeline/status-change-confirmation-dialog";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { validateTempCandidateStageChange, validateTempCandidateStatusChange } from "@/lib/temp-candidate-validation";
import { TempCandidateAlertDialog } from "@/components/Recruiter-Pipeline/temp-candidate-alert-dialog";
import { InterviewDetailsDialog } from "@/components/Recruiter-Pipeline/interview-details-dialog";
import { DisqualificationDialog } from "@/components/Recruiter-Pipeline/disqualification-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

export default function CandidatePipelineDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = (params as any)?.id as string;
  const candidateId = (params as any)?.candidateId as string;
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";
  const canModifyPipeline = isAdmin || hasPermission("pipeline", "edit");

  const { data, isLoading, error, refetch } = useQuery<{ job: Job; candidate: Candidate } | null>({
    queryKey: ["pipeline", pipelineId, "candidate", candidateId],
    queryFn: async () => {
      const res = await getPipelineCandidateDetails(pipelineId, candidateId);
      return mapPipelineCandidateResponse(res.data);
    },
    enabled: !!pipelineId && !!candidateId,
  });

  const job = data?.job;
  const candidate = data?.candidate;

  // Temp candidate redirect guard
  useEffect(() => {
    if (candidate && candidate.isTempCandidate) {
      toast.error("Access Denied", {
        description: "Temporary candidates do not have a detailed evaluation profile.",
      });
      router.replace(`/reactruterpipeline/${pipelineId}`);
    }
  }, [candidate, pipelineId, router]);

  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);

  // Dialog States
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string | null;
  }>({ isOpen: false, candidate: null, newStatus: null });

  const [stageChangeDialog, setStageChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    currentStage: string;
    newStage: string;
  }>({ isOpen: false, candidate: null, currentStage: "", newStage: "" });

  const [interviewDialog, setInterviewDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({ isOpen: false, candidate: null });

  const [tempCandidateAlert, setTempCandidateAlert] = useState<{
    isOpen: boolean;
    candidateName: string | null;
    message: string | null;
  }>({ isOpen: false, candidateName: null, message: null });

  const [autoCreateCandidateDialog, setAutoCreateCandidateDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({ isOpen: false, candidate: null });

  const [disqualificationDialog, setDisqualificationDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string | null;
  }>({ isOpen: false, candidate: null, newStatus: null });

  const handleStageChange = (candidateToUpdate: Candidate, newStage: string) => {
    if (!canModifyPipeline) return;
    if (candidateToUpdate.isTempCandidate) {
      const validation = validateTempCandidateStageChange(candidateToUpdate, newStage);
      if (!validation.canChangeStage) {
        setTempCandidateAlert({
          isOpen: true,
          candidateName: candidateToUpdate.name,
          message: validation.message || null,
        });
        return;
      }
    }
    setStageChangeDialog({
      isOpen: true,
      candidate: candidateToUpdate,
      currentStage: candidateToUpdate.currentStage,
      newStage,
    });
  };

  const handleConfirmStageChange = async (dataPayload?: Record<string, any>) => {
    if (!stageChangeDialog.candidate || !pipelineId) return;
    try {
      await updateCandidateStage(pipelineId, stageChangeDialog.candidate.id, {
        stage: mapUIStageToBackendStage(stageChangeDialog.newStage),
        data: dataPayload,
      });
      await refetch();
      setStageChangeDialog((prev) => ({ ...prev, isOpen: false }));
      toast.success("Pipeline stage updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pipeline stage");
    }
  };

  const handleStatusChange = (candidateToUpdate: Candidate, newStatus: string) => {
    if (!canModifyPipeline) return;
    if (candidateToUpdate.isTempCandidate) {
      const validation = validateTempCandidateStatusChange(candidateToUpdate, newStatus);
      if (!validation.canChangeStage) {
        setTempCandidateAlert({
          isOpen: true,
          candidateName: candidateToUpdate.name,
          message: validation.message || null,
        });
        return;
      }
    }
    if (newStatus === "Disqualified") {
      setDisqualificationDialog({ isOpen: true, candidate: candidateToUpdate, newStatus });
    } else {
      setStatusChangeDialog({ isOpen: true, candidate: candidateToUpdate, newStatus });
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeDialog.candidate || !statusChangeDialog.newStatus || !pipelineId) return;
    try {
      await updateCandidateStatus(pipelineId, statusChangeDialog.candidate.id, {
        status: statusChangeDialog.newStatus,
        stage: mapUIStageToBackendStage(statusChangeDialog.candidate.currentStage),
      });
      await refetch();
      setStatusChangeDialog((prev) => ({ ...prev, isOpen: false }));
      toast.success("Candidate status updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update candidate status");
    }
  };

  const handleConfirmInterviewDetails = async (details: any) => {
    if (!interviewDialog.candidate || !pipelineId) return;
    try {
      await addInterviewRound(pipelineId, interviewDialog.candidate.id, details);
      await refetch();
      setInterviewDialog({ isOpen: false, candidate: null });
      toast.success("Interview scheduled successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule interview");
    }
  };

  const handleUpdateCandidate = async () => {
    await refetch();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="p-6 rounded-2xl bg-card shadow-lg border border-border flex items-center gap-3 animate-in zoom-in-95 duration-500">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Loading Candidate Workspace...</span>
            <span className="text-xs text-muted-foreground">Synchronizing pipeline evaluation data</span>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !candidate || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="p-8 rounded-2xl bg-card shadow-md border border-border text-center max-w-md w-full flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Candidate Profile Unreachable</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {(error as any)?.message ||
              "The requested candidate profile could not be synchronized or does not exist."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/reactruterpipeline/${pipelineId}`)}
            className="w-full mt-2 h-10 rounded-xl font-semibold text-xs border-border hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Return to Pipeline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-full w-full max-w-[1550px] mx-auto px-2 sm:px-4 py-2 flex flex-col gap-2.5 animate-in fade-in duration-300">
        {/* Top Executive Header */}
        <CandidatePageHeader
          candidate={candidate}
          job={job}
          pipelineId={pipelineId}
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
          canModify={canModifyPipeline}
        />

        {/* Interactive Pipeline Journey Ribbon */}
        <CandidatePipelineStepper
          candidate={candidate}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          stages={job.stages}
        />

        {/* Main 2-Column Responsive ATS Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
          {/* Left Column: Primary Stage & Evaluation Tabs (xl:col-span-8) */}
          <div className="xl:col-span-8 flex flex-col gap-2.5 min-w-0">
            <Tabs defaultValue="stage" className="w-full flex flex-col gap-2">
              <TabsList className="bg-card border border-border/80 p-0.5 rounded-lg h-8 self-start shadow-xs">
                <TabsTrigger
                  value="stage"
                  className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md h-7 px-2.5 data-[state=active]:bg-muted"
                >
                  <LayoutDashboard className="h-3 w-3 text-brand" />
                  Stage Intelligence
                </TabsTrigger>
                <TabsTrigger
                  value="resume"
                  className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md h-7 px-2.5 data-[state=active]:bg-muted"
                >
                  <FileText className="h-3 w-3 text-brand" />
                  Resume & Documents
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md h-7 px-2.5 data-[state=active]:bg-muted"
                >
                  <History className="h-3 w-3 text-brand" />
                  Activity Timeline
                </TabsTrigger>
              </TabsList>

              {/* 1. Stage Intelligence Tab Content */}
              <TabsContent value="stage" className="mt-0 focus-visible:outline-none">
                <CandidateStageWorkspace
                  candidate={candidate}
                  selectedStage={selectedStage}
                  onStageSelect={setSelectedStage}
                  onUpdateCandidate={handleUpdateCandidate}
                  pipelineId={pipelineId}
                  candidateId={candidateId}
                  jobId={job.jobId?._id || (typeof job.jobId === "string" ? job.jobId : job.id)}
                  jobTeamMembers={job.jobTeamMembers}
                  canModify={canModifyPipeline}
                />
              </TabsContent>

              {/* 2. Resume & Documents Tab Content */}
              <TabsContent value="resume" className="mt-0 focus-visible:outline-none">
                <CandidateResumeTab candidate={candidate} />
              </TabsContent>

              {/* 3. Activity Timeline Tab Content */}
              <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
                <CandidateTimelineTab candidate={candidate} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Persistent Candidate Dossier Sidebar (xl:col-span-4) */}
          <div className="xl:col-span-4 min-w-0">
            <CandidateQuickFactsSidebar candidate={candidate} pipelineId={pipelineId} />
          </div>
        </div>
      </div>

      {/* Dialog Overlays */}
      <StatusChangeConfirmationDialog
        isOpen={stageChangeDialog.isOpen}
        onClose={() =>
          setStageChangeDialog({
            isOpen: false,
            candidate: null,
            currentStage: "",
            newStage: "",
          })
        }
        onConfirm={handleConfirmStageChange}
        candidateName={stageChangeDialog.candidate?.name || ""}
        currentStage={stageChangeDialog.currentStage}
        newStage={stageChangeDialog.newStage}
        candidate={stageChangeDialog.candidate}
      />

      <Dialog
        open={statusChangeDialog.isOpen}
        onOpenChange={(isOpen) =>
          !isOpen && setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })
        }
      >
        <DialogContent className="rounded-2xl border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-foreground tracking-tight">
              Confirm Status Update
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Confirm changing the status of{" "}
              <strong className="text-brand font-bold">
                {statusChangeDialog.candidate?.name}
              </strong>{" "}
              to{" "}
              <strong className="text-brand font-bold">
                {statusChangeDialog.newStatus}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })
              }
              className="rounded-xl font-semibold text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              className="bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold text-xs shadow-md shadow-brand/20"
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TempCandidateAlertDialog
        isOpen={tempCandidateAlert.isOpen}
        onClose={() => setTempCandidateAlert({ isOpen: false, candidateName: null, message: null })}
        candidateName={tempCandidateAlert.candidateName || ""}
        message={tempCandidateAlert.message || undefined}
      />

      {autoCreateCandidateDialog.candidate && (
        <CreateCandidateModal
          isOpen={autoCreateCandidateDialog.isOpen}
          onClose={() => setAutoCreateCandidateDialog({ isOpen: false, candidate: null })}
          tempCandidateData={{
            name: autoCreateCandidateDialog.candidate.name,
            email: autoCreateCandidateDialog.candidate.email || "",
            phone: autoCreateCandidateDialog.candidate.phone || "",
          }}
          tempCandidateId={autoCreateCandidateDialog.candidate.id}
          pipelineId={pipelineId}
          isTempCandidateConversion={true}
          onCandidateCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
            toast.success("Profile Activated", {
              description: "Candidate moved to CV Received stage.",
            });
          }}
        />
      )}

      {disqualificationDialog.isOpen && disqualificationDialog.candidate && (
        <DisqualificationDialog
          isOpen={disqualificationDialog.isOpen}
          onClose={() =>
            setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: null })
          }
          candidateName={disqualificationDialog.candidate?.name || ""}
          currentStage={disqualificationDialog.candidate.currentStage}
          currentStageStatus={disqualificationDialog.candidate.status as string}
          onConfirm={async (dialogData) => {
            if (disqualificationDialog.candidate) {
              try {
                await updateCandidateStatus(pipelineId, disqualificationDialog.candidate.id, {
                  status: "Disqualified",
                  stage: mapUIStageToBackendStage(disqualificationDialog.candidate.currentStage),
                  notes: dialogData.disqualificationReason,
                  data: dialogData,
                });
                await refetch();
                setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: null });
                toast.success("Disqualification recorded successfully");
              } catch (err) {
                console.error(err);
                toast.error("Failed to record disqualification");
              }
            }
          }}
        />
      )}
    </TooltipProvider>
  );
}