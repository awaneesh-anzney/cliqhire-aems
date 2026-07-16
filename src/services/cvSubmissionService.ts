import { api } from '@/lib/axios-config';
import { AxiosResponse } from 'axios';

export interface CvSubmissionResponsibility {
  _id: string;
  pipeline?: string;
  job?: any;
  candidate?: any;
  assignedTo: any;
  assignedBy: any;
  assignedAt: string;
  dueAt: string;
  status: 'PENDING' | 'OVERDUE' | 'SUBMITTED';
  submittedAt: string | null;
  cvSubmissionDate: string | null;
  isLate: boolean;
  remindersSent?: any;
  reopenCount: number;
  reassignCount: number;
  history: Array<{
    event: string;
    by?: any;
    to?: any;
    from?: any;
    reason?: string;
    at: string;
    reminderType?: string;
  }>;
}

export interface CvSubmissionResponse {
  success: boolean;
  message?: string;
  data: CvSubmissionResponsibility;
}

export interface CvSubmissionListResponse {
  success: boolean;
  message?: string;
  data: CvSubmissionResponsibility[];
}

export interface CvSubmissionSummary {
  totalAssigned: number;
  totalSubmitted: number;
  onTimeCount: number;
  lateCount: number;
  onTimePercentage: number;
  currentlyPending: number;
  currentlyOverdue: number;
  totalReopens: number;
  totalReassigns: number;
  delayReasons: Array<{
    candidateId: string;
    candidateName: string;
    jobId: string;
    jobTitle: string;
    reason: string;
    at: string;
  }>;
}

export interface CvSubmissionSummaryResponse {
  success: boolean;
  data: CvSubmissionSummary & { records?: any[] };
}

class CvSubmissionService {
  /**
   * Assign CV submission responsibility to a team member
   */
  async assign(data: { pipelineId: string; candidateId: string; assignedTo: string }): Promise<CvSubmissionResponse> {
    const response = await api.post('/api/cv-submission/assign', data);
    return response.data;
  }

  /**
   * Submit a reason for overdue CV submission and reset the 24h timer
   */
  async submitReason(id: string, reason: string): Promise<CvSubmissionResponse> {
    const response = await api.post(`/api/cv-submission/${id}/reason`, { reason });
    return response.data;
  }

  /**
   * Reassign CV submission to a different team member
   */
  async reassign(id: string, newAssignedTo: string, reason?: string): Promise<CvSubmissionResponse> {
    const response = await api.post(`/api/cv-submission/${id}/reassign`, { newAssignedTo, reason });
    return response.data;
  }

  /**
   * Mark CV as submitted directly (usually handled automatically by saving pipeline stage)
   */
  async submit(id: string, cvSubmissionDate?: string): Promise<CvSubmissionResponse> {
    const response = await api.post(`/api/cv-submission/${id}/submit`, { cvSubmissionDate });
    return response.data;
  }

  /**
   * Get history for a specific candidate and job
   */
  async getHistory(candidateId: string, jobId: string): Promise<CvSubmissionListResponse> {
    const response = await api.get(`/api/cv-submission/candidate/${candidateId}/job/${jobId}`);
    return response.data;
  }

  /**
   * Get active tasks for the current user
   */
  async getMyTasks(): Promise<CvSubmissionListResponse> {
    const response = await api.get('/api/cv-submission/my-tasks');
    return response.data;
  }

  /**
   * Get job-level summary statistics
   */
  async getJobSummary(jobId: string): Promise<CvSubmissionSummaryResponse> {
    const response = await api.get(`/api/cv-submission/job/${jobId}/summary`);
    return response.data;
  }

  /**
   * Get org-wide or filtered summary statistics
   */
  async getSummary(params?: { recruiterId?: string; jobId?: string; from?: string; to?: string }): Promise<CvSubmissionSummaryResponse> {
    const response = await api.get('/api/cv-submission/summary', { params });
    return response.data;
  }
}

export const cvSubmissionService = new CvSubmissionService();
