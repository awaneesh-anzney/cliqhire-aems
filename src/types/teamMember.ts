export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode?: string;
  avatar?: string;
  location: string;
  gender?: string;
  experience: string;
  skills: string[];
  resume?: string;
  status: TeamMemberStatus;
  department?: string;
  specialization?: string;
  teamRole?: string;
  isActive?: string;
  authAccount?: any;
  registrationStatus?: string;
  createdAt: string;
  updatedAt: string;
  teamMemberId?: string;
  role?: string;
  hireDate?: string;
  manager?: string;
  performanceRating?: number;
  activeJobs?: number;
  completedPlacements?: number;
  roleId?: string;
}

export type TeamMemberStatus = "Active" | "Inactive" | "On Leave" | "Terminated";

export interface TeamMemberResponse {
  status: string;
  results?: number;
  data: {
    users?: TeamMember[];
    user?: TeamMember;
  };
  message?: string;
}

export interface TeamMemberFilters {
  name?: string;
  firstName?: string;
  lastName?: string;
  status?: TeamMemberStatus;
  location?: string;
  department?: string;
  experience?: string;
}

export interface CreateTeamMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode?: string;
  location: string;
  experience: string;
  skills: string[];
  resume?: string;
  status: TeamMemberStatus;
  department?: string;
  specialization?: string;
  teamRole: string;
  roleId?: string;
  password?: string;
  avatar?: string;
  gender?: string;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
  _id: string;
  avatar?: string;
  gender?: string;
} 