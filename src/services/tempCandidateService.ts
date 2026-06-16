import { api } from "@/lib/axios-config";

// You can configure this base URL to point to your backend API

export interface CreateTempCandidateRequest {
  name: string;
  profileLink: string;
  email?: string;
  phone?: string;
  pipelineId: string;
}

export interface TempCandidate {
  id: string;
  name: string;
  profileLink: string;
  email?: string;
  phone?: string;
  pipelineId: string;
  createdAt: string;
  updatedAt: string;
}

export const tempCandidateService = {
  async createTempCandidate(data: CreateTempCandidateRequest): Promise<TempCandidate> {
    const response = await api.post(`/api/temp-candidates`, data);
    return response.data;
  },

  async getTempCandidates(pipelineId?: string): Promise<TempCandidate[]> {
    const params = pipelineId ? { pipelineId } : {};
    const response = await api.get(`/api/temp-candidates`, { params });
    return response.data;
  },

  async getTempCandidateById(id: string): Promise<TempCandidate> {
    const response = await api.get(`/api/temp-candidates/${id}`);
    return response.data;
  },

  async updateTempCandidate(
    id: string,
    data: Partial<CreateTempCandidateRequest>,
  ): Promise<TempCandidate> {
    const response = await api.put(`/api/temp-candidates/${id}`, data);
    return response.data;
  },

  async deleteTempCandidate(id: string): Promise<void> {
    await api.delete(`/api/temp-candidates/${id}`);
  },
};
