/**
 * Types and interfaces for Hired Candidates Report & Tracker.
 * Directly mapped to /api/reports/hired-candidates specifications.
 */

export type HiredCandidatesTimeframePreset =
  | "all"
  | "month"
  | "3_months"
  | "6_months"
  | "year"
  | "custom";

export type HiredCandidatesDateField = "hiredAt" | "joinDate";

export type ProbationStatus =
  | "all"
  | "Active"
  | "Completed"
  | "Expiring Soon"
  | "Expired"
  | "None";

export interface HiredCandidateCandidateInfo {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  countryCode?: string;
  phone: string;
  fullPhone?: string;
  gender?: string;
  nationality?: string;
  location?: string;
  experience?: string;
}

export interface HiredCandidateJobInfo {
  id: string;
  jobId: string;
  title: string;
  department?: string;
}

export interface HiredCandidateClientInfo {
  id: string;
  clientId: string;
  name: string;
}

export interface HiredCandidateProbationDetails {
  hasProbation: boolean;
  period: string;
  periodLabel: string;
  periodDays: number;
  joinDate?: string;
  startDate?: string;
  endDate?: string;
  status: string; // "Active" | "Completed" | "Expiring Soon" | "Expired" | "None"
  daysElapsed?: number;
  remainingDays?: number;
  percentComplete?: number;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  notes?: string;
}

export interface HiredCandidateOfferLetter {
  hasOfferLetter: boolean;
  url?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export interface HiredCandidatePlacementDetails {
  hiredAt: string;
  joinDate?: string;
  salary?: number;
  salaryCurrency?: string;
  contractType?: string;
  offerLetterNo?: string;
  designation?: string;
  department?: string;
  reportingTo?: string;
  probation: HiredCandidateProbationDetails;
  offerLetter: HiredCandidateOfferLetter;
}

export interface DynamicMemberUser {
  id?: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  teamRole?: string;
}

export interface DynamicTeamMember {
  position: string;
  positionLabel: string;
  users: DynamicMemberUser[];
  userNames?: string[];
  addedAt?: string;
}

export interface HiredCandidateJobTeamInfo {
  teamId?: string;
  teamName?: string;
  summaryString?: string;
  dynamicMembers?: DynamicTeamMember[];
  hiringManagers?: string[];
  teamLeads?: string[];
  recruiters?: string[];
  headhunters?: string[];
}

// Backwards-compatible alias for team hierarchy
export type HiredCandidateTeamHierarchy = HiredCandidateJobTeamInfo;

export interface HiredCandidateRecord {
  candidate: HiredCandidateCandidateInfo;
  job: HiredCandidateJobInfo;
  client: HiredCandidateClientInfo;
  hiredDetails: HiredCandidatePlacementDetails;
  jobTeamInfo?: HiredCandidateJobTeamInfo;
  jobTeam?: HiredCandidateJobTeamInfo;
  teamHierarchy?: HiredCandidateJobTeamInfo;
}

export interface HiredCandidatesTimeframeMeta {
  type: HiredCandidatesTimeframePreset | string;
  label: string;
  startDate?: string | null;
  endDate?: string | null;
  dateField: HiredCandidatesDateField;
}

export interface HiredCandidatesSummaryMetrics {
  totalHired: number;
  currentlyOnProbation: number;
  probationCompleted: number;
  probationExpiringSoon: number;
  withOfferLetterCount: number;
}

export interface HiredCandidatesPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HiredCandidatesResponse {
  success: boolean;
  timeframe: HiredCandidatesTimeframeMeta;
  summary: HiredCandidatesSummaryMetrics;
  pagination: HiredCandidatesPaginationMeta;
  data: HiredCandidateRecord[];
  message?: string;
  error?: string;
}

export interface HiredCandidatesFilterParams {
  timeframe?: HiredCandidatesTimeframePreset;
  year?: number;
  month?: number;
  startDate?: string | null;
  endDate?: string | null;
  dateField?: HiredCandidatesDateField;
  clientId?: string;
  jobId?: string;
  teamId?: string;
  hiringManagerId?: string;
  teamLeadId?: string;
  recruiterId?: string;
  probationStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

