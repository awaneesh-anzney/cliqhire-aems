import { api } from '@/lib/axios-config';

// ============================================================
// recruitmentPipelineService.ts — Updated for API v2
// Key changes:
//   - addCandidate: POST /api/recruiter-pipeline/:id/candidates
//   - moveStage:    PATCH /api/recruiter-pipeline/:id/candidates/:cid/stage
//   - stageData:    PATCH /api/recruiter-pipeline/:id/candidates/:cid/stage-data
//   - history:      GET   /api/recruiter-pipeline/:id/candidates/:cid/history
//   - reject:       PATCH /api/recruiter-pipeline/:id/candidates/:cid/reject
//   - entry:        GET   /api/recruiter-pipeline/entry/:id
//   - list:         GET   /api/recruiter-pipeline/my
// ============================================================

export interface CreatePipelineRequest {
  jobId: string;
  priority?: string;
  notes?: string;
}

export interface AddJobToPipelineResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface PipelineListItem {
  _id: string;
  status: string;
  priority?: string;
  totalCandidates: number;
  activeCandidates: number;
  completedCandidates: number;
  droppedCandidates?: number;
  jobId: {
    _id: string;
    jobTitle: string;
    jobId?: string;
    client?: { name: string };
    jobTeamMembers?: any[];
  };
}

export interface GetAllPipelineEntriesResponse {
  success: boolean;
  data: {
    pipelines: PipelineListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
      totalPipelines?: number;
    };
  };
  message?: string;
}

export interface StageData {
  screeningDate?: string;
  screeningNotes?: string;
  aemsInterviewDate?: string;
  screeningStatus?: string;
  technicalAssessment?: string;
  softSkillsAssessment?: string;
  overallRating?: number;
  feedback?: string;
  [key: string]: any;
}

export interface UpdateCandidateStageRequest {
  stage: string;         // Must match pipeline.stages[].name exactly
  status?: string;       // Must be in stage.allowedStatuses
  notes?: string;
  data?: Record<string, any>;
  // Legacy compat fields
  newStage?: string;
  stageData?: StageData;
  interviewDate?: string;
  interviewMeetingLink?: string;
}

export interface UpdateCandidateStageResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface DeleteCandidateResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface AddCandidateToPipelineRequest {
  candidateId: string;
  priority?: string;
  notes?: string;
  initialStage?: string;
}

// ─── Pipeline CRUD ────────────────────────────────────────────────────────────

/**
 * Create a pipeline manually for a job.
 * Note: pipelines are also auto-created when a team is first assigned.
 */
export const createPipelineForJob = async (
  request: CreatePipelineRequest
): Promise<AddJobToPipelineResponse> => {
  try {
    const response = await api.post('/api/recruiter-pipeline/create', request);
    return response.data;
  } catch (error: any) {
    console.error('Error creating pipeline:', error);
    throw new Error(error.response?.data?.message || 'Failed to create pipeline');
  }
};

/**
 * Get pipeline entry detail — includes stages[], candidates[], job info
 */
export const getPipelineEntry = async (pipelineId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/recruiter-pipeline/entry/${pipelineId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pipeline entry:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pipeline entry');
  }
};

/**
 * Get pipelines visible to the current user (role-scoped).
 * ADMIN sees all; others see only jobs they are assigned to.
 */
export const getAllPipelineEntries = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<GetAllPipelineEntriesResponse> => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;
    const response = await api.get('/api/recruiter-pipeline/my', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pipeline entries:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pipeline entries');
  }
};

/**
 * Update pipeline status: Active | On Hold | Completed | Cancelled
 */
export const updatePipelineStatus = async (
  pipelineId: string,
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await api.patch(`/api/recruiter-pipeline/${pipelineId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update pipeline status');
  }
};

/**
 * Delete a pipeline
 */
export const deletePipeline = async (
  pipelineId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/recruiter-pipeline/${pipelineId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete pipeline');
  }
};

// ─── Stage statuses ───────────────────────────────────────────────────────────

/**
 * Get allowed statuses for all stages in a pipeline (dynamic from templates)
 */
export const getPipelineStageStatuses = async (pipelineId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/recruiter-pipeline/${pipelineId}/statuses`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stage statuses');
  }
};

// ─── Candidate Management ──────────────────────────────────────────────────────

/**
 * Add a candidate to a pipeline.
 * If initialStage is omitted, defaults to the first non-terminal stage.
 */
export const addCandidateToPipeline = async (
  pipelineId: string,
  request: AddCandidateToPipelineRequest
): Promise<AddJobToPipelineResponse> => {
  try {
    const response = await api.post(
      `/api/recruiter-pipeline/${pipelineId}/candidates`,
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding candidate to pipeline:', error);
    throw new Error(error.response?.data?.message || 'Failed to add candidate to pipeline');
  }
};

/**
 * Move candidate to a different stage.
 * Accepts both v2 (stage/status/notes/data) and legacy (newStage/stageData) shapes.
 */
export const updateCandidateStage = async (
  pipelineId: string,
  candidateId: string,
  request: UpdateCandidateStageRequest
): Promise<UpdateCandidateStageResponse> => {
  try {
    // Normalise: support both v2 and legacy field names
    const payload = {
      stage: request.stage || request.newStage,
      status: request.status,
      notes: request.notes,
      data: request.data || (request.stageData
        ? {
            ...request.stageData,
            ...(request.interviewDate ? { interviewDate: request.interviewDate } : {}),
            ...(request.interviewMeetingLink ? { interviewMeetingLink: request.interviewMeetingLink } : {}),
          }
        : undefined),
    };

    const response = await api.patch(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/stage`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating candidate stage:', error);
    throw new Error(error.response?.data?.message || 'Failed to update candidate stage');
  }
};

/**
 * Update stage data / status without changing the stage.
 */
export const updateCandidateStageData = async (
  pipelineId: string,
  candidateId: string,
  update: { status?: string; notes?: string; data?: Record<string, any> }
): Promise<UpdateCandidateStageResponse> => {
  try {
    const response = await api.patch(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/stage-data`,
      update
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update stage data');
  }
};

/**
 * Get full stage history of a candidate
 */
export const getCandidateHistory = async (
  pipelineId: string,
  candidateId: string
): Promise<any> => {
  try {
    const response = await api.get(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/history`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch candidate history');
  }
};

/**
 * Reject a candidate — automatically moves to Disqualified stage
 */
export const rejectCandidate = async (
  pipelineId: string,
  candidateId: string,
  rejectionReason: string,
  feedback?: string,
  canReapply?: boolean,
  reapplyDate?: string
): Promise<UpdateCandidateStageResponse> => {
  try {
    const response = await api.patch(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/reject`,
      { rejectionReason, feedback, canReapply, reapplyDate }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject candidate');
  }
};

/**
 * Remove candidate from pipeline
 */
export const deleteCandidateFromPipeline = async (
  pipelineId: string,
  candidateId: string
): Promise<DeleteCandidateResponse> => {
  try {
    const response = await api.delete(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting candidate:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete candidate');
  }
};

// ─── Legacy compat aliases (used in existing components) ──────────────────────

/** @deprecated use addCandidateToPipeline */
export const addCandidateToPipelineOld = async (
  pipelineId: string,
  candidateId: string
) => addCandidateToPipeline(pipelineId, { candidateId });

/** @deprecated use updateCandidateStage */
export const moveCandidateToStage = updateCandidateStage;
