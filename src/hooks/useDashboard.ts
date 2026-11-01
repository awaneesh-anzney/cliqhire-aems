import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboardService";
import { DashboardData, DashboardQueryParams } from "@/types/dashboard";

/**
 * Hook to fetch executive dashboard statistics with support for timeframe parameters.
 * Uses staleTime: 0 so any timeframe, month, or custom range changes trigger an immediate API refresh.
 */
export const useDashboardStats = (params?: DashboardQueryParams) => {
  return useQuery<DashboardData, Error>({
    queryKey: ["dashboard-stats", params],
    queryFn: () => getDashboardStats(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0, // Always fetch fresh data on parameter changes
    refetchOnWindowFocus: false,
  });
};
