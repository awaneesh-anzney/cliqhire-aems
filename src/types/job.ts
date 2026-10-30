export enum JobStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  ON_HOLD = 'On Hold'
}

export type JobStage = 'Open'| 'Hired' | 'On Hold' | 'Closed' | 'Active' | 'Onboarding';

export interface JobStageBreakdownItem {
  stage: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface JobMetadataByStage {
  Open?: number;
  Active?: number;
  Onboarding?: number;
  Hired?: number;
  "On Hold"?: number;
  Closed?: number;
  [key: string]: number | undefined;
}

export interface JobMetadata {
  total: number;
  active: number;
  inactive: number;
  closed: number;
  open: number;
  byStage: JobMetadataByStage;
  stageBreakdown: JobStageBreakdownItem[];
}



export interface Job {
  salaryRange: any
  _id: string;
  jobTitle: string;
  client: string;
  location: string;
  headcount: string;
  stage: JobStage;
  status: JobStatus;
  jobStatus?: JobStatus;
  minSalary?: number;
  maxSalary?: number;
  minimumSalary?: number;
  maximumSalary?: number;
  department: string;
  jobType?:string;
}

// Add the Updated InterFace
    
 export interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  stage: "Lead" | "Negotiation" | "Engaged" | "Signed";
  owner: string;
  team: string;
  createdAt: string;
  jobCount: number;
  incorporationDate: string;
}


// types/job.ts

export interface JobResponse {
  success: boolean;
  data?: any; // Add this line to match jobService.ts and API respons
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  jobTitle?: string;
  department?: string;
  client?: {
    name?: string;
  };
  location?: string;
  headcount?: number;
  minimumSalary?: number;
  maximumSalary?: number;
  salaryCurrency?: string;
  jobType?: string;
  experience?: string;
  jobDescription?: string;
  nationalities?: string[];
  gender?: string;
  deadline?: string;
  relationshipManager?: string;
  reportingTo?: string;
  teamSize?: number;
  link?: string;
  keySkills?: string;
  jobPosition?: string;
  stage?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
}
