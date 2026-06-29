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

export interface TeamPerformanceStats extends PerformanceStats {
  teamId: string;
  teamName: string;
  members: (PerformanceStats & { profileId: string })[];
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
  teamId?: string;
}

export const getMyPerformance = async (params?: PerformanceParams): Promise<PerformanceStats> => {
  const response = await api.get<PerformanceResponse<PerformanceStats>>('/api/performance/me', { params });
  return response.data.data;
};

export const getUsersPerformance = async (params?: PerformanceParams): Promise<UserPerformanceStats[]> => {
  const response = await api.get<PerformanceResponse<UserPerformanceStats[]>>('/api/performance/users', { params });
  return response.data.data;
};

export const getTeamPerformance = async (params?: TeamPerformanceParams): Promise<TeamPerformanceStats[]> => {
  const response = await api.get<PerformanceResponse<TeamPerformanceStats[]>>('/api/performance/team', { params });
  return response.data.data;
};
