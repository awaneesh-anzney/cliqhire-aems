// ============================================================
// types/job-team.ts  — New dynamic team types (API v2)
// ============================================================

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole?: string;
  status?: string;
  department?: string;
  phone?: string;
}

/** One position slot in the job team (e.g. recruiter, hiringManager) */
export interface JobTeamMember {
  position: string;       // e.g. "hiringManager"
  positionLabel: string;  // e.g. "Hiring Manager"
  users: PopulatedUser[];
  addedAt: string;
}

/** Payload when assigning users to a position */
export interface AssignPositionPayload {
  position: string;
  userIds: string[];
}

/** Pipeline auto-create response embedded in team assignment response */
export interface PipelineAutoCreateInfo {
  created: boolean;
  message: string;
  pipelineId?: string;
}

/** Active position config fetched from /api/job-positions */
export interface JobPositionConfig {
  _id: string;
  name: string;          // camelCase e.g. "hiringManager"
  label: string;         // human label e.g. "Hiring Manager"
  description?: string;
  maxUsers: number | null; // null = unlimited
  canViewPipeline: boolean;
  canModifyPipeline: boolean;
  order: number;
  isActive: boolean;
}
