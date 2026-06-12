export interface JobData {
  certifications: string[];
  client: { _id: string; name: string };
  createdAt: string;
  dateRange: { start: string | null; end: string | null };
  department: string;
  education: [];
  experience: string;
  gender: string;
  headcount: number;
  jobDescription: string;
  jobDescriptionPdf: File | null;
  benefitPdf: File | null;
  jobPosition: string[];
  jobTitle: string;
  jobType: string;
  location: string;
  locations: string[];
  maximumSalary: number;
  minimumSalary: number;
  nationalities: string[];
  numberOfPositions: number;
  otherBenefits: string[];
  relationshipManager: string;
  salaryCurrency: string;
  salaryRange: { min: number; max: number; currency: string };
  specialization: string[];
  stage: string;
  teamSize: number | string;
  updatedAt: string;
  deadlineByClient: Date | undefined;
  startDateByInternalTeam: Date | undefined;
  endDateByInternalTeam: Date | undefined;
  totalCVs: number;
  cvTargets?: CvTarget[];
  cvTargetsSummary?: CvTargetsSummary | null;
  keySkills: string;
  jobDescriptionByInternalTeam: string;
  workVisa: { workVisa: string; visaCountries: string[] };
  reportingTo: string;
  // Team assignment fields
  teamId?: string | {
    _id: string;
    teamName: string;
    teamStatus: string;
  };
  teamName?: string;
  teamAssignment?: string; // JSON string containing team data
  recruitmentManagerId?: string;
  recruitmentManager?: string;
  teamLeadId?: string;
  teamLead?: string;
  recruiterId?: string;
  recruiter?: string;
  // Backend internalTeam structure (legacy)
  internalTeam?: {
    hiringManager?: string | {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
    teamLead?: string | {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
    recruiter?: string | {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
  };
  // Backend jobTeamInfo structure (new)
  jobTeamInfo?: {
    teamId?: {
      _id: string;
      teamName: string;
      teamStatus: string;
    };
    hiringManager?: {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
    teamLead?: {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
    recruiter?: {
      _id: string;
      name: string;
      email: string;
      teamRole: string;
      phone: string;
      department: string;
    };
  };
  _id: string;
  jobId?: string
}

export interface CvTarget {
  _id?: string;
  label?: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  achievedCount?: number;
  remaining?: number;
  isCompleted?: boolean;
  isExpired?: boolean;
}

export interface CvTargetsSummary {
  totalSlots: number;
  completedSlots: number;
  expiredSlots: number;
  totalTargetCVs: number;
  totalAchievedCVs: number;
  totalRemainingCVs: number;
}
