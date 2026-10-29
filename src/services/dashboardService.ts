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
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value;
        }
      });
    }

    const response = await api.get<DashboardResponse>("/api/dashboard/stats", {
      params: cleanParams,
    });

    const data = response.data.data;

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
