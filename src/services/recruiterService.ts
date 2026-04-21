import { api } from "@/lib/axios-config";
import type { RecruiterJob, RecruiterCandidate } from "@/components/recruiter/types";

export interface RecruiterProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalJobs: number;
  totalCandidates: number;
  totalHired: number;
}

export interface RecruiterDashboard {
  jobs: RecruiterJob[];
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalCandidates: number;
    hiredCandidates: number;
  };
}

class RecruiterService {
  /**
   * GET /api/recruiters
   * All users assigned as recruiter on any job
   */
  async getAllRecruiters(): Promise<any[]> {
    const res = await api.get("/api/recruiters");
    return res.data?.data || [];
  }

  /**
   * GET /api/recruiters/available
   * All active users (for assignment dropdown)
   */
  async getAvailableRecruiters(): Promise<any[]> {
    const res = await api.get("/api/recruiters/available");
    return res.data?.data || [];
  }

  /**
   * GET /api/recruiters/my-dashboard
   * Logged-in user ke assigned jobs + pipeline stats
   */
  async getMyDashboard(): Promise<RecruiterDashboard> {
    const res = await api.get("/api/recruiters/my-dashboard");
    return res.data?.data || { jobs: [], stats: {} };
  }

  /**
   * GET /api/recruiters/:userId/jobs
   * Specific recruiter ke jobs with pipeline counts
   */
  async getRecruiterJobs(userId: string): Promise<RecruiterJob[]> {
    const res = await api.get(`/api/recruiters/${userId}/jobs`);
    return res.data?.data || [];
  }

  /**
   * GET /api/recruiters/:userId/pipelines
   * Those jobs ki pipelines
   */
  async getRecruiterPipelines(userId: string): Promise<any[]> {
    const res = await api.get(`/api/recruiters/${userId}/pipelines`);
    return res.data?.data || [];
  }

  /**
   * GET /api/recruiters/:userId/profile
   * Profile + total jobs, candidates, hired stats
   */
  async getRecruiterProfile(userId: string): Promise<RecruiterProfile> {
    const res = await api.get(`/api/recruiters/${userId}/profile`);
    return res.data?.data;
  }

  // Legacy or auxiliary methods
  async getHeadhunterAssignedJobs(
    roleSegment: "recruiter" | "teamLead" | "hiringManager",
    userId: string
  ): Promise<RecruiterJob[]> {
    const url = `/api/jobs/internal-team/${roleSegment}/${userId}/headhunter-assigned`;
    const res = await api.get(url);
    const items = res?.data?.data || [];

    return items.map((job: any) => {
      const candidates: RecruiterCandidate[] = (job.headhunterCandidates || []).map((c: any, idx: number) => {
        const candidateApiId = c.candidateId || c._id || c.id || undefined;

        return {
          id: candidateApiId || c.email || c.phone || `${c.name || ""}-${idx}`,
          apiId: candidateApiId,
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          location: c.location || "",
          status: (c.status || "").toString(),
          currentStage: "",
          resume: c.resume || c.resumeUrl || "",
          rejectedDate: c.rejectedDate || undefined,
          rejectionReason: c.rejectionReason || undefined,
        };
      });

      const sr = job.salaryRange;
      const min = sr?.min ?? job.minimumSalary;
      const max = sr?.max ?? job.maximumSalary;
      const currency = sr?.currency ?? job.salaryCurrency;
      const salaryRangeStr =
        min != null && max != null && currency
          ? `${min} - ${max} ${currency}`
          : undefined;

      return {
        id: job._id,
        title: job.jobTitle,
        clientName: job.client?.name || "",
        location: job.location,
        salaryRange: salaryRangeStr,
        headcount: job.headcount,
        jobType: job.jobType,
        isExpanded: false,
        candidates,
        jobId: { stage: job.stage || "" },
        totalCandidates: candidates.length,
      } as RecruiterJob;
    });
  }

  async updateCandidateStatusForJob(
    candidateId: string,
    jobId: string,
    body: { status: string; rejectionReason?: string; rejectionReason1?: string }
  ): Promise<any> {
    const url = `/api/headhunter-candidates/${candidateId}/jobs/${jobId}/status`;
    const res = await api.patch(url, body, { headers: { "Content-Type": "application/json" } });
    return res.data?.data || res.data;
  }
}

export const recruiterService = new RecruiterService();
// Export legacy function for compatibility if needed, though we should transition
export const getHeadhunterAssignedJobs = recruiterService.getHeadhunterAssignedJobs;
