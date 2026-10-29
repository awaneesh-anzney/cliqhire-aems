import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboardService";
import { DashboardData, DashboardQueryParams } from "@/types/dashboard";

/**
 * Hook to fetch executive dashboard statistics with support for timeframe parameters.
 * Caches responses and prevents layout shifts using placeholderData.
 */
export const useDashboardStats = (params?: DashboardQueryParams) => {
  return useQuery<DashboardData, Error>({
    queryKey: ["dashboard-stats", params],
    queryFn: () => getDashboardStats(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
