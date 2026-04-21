import { api } from "@/lib/axios-config";

export interface HeadhunterCandidatePayload {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  description?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  nationality?: string;
  educationDegree?: string;
  willingToRelocate?: string;
}

export interface HeadhunterCandidateResponse {
  success: boolean;
  data?: any;
  message?: string;
}

class HeadhunterCandidatesService {
  async createCandidate(candidateData: FormData | HeadhunterCandidatePayload): Promise<any> {
    if (candidateData instanceof FormData) {
      const response = await api.post(`/api/headhunter-candidates`, candidateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data || response.data;
    } else {
      const response = await api.post(`/api/headhunter-candidates`, candidateData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data?.data || response.data;
    }
  }

  async getCandidates(): Promise<any[]> {
    const response = await api.get(`/api/headhunter-candidates`);
    return response.data?.data || response.data || [];
  }

  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/api/headhunter-candidates/${id}`);
  }

  async getJobsSummary(headhunterId: string): Promise<any[]> {
    const response = await api.get(`/api/jobs/headhunter/${headhunterId}/summary`);
    const data = response.data?.data || response.data?.jobs || [];
    return Array.isArray(data) ? data : [];
  }

  async getCandidateSubmissionJobs(candidateId: string): Promise<any[]> {
    const response = await api.get(`/api/headhunter-candidates/${candidateId}/jobs`);
    const data = response.data?.data || response.data?.jobs || [];
    return Array.isArray(data) ? data : [];
  }

  async submitToJob(jobId: string, candidateIds: string[] | string): Promise<any> {
    const payload = Array.isArray(candidateIds)
      ? { jobId, candidateIds }
      : { jobId, candidateId: candidateIds };
    const response = await api.post(`/api/headhunter-candidates/submit-to-job`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data?.data || response.data;
  }

  async getPendingApprovals(params: { jobId: string; status?: string; page?: number; limit?: number }): Promise<any> {
    const response = await api.get(`/api/headhunter-candidates/pending-approval`, { params });
    return response.data;
  }

  async updateSubmissionStatus(candidateId: string, jobId: string, status: "ACCEPTED" | "REJECTED", rejectionReason?: string): Promise<any> {
    const response = await api.patch(`/api/headhunter-candidates/${candidateId}/jobs/${jobId}/status`, {
      status,
      rejectionReason
    });
    return response.data;
  }

  async getJobCandidates(jobId: string): Promise<any[]> {
    const response = await api.get(`/api/jobs/${jobId}/headhunter-candidates`);
    const data = response.data?.data || response.data?.candidates || [];
    return Array.isArray(data) ? data : [];
  }

  async updateCandidate(id: string, payload: Record<string, any> | FormData): Promise<any> {
    if (payload instanceof FormData) {
      const response = await api.patch(`/api/headhunter-candidates/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data || response.data;
    } else {
      const response = await api.patch(`/api/headhunter-candidates/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data?.data || response.data;
    }
  }
}

export const headhunterCandidatesService = new HeadhunterCandidatesService();