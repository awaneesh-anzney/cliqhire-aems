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

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: PaginationData;
  message?: string;
}

export interface PerformanceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PerformanceParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  from?: string;
  to?: string;
}

export interface TeamPerformanceParams extends PerformanceParams {
  jobId?: string;
  clientId?: string;
  position?: string;
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

export interface PositionLeaderboardData {
  position: string;
  leaderboard: UserPerformanceStats[];
}

export const getMyPerformance = async (params?: PerformanceParams): Promise<PerformanceStats> => {
  const response = await api.get<PerformanceResponse<PerformanceStats>>('/api/performance/me', { params });
  return response.data.data;
};

export const getUsersPerformance = async (params?: PerformanceParams): Promise<PaginatedResponse<UserPerformanceStats[]>> => {
  const response = await api.get<PaginatedResponse<UserPerformanceStats[]>>('/api/performance/users', { params });
  return response.data;
};

export const getTeamPerformance = async (params?: TeamPerformanceParams): Promise<PaginatedResponse<JobBasedTeamPerformanceData | PositionLeaderboardData>> => {
  const response = await api.get<PaginatedResponse<JobBasedTeamPerformanceData | PositionLeaderboardData>>('/api/performance/team', { params });
  return response.data;
};
