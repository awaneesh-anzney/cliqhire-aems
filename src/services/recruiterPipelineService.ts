import { api } from '@/lib/axios-config';

// =========================
// Recruiter Pipeline Service (Updated API v2)
// =========================

export interface PipelineStage {
  templateId?: string;
  name: string;
  order: number;
  color?: string;
  isTerminal: boolean;
  allowedStatuses: string[];
  defaultStatus: string;
  responsiblePosition?: string;
}

export interface StageHistory {
  _id?: string;
  stage: string;
  status: string;
  movedBy?: string;
  movedAt: string;
  notes?: string;
  data?: Record<string, any>;
}

export interface PipelineCandidate {
  candidateId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  currentStage: string;
  currentStatus: string;
  priority?: string;
  addedAt: string;
  lastUpdated?: string;
  stageHistory?: StageHistory[];
  rejectionHistory?: any[];
}

export interface Pipeline {
  _id: string;
  status: string;
  priority?: string;
  totalCandidates?: number;
  activeCandidates?: number;
  completedCandidates?: number;
  stages?: PipelineStage[];
  candidates?: PipelineCandidate[];
  jobId?: {
    _id: string;
    jobTitle: string;
    jobId?: string;
    client?: { name: string; email?: string };
    jobTeamMembers?: any[];
  };
  createdAt?: string;
}

export interface StageFieldUpdate {
  status?: string;
  notes?: string;
  data?: Record<string, any>;
}

export interface StageUpdateResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class RecruiterPipelineService {
  // ─── Pipeline CRUD ───────────────────────────────────────────

