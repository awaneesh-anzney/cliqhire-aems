// Types and utilities for Recruiter Pipeline
// Updated to match the new API response structure

export type ConnectionType = "LinkedIn" | "Indeed" | "Referral" | "Direct" | "Other";

// Define status types for each stage
export type SourcingStatus = "Pending" | "Connections Sent" | "Connections Accepted" | "CV Received" | "Disqualified";
export type ScreeningStatus = "Submission Pending" | "CV Submitted" | "AEMS Interview" | "Disqualified";
export type ClientScreeningStatus = "Pending" | "Client Shortlisted" | "Disqualified";
export type InterviewStatus = "Pending" | "Client Interviewed" | "Client Selected" | "Disqualified";
export type VerificationStatus = "Document Pending" | "Document Verified" | "Offer Letter Sent" | "Offer Accepted" | "Offer Rejected" | "Disqualified";
export type OnboardingStatus = "Pending" | "Completed";

export type StatusType = SourcingStatus | ScreeningStatus | ClientScreeningStatus | InterviewStatus | VerificationStatus | OnboardingStatus;

export interface Candidate {
  id: string;
  name: string;
  source: string;
  currentStage: string;
  avatar?: string;
  experience?: string;
  currentSalary?: number;
  currentSalaryCurrency?: string;
  expectedSalary?: number;
  expectedSalaryCurrency?: string;
  currentJobTitle?: string;
  previousCompanyName?: string;
  currentCompanyName?: string;
  status?: StatusType;
  subStatus?: string;
  // Additional fields from new API structure
  applicationId?: string;
  appliedDate?: string;
  lastUpdated?: string;
  applicationDuration?: number;
  // Candidate details
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  softSkill?: string[];
  technicalSkill?: string[];
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  nationality?: string;
  educationDegree?: string;
  willingToRelocate?: string;
  description?: string;
  linkedin?: string;
  reportingTo?: string;
  // Additional fields for dialog
  primaryLanguage?: string;
  resume?: string;
  // Pipeline-specific data
  priority?: string;
  notes?: string;
  // Stage-specific data
  sourcing?: any;
  screening?: any;
  clientScreening?: any;
  interview?: any;
  verification?: any;
  onboarding?: any;
  hired?: any;
  disqualified?: any;
  // Additional pipeline fields
  connection?: ConnectionType;
  hiringManager?: string;
  recruiter?: string;
  // Temp candidate flag
  isTempCandidate?: boolean;
  // History fields
  stageHistory?: Array<{
    stage: string;
    status: string;
    movedBy?: { name: string; email: string };
    movedAt: string;
    notes?: string;
    data?: any;
  }>;
  rejectionHistory?: Array<{
    stage: string;
    status: string;
    rejectionReason: string;
    feedback?: string;
    rejectedAt: string;
    rejectedBy?: { name: string; email: string };
  }>;
}

export interface JobTeamInfo {
  teamId?: {
    _id: string;
    teamName: string;
  };
  hiringManager?: {
    _id: string;
    name: string;
    email: string;
  };
  teamLead?: {
    _id: string;
    name: string;
    email: string;
  };
  recruiter?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Job {
  id: string;
  title: string;
  clientName: string;
  location: string;
  salaryRange: string;
  headcount: number;
  jobType: string;
  isExpanded: boolean;
  candidates: Candidate[];
  // Pipeline-specific fields from new API structure
  // Note: pipelineStatus is now derived from jobId.stage
  priority?: string;
  notes?: string;
  assignedDate?: string;
  // Candidate counts from new API structure
  totalCandidates?: number;
  activeCandidates?: number;
  completedCandidates?: number;
  droppedCandidates?: number;
  numberOfCandidates?: number;
  // Recruiter information
  recruiterName?: string;
  recruiterEmail?: string;
  // Hiring manager information
  hiringManagerName?: string;
  hiringManagerEmail?: string;
  // Job team members from API
  jobTeamMembers?: any[];
  // Job ID object containing job details and team info
  jobId?: {
    _id?: string;
    jobTitle?: string;
    jobTeamInfo?: JobTeamInfo;
    client?: any;
    location?: string;
    headcount?: number;
    stage?: string;
    minimumSalary?: number;
    maximumSalary?: number;
    salaryCurrency?: string;
    jobType?: string;
    experience?: string;
    department?: string;
    [key: string]: any;
  };
  // Job team information from API (legacy - now accessed via jobId)
  jobTeamInfo?: JobTeamInfo;
  // Job details from API
  jobPosition?: string;
  department?: string;
  experience?: string;
  education?: string;
  specialization?: string;
  teamSize?: number;
  numberOfPositions?: number;
  workVisa?: boolean;
  gender?: string;
  deadlineByClient?: string;
  keySkills?: string[];
  certifications?: string[];
  otherBenefits?: string;
  jobDescription?: string;
  // Client information from API
  clientIndustry?: string;
  clientLocation?: string;
  clientStage?: string;
  clientCountry?: string;
  clientWebsite?: string;
  clientPhone?: string;
  clientEmails?: string[];
}

export const pipelineStages = [
    "Sourcing",
    "Screening", 
    "Client Review",
    "Interview",
    "Verification",
    "Onboarding",
    "Hired"
];

// Helper function to get stage colors
export const getStageColor = (stage: string) => {
  const colors = {
    "Sourcing": "bg-purple-100 text-purple-800 border-purple-200",
    "Screening": "bg-orange-100 text-orange-800 border-orange-200",
    "Client Review": "bg-green-100 text-green-800 border-green-200",
    "Interview": "bg-blue-100 text-blue-800 border-blue-200",
    "Verification": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Onboarding": "bg-green-100 text-green-800 border-green-200",
    "Hired": "bg-emerald-100 text-emerald-800 border-emerald-200"
  };
  return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Helper function to get candidate count by stage
export const getCandidateCountByStage = (candidates: Candidate[], stage: string) => {
  return candidates.filter(candidate => candidate.currentStage === stage).length;
};

// Helper function to map UI stage names to backend stage names
export const mapUIStageToBackendStage = (uiStage: string): string => {
  const stageMapping: Record<string, string> = {
    "Client Review": "Client Screening",
    // Add other mappings here if needed in the future
  };
  
  return stageMapping[uiStage] || uiStage;
};

// Helper function to map backend stage names to UI stage names
export const mapBackendStageToUIStage = (backendStage: string): string => {
  const stageMapping: Record<string, string> = {
    "Client Screening": "Client Review",
    // Add other mappings here if needed in the future
  };
  
  return stageMapping[backendStage] || backendStage;
};
