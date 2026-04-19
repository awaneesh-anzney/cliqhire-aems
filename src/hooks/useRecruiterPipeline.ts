import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RecruiterPipelineService, type StageFieldUpdate } from '@/services/recruiterPipelineService';
import { toast } from 'sonner';

export interface UseRecruiterPipelineProps {
  pipelineId: string;
  candidateId: string;
}

/**
 * Hook for managing a single candidate's progress in a pipeline.
 * Uses the new API v2 endpoints (stage-data, stage, history, reject).
 */
export const useRecruiterPipeline = ({ pipelineId, candidateId }: UseRecruiterPipelineProps) => {
  const queryClient = useQueryClient();

  // ── Stage data update (no stage change) ─────────────────────
  const updateStageDataMutation = useMutation({
    mutationFn: async (update: StageFieldUpdate) => {
      const response = await RecruiterPipelineService.updateStageData(
        pipelineId,
        candidateId,
        update
      );
      if (!response.success) throw new Error(response.error || 'Failed to update stage data');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update');
    },
  });

  // ── Move to a different stage ────────────────────────────────
  const moveCandidateToStageMutation = useMutation({
    mutationFn: async ({
      stage,
      status,
      notes,
      data,
    }: {
      stage: string;
      status?: string;
      notes?: string;
      data?: Record<string, any>;
    }) => {
      const response = await RecruiterPipelineService.moveCandidateToStage(
        pipelineId,
        candidateId,
        stage,
        status,
        notes,
        data
      );
      if (!response.success) throw new Error(response.error || 'Failed to move candidate');
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Candidate moved to "${variables.stage}" stage`);
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to move candidate');
    },
  });

  // ── Reject candidate ─────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: async ({
      rejectionReason,
      feedback,
      canReapply,
      reapplyDate,
    }: {
      rejectionReason: string;
      feedback?: string;
      canReapply?: boolean;
      reapplyDate?: string;
    }) => {
      const response = await RecruiterPipelineService.rejectCandidate(
        pipelineId,
        candidateId,
        rejectionReason,
        feedback,
        canReapply,
        reapplyDate
      );
      if (!response.success) throw new Error(response.error || 'Failed to reject candidate');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Candidate rejected and moved to Disqualified');
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject candidate');
    },
  });

  // ── Legacy compat: updateStageField maps to updateStageData ──
  const updateStageField = async (
    _stageName: string, // not needed in new API, kept for backwards compat
    fieldKey: string,
    fieldValue: any,
    notes?: string
  ) => {
    try {
      await updateStageDataMutation.mutateAsync({
        data: { [fieldKey]: fieldValue },
        notes: notes || `Updated ${fieldKey}`,
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // ── Legacy: getStageFields (reads from pipeline entry) ───────
  const getStageFields = async (_stageName: string) => {
    try {
      const response = await RecruiterPipelineService.getCandidateInPipeline(pipelineId, candidateId);
      if (response.success) return { success: true, data: response.data };
      return { success: false, error: response.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ── Legacy: moveCandidateToStage (simplified) ─────────────────
  const moveCandidateToStage = async (newStage: string, notes?: string) => {
    try {
      await moveCandidateToStageMutation.mutateAsync({ stage: newStage, notes });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return {
    isLoading:
      updateStageDataMutation.isPending ||
      moveCandidateToStageMutation.isPending ||
      rejectMutation.isPending,
    error:
      updateStageDataMutation.error?.message ||
      moveCandidateToStageMutation.error?.message ||
      rejectMutation.error?.message ||
      null,

    // New API surface
    updateStageData: (update: StageFieldUpdate) =>
      updateStageDataMutation.mutateAsync(update),
    moveToStage: (
      stage: string,
      status?: string,
      notes?: string,
      data?: Record<string, any>
    ) => moveCandidateToStageMutation.mutateAsync({ stage, status, notes, data }),
    rejectCandidate: (
      reason: string,
      feedback?: string,
      canReapply?: boolean,
      reapplyDate?: string
    ) => rejectMutation.mutateAsync({ rejectionReason: reason, feedback, canReapply, reapplyDate }),

    // Legacy compat
    updateStageField,
    getStageFields,
    moveCandidateToStage,

    clearError: () => {
      updateStageDataMutation.reset();
      moveCandidateToStageMutation.reset();
      rejectMutation.reset();
    },
  };
};
