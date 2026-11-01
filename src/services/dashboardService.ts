import { api } from "@/lib/axios-config";
import {
  DashboardData,
  DashboardQueryParams,
  DashboardResponse,
} from "@/types/dashboard";

/**
 * Service for fetching executive dashboard statistics.
 * Corresponds to GET /api/dashboard/stats documented in dhasboard.md.
 */
export const getDashboardStats = async (
  params?: DashboardQueryParams
): Promise<DashboardData> => {
  try {
    const cleanParams: Record<string, any> = {};

    if (params) {
      // 1. If explicit start and end date are provided, send custom date range
      if (params.startDate && params.endDate) {
        cleanParams.startDate = params.startDate;
        cleanParams.endDate = params.endDate;
      }
      // 2. If specific year and month are provided, send year & month
      else if (params.month !== undefined && params.month !== null) {
        cleanParams.year = params.year || new Date().getFullYear();
        cleanParams.month = Number(params.month);
      }
      // 3. Otherwise send timeframe preset
      else if (params.timeframe && params.timeframe !== "custom") {
        cleanParams.timeframe = params.timeframe;
        if (params.year) cleanParams.year = params.year;
      }
    }

    console.log("[DashboardService] Requesting stats with params:", cleanParams);

    const response = await api.get<DashboardResponse>("/api/dashboard/stats", {
      params: cleanParams,
    });

    const data = response.data.data;
    console.log(
      "[DashboardService] Received stats for:",
      data.timeframe?.label,
      "Hired:",
      data.kpiCards?.hiredCandidates?.value
    );

    // Backward compatibility calculations for older dashboard consumers
    const stageBreakdown = data.pipeline?.stageBreakdown || [];
    const interviewStage = stageBreakdown.find(
      (s) => s.stage?.toLowerCase() === "interview"
    );
    const hiredStage = stageBreakdown.find(
      (s) => s.stage?.toLowerCase() === "hired"
    );

    const candidatesInterviewing = interviewStage ? interviewStage.count : 0;
    const candidatesHired = hiredStage
      ? hiredStage.count
      : data.kpiCards?.hiredCandidates?.value ||
        data.pipeline?.candidatesCompleted ||
        0;

    return {
      ...data,
      pipeline: {
        ...(data.pipeline || {
          activePipelines: 0,
          candidatesInProcess: 0,
          candidatesCompleted: 0,
          totalCandidatesInPipeline: 0,
        }),
        candidatesInterviewing,
        candidatesHired,
        stageBreakdown,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Backward-compatible type export
export type DashboardStats = DashboardData;
