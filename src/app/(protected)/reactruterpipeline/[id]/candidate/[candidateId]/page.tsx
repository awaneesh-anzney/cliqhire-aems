"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Building2, 
  Calendar,
  GraduationCap,
  Languages,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  Check,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { getPipelineCandidateDetails, updateCandidateStage, updateCandidateStatus } from "@/services/recruitmentPipelineService";
import { mapPipelineCandidateResponse } from "@/components/Recruiter-Pipeline/pipeline-mapper";
import { PipelineStageDetails } from "@/components/Recruiter-Pipeline/pipeline-stage-details/PipelineStageDetails";
import { useAuth } from "@/contexts/AuthContext";
import { type Job, type Candidate, pipelineStages, mapUIStageToBackendStage } from "@/components/Recruiter-Pipeline/dummy-data";
import { usePermissions } from "@/contexts/PermissionContext";
import { toast } from "sonner";

import { CandidateHeaderCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateHeaderCard";
import { CandidateProgressCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateProgressCard";
import { CandidateDisqualificationCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateDisqualificationCard";
import { CandidateInfoGrid } from "@/components/Recruiter-Pipeline/candidate-details/CandidateInfoGrid";
import { CandidateDocumentsCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateDocumentsCard";

// Dialog imports
import { StatusChangeConfirmationDialog } from "@/components/Recruiter-Pipeline/status-change-confirmation-dialog";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
import { validateTempCandidateStageChange, validateTempCandidateStatusChange } from "@/lib/temp-candidate-validation";
import { TempCandidateAlertDialog } from "@/components/Recruiter-Pipeline/temp-candidate-alert-dialog";
import { InterviewDetailsDialog } from "@/components/Recruiter-Pipeline/interview-details-dialog";
import { DisqualificationDialog } from "@/components/Recruiter-Pipeline/disqualification-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CandidatePipelineDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = (params as any)?.id as string;
  const candidateId = (params as any)?.candidateId as string;
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';
  const canModifyPipeline = isAdmin || hasPermission('pipeline', 'edit');

  const { data, isLoading, error } = useQuery<{ job: Job; candidate: Candidate } | null>({
    queryKey: ["pipeline", pipelineId, "candidate", candidateId],
    queryFn: async () => {
      const res = await getPipelineCandidateDetails(pipelineId, candidateId);
      return mapPipelineCandidateResponse(res.data);
    },
    enabled: !!pipelineId && !!candidateId,
  });

  const job = data?.job;
  const candidate = data?.candidate;

  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);

  // Dialog States
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string | null;
  }>({
    isOpen: false,
    candidate: null,
    newStatus: null,
  });

  const [stageChangeDialog, setStageChangeDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    currentStage: string;
    newStage: string;
  }>({
    isOpen: false,
    candidate: null,
    currentStage: '',
    newStage: '',
  });

  const [interviewDialog, setInterviewDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({
    isOpen: false,
    candidate: null,
  });

  const [tempCandidateAlert, setTempCandidateAlert] = useState<{
    isOpen: boolean;
    candidateName: string | null;
    message: string | null;
  }>({
    isOpen: false,
    candidateName: null,
    message: null,
  });

  const [autoCreateCandidateDialog, setAutoCreateCandidateDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({
    isOpen: false,
    candidate: null,
  });

  const [disqualificationDialog, setDisqualificationDialog] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    newStatus: string | null;
  }>({
    isOpen: false,
    candidate: null,
    newStatus: null,
  });

  // Handlers
  const handleStageChange = (candidate: Candidate, newStage: string) => {
    if (!canModifyPipeline) {
      toast.warning('You do not have permission to modify the recruitment pipeline.');
      return;
    }
    const validation = validateTempCandidateStageChange(candidate);

    if (!validation.canChangeStage) {
      setTempCandidateAlert({
        isOpen: true,
        candidateName: candidate.name,
        message: validation.message || null,
      });
      return;
    }

    if (newStage === 'Interview') {
      setInterviewDialog({ isOpen: true, candidate });
      return;
    }

    setStageChangeDialog({
      isOpen: true,
      candidate,
      currentStage: candidate.currentStage,
      newStage,
    });
  };

  const handleConfirmStageChange = async () => {
    if (!canModifyPipeline) {
      toast.warning('You do not have permission to modify the recruitment pipeline.');
      return;
    }
    if (stageChangeDialog.candidate) {
      try {
        const backendStage = mapUIStageToBackendStage(stageChangeDialog.newStage);
        await updateCandidateStage(pipelineId, stageChangeDialog.candidate.id, {
          newStage: backendStage,
        });
        await queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
        setStageChangeDialog({ isOpen: false, candidate: null, currentStage: '', newStage: '' });
      } catch (error) {
        console.error('Error updating candidate stage:', error);
      }
    }
  };

  const handleStatusChange = (candidate: Candidate, newStatus: any) => {
    if (!canModifyPipeline) {
      toast.warning('You do not have permission to modify the recruitment pipeline.');
      return;
    }
    const validation = validateTempCandidateStatusChange(candidate, newStatus);

    if (!validation.canChangeStage) {
      setTempCandidateAlert({
        isOpen: true,
        candidateName: candidate.name,
        message: validation.message || null,
      });
      return;
    }

    if (validation.shouldOpenCreateDialog) {
      setAutoCreateCandidateDialog({
        isOpen: true,
        candidate: candidate,
      });
      return;
    }

    if (newStatus === 'Disqualified') {
      setDisqualificationDialog({
        isOpen: true,
        candidate,
        newStatus,
      });
      return;
    }

    setStatusChangeDialog({
      isOpen: true,
      candidate,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!canModifyPipeline) {
      toast.warning('You do not have permission to modify the recruitment pipeline.');
      return;
    }
    if (statusChangeDialog.candidate && statusChangeDialog.newStatus) {
      try {
        await updateCandidateStatus(pipelineId, statusChangeDialog.candidate.id, {
          status: statusChangeDialog.newStatus,
          stage: mapUIStageToBackendStage(statusChangeDialog.candidate.currentStage),
          notes: `Status updated to ${statusChangeDialog.newStatus}`,
        });
        await queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
        setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null });
      } catch (error: any) {
        console.error('Error updating candidate status:', error);
        alert(error.message || 'Failed to update candidate status. Please try again.');
      }
    }
  };

  const handleConfirmInterviewDetails = async (dateTime: string, meetingLink: string) => {
    if (!canModifyPipeline) {
      toast.warning('You do not have permission to modify the recruitment pipeline.');
      return;
    }
    const candidate = interviewDialog.candidate;
    if (!candidate) return;
    try {
      const backendStage = mapUIStageToBackendStage('Interview');
      await updateCandidateStage(pipelineId, candidate.id, {
        newStage: backendStage,
        interviewDate: dateTime,
        interviewMeetingLink: meetingLink,
      });
      await queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
    } catch (error) {
      console.error('Error updating candidate stage to Interview:', error);
    } finally {
      setInterviewDialog({ isOpen: false, candidate: null });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !job || !candidate) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Pipeline
        </Button>
        <div className="text-red-600">Failed to load pipeline or candidate data. Probably the candidate does not exist in this pipeline.</div>
      </div>
    );
  }

  const handleUpdateCandidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId, "candidate", candidateId] });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] pb-2 flex flex-col">
      <div className="w-full px-2 mt-2 space-y-3">
        
        <CandidateHeaderCard 
          candidate={candidate} 
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
          canModify={canModifyPipeline}
        />
        
        <CandidateProgressCard 
          candidate={candidate} 
          selectedStage={selectedStage} 
          setSelectedStage={setSelectedStage} 
          stages={job.stages}
        />
        
        <CandidateDisqualificationCard candidate={candidate} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
          <PipelineStageDetails 
            candidate={candidate}
            selectedStage={selectedStage}
            onStageSelect={setSelectedStage}
            onUpdateCandidate={handleUpdateCandidate}
            pipelineId={pipelineId}
            canModify={canModifyPipeline}
          />
        </div>

        <CandidateInfoGrid candidate={candidate} />
        
        <CandidateDocumentsCard candidate={candidate} />
      </div>

      {/* Dialogs */}
      <StatusChangeConfirmationDialog
        isOpen={stageChangeDialog.isOpen}
        onClose={() => setStageChangeDialog({ isOpen: false, candidate: null, currentStage: '', newStage: '' })}
        onConfirm={handleConfirmStageChange}
        candidateName={stageChangeDialog.candidate?.name || ''}
        currentStage={stageChangeDialog.currentStage}
        newStage={stageChangeDialog.newStage}
      />

      <InterviewDetailsDialog
        isOpen={interviewDialog.isOpen}
        onClose={() => setInterviewDialog({ isOpen: false, candidate: null })}
        candidateName={interviewDialog.candidate?.name || ''}
        onConfirm={handleConfirmInterviewDetails}
      />

      <Dialog
        open={statusChangeDialog.isOpen}
        onOpenChange={(isOpen) => !isOpen && setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of {statusChangeDialog.candidate?.name} to {statusChangeDialog.newStatus}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} className="bg-blue-600 hover:bg-blue-700">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TempCandidateAlertDialog 
        isOpen={tempCandidateAlert.isOpen}
        onClose={() => setTempCandidateAlert({ isOpen: false, candidateName: null, message: null })}
        candidateName={tempCandidateAlert.candidateName || ''}
        message={tempCandidateAlert.message || undefined}
      />

      {autoCreateCandidateDialog.candidate && (
        <CreateCandidateModal
          isOpen={autoCreateCandidateDialog.isOpen}
          onClose={() => setAutoCreateCandidateDialog({ isOpen: false, candidate: null })}
          tempCandidateData={{
            name: autoCreateCandidateDialog.candidate.name,
            email: autoCreateCandidateDialog.candidate.email || '',
            phone: autoCreateCandidateDialog.candidate.phone || '',
          }}
          tempCandidateId={autoCreateCandidateDialog.candidate.id}
          pipelineId={pipelineId}
          isTempCandidateConversion={true}
          onCandidateCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
            toast.success("Candidate profile created and moved to CV Received stage!");
          }}
        />
      )}

      {disqualificationDialog.candidate && (
        <DisqualificationDialog
          isOpen={disqualificationDialog.isOpen}
          onClose={() => setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: null })}
          candidateName={disqualificationDialog.candidate?.name || ''}
          currentStage={disqualificationDialog.candidate.currentStage}
          currentStageStatus={disqualificationDialog.candidate.status as string}
          onConfirm={async (data) => {
            if (disqualificationDialog.candidate) {
              try {
                await updateCandidateStatus(pipelineId, disqualificationDialog.candidate.id, {
                  status: 'Disqualified',
                  stage: mapUIStageToBackendStage(disqualificationDialog.candidate.currentStage),
                  notes: data.disqualificationReason,
                });
                await queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
              } catch (error) {
                console.error("Disqualification error: ", error);
              }
            }
          }}
        />
      )}
    </div>
  );
}
