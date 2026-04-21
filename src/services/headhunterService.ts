import { api } from "@/lib/axios-config";

export interface HeadhunterProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSubmitted: number;
  totalAccepted: number;
  totalRejected: number;
}

export interface HeadhunterDashboard {
  jobs: any[];
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalSubmitted: number;
    totalAccepted: number;
  };
}

class HeadhunterService {
  /**
   * GET /api/headhunters
   * All users assigned as headhunter on any job
   */
  async getAllHeadhunters(): Promise<any[]> {
    const res = await api.get("/api/headhunters");
    return res.data?.data || [];
  }

  /**
   * GET /api/headhunters/available
   * All active users (for assignment dropdown)
   */
  async getAvailableHeadhunters(): Promise<any[]> {
    const res = await api.get("/api/headhunters/available");
    return res.data?.data || [];
  }

  /**
   * GET /api/headhunters/my-dashboard
   * Logged-in headhunter ke jobs + candidate submission counts
   */
  async getMyDashboard(): Promise<HeadhunterDashboard> {
    const res = await api.get("/api/headhunters/my-dashboard");
    return res.data?.data || { jobs: [], stats: {} };
  }

  /**
   * GET /api/headhunters/:userId/jobs
   * Jobs with per-job candidate stats (accepted/rejected/pending)
   */
  async getHeadhunterJobs(userId: string): Promise<any[]> {
    const res = await api.get(`/api/headhunters/${userId}/jobs`);
    return res.data?.data || [];
  }

  /**
   * GET /api/headhunters/:userId/candidates
   * All HeadhunterCandidates submitted, filter by jobId/status
   */
  /**
   * GET /api/headhunter-candidates
   * All HeadhunterCandidates created by the logged-in user
   */
  async getHeadhunterCandidates(params?: { jobId?: string; status?: string; page?: number; limit?: number; search?: string }): Promise<any> {
    const res = await api.get(`/api/headhunter-candidates`, { params });
    return res.data;
  }

  /**
   * GET /api/headhunters/:userId/profile
   * Profile + total submitted, accepted, rejected counts
   */
  async getHeadhunterProfile(userId: string): Promise<HeadhunterProfile> {
    const res = await api.get(`/api/headhunters/${userId}/profile`);
    return res.data?.data;
  }
}

export const headhunterService = new HeadhunterService();
