import { api } from "@/lib/axios-config";
import { CandidateDomain } from "./candidateService";

export interface CandidateDomainsResponse {
  status: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  results: number;
  data: CandidateDomain[];
}

class CandidateDomainService {
  async getCandidateDomains(params?: {
    page?: number;
    limit?: number;
    name?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<CandidateDomainsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.name) queryParams.append("name", params.name);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.isActive !== undefined) {
        queryParams.append("isActive", params.isActive.toString());
      }

      const response = await api.get(`/api/candidate-domains?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate domains:", error);
      throw error;
    }
  }

  async createCandidateDomain(domainData: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<CandidateDomain> {
    try {
      const response = await api.post("/api/candidate-domains", domainData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating candidate domain:", error);
      throw error;
    }
  }
}

export const candidateDomainService = new CandidateDomainService();
export default candidateDomainService;
