import { api } from "@/lib/axios-config";

export interface PerformanceStats {
  submitted: number;
  hired: number;
  dropped: number;
  conversionRate: number;
}

export interface UserPerformanceStats extends PerformanceStats {
  userId: string;
  name: string;
  email: string;
}

export interface PerformanceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PerformanceParams {
  from?: string;
  to?: string;
}

export interface TeamPerformanceParams extends PerformanceParams {
  jobId?: string;
  clientId?: string;
}

export interface JobTeamMemberPerformance extends UserPerformanceStats {}

export interface JobTeamPosition {
  position: string;
  positionLabel: string;
  users: JobTeamMemberPerformance[];
}

export interface JobPerformanceData {
  jobId: string;
  jobTitle: string;
  client: {
    _id: string;
    name: string;
  };
  team: JobTeamPosition[];
  jobTotals: PerformanceStats;
}

export interface JobBasedTeamPerformanceData {
  jobs: JobPerformanceData[];
  byPosition: Record<string, JobTeamMemberPerformance[]>;
}

export const getMyPerformance = async (params?: PerformanceParams): Promise<PerformanceStats> => {
  const response = await api.get<PerformanceResponse<PerformanceStats>>('/api/performance/me', { params });
  return response.data.data;
};

export const getUsersPerformance = async (params?: PerformanceParams): Promise<UserPerformanceStats[]> => {
  const response = await api.get<PerformanceResponse<UserPerformanceStats[]>>('/api/performance/users', { params });
  return response.data.data;
};

export const getTeamPerformance = async (params?: TeamPerformanceParams): Promise<JobBasedTeamPerformanceData> => {
  const response = await api.get<PerformanceResponse<JobBasedTeamPerformanceData>>('/api/performance/team', { params });
  return response.data.data;
};
