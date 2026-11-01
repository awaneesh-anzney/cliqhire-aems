/**
 * TypeScript interfaces for Dashboard Statistics API (`GET /api/dashboard/stats`).
 * Corresponds to the schema documented in dhasboard.md.
 */

export type DashboardTimeframePreset =
  | "all"
  | "month"
  | "3_months"
  | "6_months"
  | "year"
  | "custom";

export interface DashboardQueryParams {
  timeframe?: DashboardTimeframePreset | string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}

export interface DashboardTimeframeInfo {
  type: string;
  label: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardKpiCards {
  activeJobs: {
    value: number;
    total: number;
    inactive: number;
  };
  candidatesInProcess: {
    value: number;
    totalInPipeline: number;
  };
  hiredCandidates: {
    value: number;
    totalAllTime: number;
  };
  clientsSummary: {
    total: number;
    signed: number;
    lead: number;
    engaged: number;
  };
  activeContracts: {
    total: number;
  };
  tasks: {
    pending: number;
    completed: number;
    total: number;
  };
}

export interface FunnelStageData {
  stage: string;
  count: number;
  conversionFromPrevious: number;
  conversionOverall: number;
  color: string;
}

export interface MonthlyTrendData {
  month: string;
  label: string;
  jobsOpened: number;
  candidatesSourced: number;
  hired: number;
}

export interface DistributionData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopRecruiterData {
  id: string;
  name: string;
  email: string;
  hiredCount: number;
  activeCandidates: number;
}

export interface TopClientData {
  id: string;
  clientName: string;
  clientId: string;
  activeJobs: number;
}

export interface DashboardCharts {
  recruitmentFunnel: FunnelStageData[];
  monthlyTrends: MonthlyTrendData[];
  clientDistribution: DistributionData[];
  jobStageDistribution: DistributionData[];
  topRecruiters: TopRecruiterData[];
  topClientsByActiveJobs: TopClientData[];
}

export interface DashboardData {
  timeframe?: DashboardTimeframeInfo;
  kpiCards?: DashboardKpiCards;
  charts?: DashboardCharts;

  // Backward compatibility fields
  jobs?: {
    total: number;
    active: number;
    inactive: number;
    stageBreakdown?: {
      stage: string;
      count: number;
    }[];
  };
  candidates?: {
    total: number;
    active: number;
    inactive: number;
  };
  clients?: {
    total: number;
    byStage?: {
      lead: number;
      engaged: number;
      signed: number;
    };
  };
  users?: {
    total: number;
    active: number;
    inactive: number;
  };
  contracts?: {
    total: number;
  };
  pipeline?: {
    activePipelines: number;
    candidatesInProcess: number;
    candidatesCompleted: number;
    totalCandidatesInPipeline: number;
    stageBreakdown?: {
      stage: string;
      count: number;
    }[];
    candidatesInterviewing?: number;
    candidatesHired?: number;
  };
  tasks?: {
    pending: number;
    completed: number;
    total: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
  error?: string;
}