  /**
   * Create pipeline manually for a job
   */
  static async createPipeline(
    jobId: string,
    priority?: string,
    notes?: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.post('/api/recruiter-pipeline/create', { jobId, priority, notes });
      return { success: true, message: 'Pipeline created', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create pipeline',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get pipelines visible to the current user (role-scoped)
   */
  static async getMyPipelines(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<StageUpdateResponse> {
    try {
      const response = await api.get('/api/recruiter-pipeline/my', { params });
      return { success: true, message: 'Pipelines fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch pipelines',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get all pipelines (admin sees all)
   */
  static async getAllPipelines(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<StageUpdateResponse> {
    try {
      const response = await api.get('/api/recruiter-pipeline', { params });
      return { success: true, message: 'Pipelines fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch pipelines',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get a single pipeline with full detail (stages + candidates)
   */
  static async getPipelineEntry(pipelineId: string): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(`/api/recruiter-pipeline/entry/${pipelineId}`);
      return { success: true, message: 'Pipeline fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch pipeline',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Update pipeline status
   */
  static async updatePipelineStatus(
    pipelineId: string,
    status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.patch(`/api/recruiter-pipeline/${pipelineId}/status`, { status });
      return { success: true, message: 'Status updated', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update status',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Delete a pipeline
   */
  static async deletePipeline(pipelineId: string): Promise<StageUpdateResponse> {
    try {
      const response = await api.delete(`/api/recruiter-pipeline/${pipelineId}`);
      return { success: true, message: 'Pipeline deleted', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete pipeline',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get allowed statuses for all stages in a pipeline
   */
  static async getPipelineStatuses(pipelineId: string): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(`/api/recruiter-pipeline/${pipelineId}/statuses`);
      return { success: true, message: 'Statuses fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch statuses',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get allowed statuses for a specific stage
   */
  static async getStageStatuses(pipelineId: string, stageName: string): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(
        `/api/recruiter-pipeline/${pipelineId}/statuses/${encodeURIComponent(stageName)}`
      );
      return { success: true, message: 'Stage statuses fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch stage statuses',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ─── Candidate Management ────────────────────────────────────

  /**
   * Add a candidate to a pipeline
   */
  static async addCandidateToPipeline(
    pipelineId: string,
    candidateId: string,
    options?: { priority?: string; notes?: string; initialStage?: string }
  ): Promise<StageUpdateResponse> {
    try {
      const requestBody = {
        candidateId,           // ✅ JSON object ke andar bhej raha hai
        ...options,
      };

      const response = await api.post(
        `/api/recruiter-pipeline/${pipelineId}/candidates`,
        requestBody,           // ✅ Axios automatically Content-Type: application/json lagata hai
      );

      return { success: true, message: 'Candidate added', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to add candidate',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get a single candidate's detail in a pipeline
   */
  static async getCandidateInPipeline(
    pipelineId: string,
    candidateId: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}`
      );
      return { success: true, message: 'Candidate fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch candidate',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Move candidate to a different stage
   * Stage name must match pipeline.stages[].name exactly
   */
  static async moveCandidateToStage(
    pipelineId: string,
    candidateId: string,
    stage: string,
    status?: string,
    notes?: string,
    data?: Record<string, any>
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.patch(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/stage`,
        { stage, status, notes, data }
      );
      return { success: true, message: 'Candidate moved', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to move candidate',
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
      };
    }
  }

  /**
   * Update stage data / status without changing stage
   */
  static async updateStageData(
    pipelineId: string,
    candidateId: string,
    update: StageFieldUpdate
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.patch(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/stage-data`,
        update
      );
      return { success: true, message: 'Stage data updated', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update stage data',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get full stage history of a candidate
   */
  static async getCandidateHistory(
    pipelineId: string,
    candidateId: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/history`
      );
      return { success: true, message: 'History fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch history',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Reject a candidate (moves to Disqualified stage)
   */
  static async rejectCandidate(
    pipelineId: string,
    candidateId: string,
    rejectionReason: string,
    feedback?: string,
    canReapply?: boolean,
    reapplyDate?: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.patch(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/reject`,
        { rejectionReason, feedback, canReapply, reapplyDate }
      );
      return { success: true, message: 'Candidate rejected', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to reject candidate',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Remove candidate from pipeline
   */
  static async removeCandidateFromPipeline(
    pipelineId: string,
    candidateId: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.delete(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}`
      );
      return { success: true, message: 'Candidate removed', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to remove candidate',
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ─── Interview Rounds ────────────────────────────────────────

  /**
   * Add a new interview round
   */
  static async addInterviewRound(
    pipelineId: string,
    candidateId: string,
    roundData: any
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.post(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/interview-rounds`,
        roundData
      );
      return { success: true, message: 'Interview round added', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add interview round',
        error: error.message,
      };
    }
  }

  /**
   * Update an existing interview round
   */
  static async updateInterviewRound(
    pipelineId: string,
    candidateId: string,
    roundId: string,
    roundData: any
  ): Promise<StageUpdateResponse> {
    try {
      const url = `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/interview-rounds/${roundId}`;
      console.log(`PATCH Request to: ${url}`, roundData);
      const response = await api.patch(url, roundData);
      return { success: true, message: 'Interview round updated', data: response.data };
    } catch (error: any) {
      console.error('PATCH Request Failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update interview round',
        error: error.message,
      };
    }
  }

  /**
   * Get all interview rounds for a candidate
   */
  static async getInterviewRounds(
    pipelineId: string,
    candidateId: string
  ): Promise<StageUpdateResponse> {
    try {
      const response = await api.get(
        `/api/recruiter-pipeline/${pipelineId}/candidates/${candidateId}/interview-rounds`
      );
      return { success: true, message: 'Interview rounds fetched', data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch interview rounds',
        error: error.message,
      };
    }
  }

  // ─── Legacy compat (for existing hooks that reference old method names) ─

  /** @deprecated Use updateStageData instead */
  static async updateStageFields(
    pipelineId: string,
    candidateId: string,
    _stageName: string,
    updateData: { fields: Record<string, any>; notes?: string }
  ): Promise<StageUpdateResponse> {
    return this.updateStageData(pipelineId, candidateId, {
      data: updateData.fields,
      notes: updateData.notes,
    });
  }

  /** @deprecated Use getPipelineEntry instead */
  static async getPipelineCandidates(pipelineId: string): Promise<StageUpdateResponse> {
    return this.getPipelineEntry(pipelineId);
  }
}
