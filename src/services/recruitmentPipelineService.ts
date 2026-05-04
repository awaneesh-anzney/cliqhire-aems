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
  createdAt?: string;
  updatedAt?: string;
  assignedDate?: string;
  jobId: {
    _id: string;
    jobTitle: string;
    jobId?: string;
    client?: { 
      _id: string;
      name: string;
    };
    location?: string;
    jobType?: string;
    deadlineByClient?: string | null;
    jobTeamMembers?: any[];
    stage?: string;
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

export interface CandidatePipelineInfo {
  candidateId: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    location?: string;
    resume?: string;
    status: string;
  };
  currentStage: string;
  status?: string;
  currentStatus?: string;
  notes?: string;
  priority?: string;
  addedAt?: string;
  lastUpdated?: string;
}

export interface GetPipelineEntryResponse {
  success: boolean;
  data: {
    _id: string;
    jobId: {
      _id: string;
      jobId?: string;
      jobTitle: string;
      client?: { 
        _id: string;
        name: string;
      };
      location?: string;
      jobType?: string;
      deadlineByClient?: string | null;
      jobTeamMembers?: Array<{
        position: string;
        positionLabel: string;
        users: Array<{
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
          teamRole: string;
        }>;
        addedAt: string;
      }>;
    };
    stages: Array<{
      templateId: string;
      name: string;
      order: number;
      color: string;
      description: string;
      isTerminal: boolean;
      allowedStatuses: string[];
      defaultStatus: string;
      responsiblePosition: string | null;
    }>;
    status: string;
    priority?: string;
    totalCandidates: number;
    activeCandidates: number;
    completedCandidates: number;
    droppedCandidates?: number;
    createdAt: string;
    updatedAt: string;
    candidates: {
      data: Array<{
        candidateId: {
          _id: string;
          status: string;
          phone: string;
          email: string;
          name?: string;
          firstName?: string;
          lastName?: string;
        };
        currentStage: string;
        currentStatus: string;
        priority?: string;
        notes: string;
        addedAt: string;
        lastUpdated: string;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        total: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      filters: {
        stage: string | null;
        currentStatus: string | null;
        priority: string | null;
      };
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
  stage?: string;         // Must match pipeline.stages[].name exactly
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

export interface ConvertTempCandidateRequest {
  name: string;
  email: string;
  phone: string;
  location?: string;
  description?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  nationality?: string;
  educationDegree?: string;
  willingToRelocate?: string;
  linkedin?: string;
  continent?: string;
  countryCode?: string;
  otherCountryCode?: string;
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
 * Alias for createPipelineForJob (backward compatibility)
 */
export const createPipeline = createPipelineForJob;

/**
 * Get pipeline entry detail — includes stages[], candidates[], job info
 */
export const getPipelineEntry = async (
  pipelineId: string,
  options?: { page?: number; limit?: number; stage?: string; currentStatus?: string; priority?: string }
): Promise<any> => {
  try {
    const params: any = {};
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.stage) params.stage = options.stage;
    if (options?.currentStatus) params.currentStatus = options.currentStatus;
    if (options?.priority) params.priority = options.priority;
    
    const response = await api.get(`/api/recruiter-pipeline/entry/${pipelineId}`, { params });
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
  candidateId: string,
  options?: { priority?: string; notes?: string; initialStage?: string }
): Promise<AddJobToPipelineResponse> => {
  try {
    const response = await api.post(
      `/api/recruiter-pipeline/${pipelineId}/candidates`,
      {
        candidateId,  // ✅ string ko JSON object mein wrap kiya
        ...options,
      }
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
  update: { status?: string; notes?: string; stage?: string; data?: Record<string, any>; [key: string]: any }
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
 * Update candidate status within the current stage.
 * This is an alias for updateCandidateStageData for better semantic clarity.
 */
export const updateCandidateStatus = async (
  pipelineId: string,
  candidateId: string,
  update: { status?: string; notes?: string; stage?: string; data?: Record<string, any>; [key: string]: any }
): Promise<UpdateCandidateStageResponse> => {
  return updateCandidateStageData(pipelineId, candidateId, update);
};

/**
 * Get single candidate details within a pipeline
 */
export const getPipelineCandidateDetails = async (
  pipelineId: string,
  candidateId: string
): Promise<any> => {
  try {
    const response = await api.get(
      `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pipeline candidate details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch candidate details');
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

/**
 * Convert a temp candidate to a real one within a pipeline.
 * This will create a full candidate profile and update the pipeline entry.
 */
export const convertTempCandidateToReal = async (
  pipelineId: string,
  tempCandidateId: string,
  candidateData: ConvertTempCandidateRequest
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
  try {
    const response = await api.post(
      `/api/temp-candidates/${tempCandidateId}/convert`,
      candidateData
    );
    return { success: true, message: 'Candidate converted successfully', data: response.data };
  } catch (error: any) {
    console.error('Error converting temp candidate:', error);
    return {
      success: false,
      message: 'Failed to convert candidate',
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Export candidates from a pipeline to Excel.
 * If stages is empty, exports all candidates.
 */
export const exportCandidatesToExcel = async (
  pipelineId: string,
  stages: string[] = []
): Promise<Blob> => {
  try {
    const response = await api.get(`/api/recruiter-pipeline/${pipelineId}/export`, {
      params: { stages: stages.join(',') },
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting pipeline candidates:', error);
    throw new Error(error.response?.data?.message || 'Failed to export candidates');
  }
};


// ─── Legacy compat aliases (used in existing components) ──────────────────────

/** @deprecated use addCandidateToPipeline */
export const addCandidateToPipelineOld = async (
  pipelineId: string,
  candidateId: string
) => addCandidateToPipeline(pipelineId, candidateId);

/** @deprecated use updateCandidateStage */
export const moveCandidateToStage = updateCandidateStage;
