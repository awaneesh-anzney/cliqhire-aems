import { useQuery } from '@tanstack/react-query';
import {
  getMyPerformance,
  getUsersPerformance,
  getTeamPerformance,
  PerformanceParams,
  TeamPerformanceParams
} from '@/services/performanceService';

export const useMyPerformance = (params?: PerformanceParams) => {
  return useQuery({
    queryKey: ['performance', 'me', params],
    queryFn: () => getMyPerformance(params),
  });
};

export const useUsersPerformance = (params?: PerformanceParams) => {
  return useQuery({
    queryKey: ['performance', 'users', params],
    queryFn: () => getUsersPerformance(params),
  });
};

export const useTeamPerformance = (params?: TeamPerformanceParams) => {
  return useQuery({
    queryKey: ['performance', 'team', params],
    queryFn: () => getTeamPerformance(params),
  });
};
