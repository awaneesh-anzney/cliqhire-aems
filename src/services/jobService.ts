import axios from "axios";
import { api } from "@/lib/axios-config";

// =========================
// Job Service (Updated for dynamic team assignment)
// =========================

interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

interface WorkVisa {
  workVisa: string;
  visaCountries: string[];
}

export interface ClientRef {
  _id: string;
  name: string;
}

// New: Dynamic team member for API
export interface JobTeamMemberInput {
  position: string;  // e.g. "hiringManager", "recruiter", "teamLead"
  users: string[];   // array of user profile IDs
}

// New: Populated team member returned by API
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

export interface JobTeamMember {
  position: string;
  positionLabel: string;
  users: PopulatedUser[];
  addedAt: string;
}

export interface JobData {
  jobTitle: string;
  jobPosition?: string[];
  department?: string;
  client: string | ClientRef;
  location?: string[];
  headcount?: number;
  stage?: string;
  workVisa?: WorkVisa;
  minimumSalary?: number;
  maximumSalary?: number;
  salaryCurrency?: string;
  salaryRange?: SalaryRange;
  jobType: string;
  experience: string;
  education?: string[];
  specialization?: string[];
  certifications?: string[];
  benefits?: string[];
  jobDescription?: string;
  jobDescriptionPdf?: string;
  nationalities?: string[];
  gender?: string;
  deadlineByClient?: Date | undefined;
  startDateByInternalTeam?: Date | undefined;
  endDateByInternalTeam?: Date | undefined;
  totalCVs?: number;
  reportingTo?: string;
  teamSize?: number | string;
  link?: string;
  keySkills?: string;
  numberOfPositions?: number;
  jobDescriptionInternal?: string;
  // New dynamic team assignment
  jobTeamMembers?: JobTeamMemberInput[] | JobTeamMember[];
}

export interface Job extends JobData {
  _id: string;
  jobId?: string;
  client: ClientRef;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  status?: string;
  jobDescriptionInternal?: string;
  // Populated team from backend
  jobTeamMembers?: JobTeamMember[];
  pipeline?: {
    created: boolean;
    message: string;
    pipelineId?: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface JobResponse {
  success: boolean;
  data?: Job | Job[];
  message?: string;
  count?: number;
  total?: number;
  totalCount?: number;
  page?: number;
  pages?: number;
  limit?: number;
}

export interface PaginatedJobResponse extends JobResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
}

export interface JobsPage {
  jobs: Job[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  count: number;
}

export interface JobCountByClient {
  _id: string;
  count: number;
  clientName?: string;
}

// New: Job position config from backend
export interface JobPosition {
  _id: string;
  name: string;
  label: string;
  description?: string;
  maxUsers: number | null;
  canViewPipeline: boolean;
  canModifyPipeline: boolean;
  order: number;
  isActive: boolean;
}

// New: Team member for position assignment
export interface TeamMemberForPosition {
  position: string;
  positionLabel: string;
  users: PopulatedUser[];
  addedAt: string;
}

const handleApiError = (error: any, context: string) => {
  if (error.response) {
    const status = error.response.status;
    const errorMessage = error.response.data?.message || "Unknown error occurred";
    console.error(`API Error (${context}):`, { status, message: errorMessage, url: error.config?.url });
    throw new Error(`${context} failed: ${errorMessage} (Status: ${status})`);
  } else if (error.request) {
    throw new Error(`Network error during ${context}: No response received`);
  } else {
    throw new Error(`Error setting up ${context} request: ${error.message}`);
  }
};

const processJobData = (jobData: JobData | Partial<JobData>) => {
  const dataToSend = { ...jobData };
  if (
    dataToSend.client &&
    typeof dataToSend.client === "object" &&
    (dataToSend.client as ClientRef)._id
  ) {
    dataToSend.client = (dataToSend.client as ClientRef)._id;
  }
  return {
    ...dataToSend,
    jobType: dataToSend.jobType?.toLowerCase(),
    gender: dataToSend.gender?.toLowerCase(),
    salaryRange:
      dataToSend.salaryRange ||
      (dataToSend.minimumSalary !== undefined || dataToSend.maximumSalary !== undefined
        ? {
            min: dataToSend.minimumSalary || 0,
            max: dataToSend.maximumSalary || 0,
            currency: dataToSend.salaryCurrency || "SAR",
          }
        : undefined),
  };
};

const createJob = async (jobData: JobData): Promise<JobResponse> => {
  try {
    const processedData = processJobData(jobData);
    const response = await api.post<JobResponse>(`/api/jobs`, processedData);
    return response.data;
  } catch (error) {
    handleApiError(error, "job creation");
    throw error;
  }
};

const getJobs = async (params?: {
  stage?: string;
  jobType?: string;
  location?: string;
  client?: string;
  clientId?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<JobsPage> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  try {
    const processedParams = {
      ...params,
      page,
      limit,
      ...(params?.jobType && { jobType: params.jobType.toLowerCase() }),
      ...(params?.gender && { gender: params.gender.toLowerCase() }),
    };
    const response = await api.get(`/api/jobs`, { params: processedParams });
    const resData = response.data;

    if (resData.success && Array.isArray(resData.data)) {
      const totalCount = resData.totalCount ?? resData.total ?? resData.data.length;
      return {
        jobs: resData.data,
        totalCount,
        page: resData.page ?? page,
        limit: resData.limit ?? limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        count: resData.count ?? resData.data.length,
      };
    }

    if (Array.isArray(resData.jobs)) {
      const totalCount = resData.total ?? resData.totalCount ?? resData.jobs.length;
      return {
        jobs: resData.jobs,
        totalCount,
        page: resData.page ?? page,
        limit,
        totalPages: (resData.pages ?? Math.ceil(totalCount / limit)) || 1,
        count: resData.count ?? resData.jobs.length,
      };
    }

    const jobs = Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : [];
    const totalCount = resData.totalCount ?? resData.total ?? jobs.length;
    return {
      jobs,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      count: jobs.length,
    };
  } catch (error) {
    handleApiError(error, "jobs fetching");
    throw error;
  }
};

const getJobById = async (id: string): Promise<JobResponse> => {
  try {
    const response = await api.get<JobResponse>(`/api/jobs/getJobById/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Job not found");
    }
    handleApiError(error, "job fetching");
    throw error;
  }
};

const updateJobById = async (id: string, jobData: Partial<JobData>): Promise<JobResponse> => {
  try {
    const response = await api.patch<JobResponse>(`/api/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    handleApiError(error, "job update");
    throw error;
  }
};

// ==========================================
// NEW: Dynamic Team Assignment APIs
// ==========================================

/**
 * Get all active job positions (hiringManager, recruiter, etc.) from backend
 */
export const getJobPositions = async (): Promise<JobPosition[]> => {
  try {
    const response = await api.get<{ success: boolean; data: JobPosition[] }>(`/api/job-positions`);
    return response.data.data || [];
  } catch (error) {
    handleApiError(error, "fetching job positions");
    throw error;
  }
};

/**
 * Get the full team for a job
 */
export const getJobTeam = async (jobId: string): Promise<{ jobId: string; jobTitle: string; team: TeamMemberForPosition[] }> => {
  try {
    const response = await api.get(`/api/jobs/${jobId}/team`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "fetching job team");
    throw error;
  }
};

/**
 * Add/replace users in a specific position for a job
 * Triggers pipeline auto-create if first team assignment
 */
export const assignJobTeamPosition = async (
  jobId: string,
  position: string,
  userIds: string[]
): Promise<{ data: Job; pipeline?: { created: boolean; pipelineId?: string; message: string } }> => {
  try {
    const response = await api.patch(`/api/jobs/${jobId}/team`, { position, userIds });
    return response.data;
  } catch (error) {
    handleApiError(error, "team assignment");
    throw error;
  }
};

/**
 * Remove a user from a position in a job
 */
export const removeJobTeamMember = async (
  jobId: string,
  position: string,
  userId: string
): Promise<JobResponse> => {
  try {
    const response = await api.delete(`/api/jobs/${jobId}/team/${position}/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "removing team member");
    throw error;
  }
};

// ==========================================

const uploadJobFile = async (
  jobId: string,
  file: File,
  field: "jobDescriptionPdf" | "benefitPdf"
): Promise<{ filePath: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);
    const response = await api.post<{ success: boolean; data: { filePath: string } }>(
      `/api/jobs/${jobId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "job file upload");
    throw error;
  }
};

const deleteJobById = async (id: string): Promise<JobResponse> => {
  try {
    const response = await api.delete<JobResponse>(`/api/jobs/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "job deletion");
    throw error;
  }
};

const getJobCountsByClient = async (): Promise<JobCountByClient[]> => {
  try {
    const response = await api.get<{ success: boolean; data: JobCountByClient[] }>(`/api/jobs/clients/count`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "fetching job counts by client");
    throw error;
  }
};

// Job Notes API
export async function createJobNote(note: { content: string; jobId: string; clientId: string }) {
  const res = await api.post(`/api/jobnotes`, { content: note.content, job_id: note.jobId, client_id: note.clientId });
  return res.data.data;
}

export async function getAllJobNotes() {
  const res = await api.get(`/api/jobnotes`);
  return res.data.data;
}

export async function getJobNotesByJobId(jobId: string) {
  const res = await api.get(`/api/jobnotes/job/${jobId}`);
  return res.data.data;
}

export async function updateJobNote(id: string, content: string, jobId: string) {
  const res = await api.patch(`/api/jobnotes/${id}`, { content, job_id: jobId });
  return res.data.data;
}

export async function deleteJobNote(id: string) {
  const res = await api.delete(`/api/jobnotes/${id}`);
  return res.data.data;
}

const updateJobStage = async (id: string, stage: string): Promise<JobResponse> => {
  try {
    const response = await api.patch<JobResponse>(`/api/jobs/${id}`, { stage });
    return response.data;
  } catch (error) {
    handleApiError(error, "job stage update");
    throw error;
  }
};

const updateJobPrimaryContacts = async (
  jobId: string,
  selectedContactIds: string[],
  newContacts: any[] = [],
  clientId?: string
): Promise<JobResponse> => {
  try {
    const payload = { selectedContacts: selectedContactIds, newContact: newContacts || [], clientId: clientId || "" };
    const response = await api.patch<JobResponse>(`/api/jobs/${jobId}/primarycontact`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "job primary contacts update");
    throw error;
  }
};

const getPrimaryContactsByJobId = async (jobId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/jobs/${jobId}/primarycontacts`);
    const res = response.data;
    if (res?.data?.primaryContacts && Array.isArray(res.data.primaryContacts)) {
      return { success: true, data: { primaryContacts: res.data.primaryContacts } };
    }
    if (res?.primaryContacts && Array.isArray(res.primaryContacts)) {
      return { success: true, data: { primaryContacts: res.primaryContacts } };
    }
    return { success: false, data: { primaryContacts: [] } };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { success: true, data: { primaryContacts: [] } };
    }
    handleApiError(error, "fetching job primary contacts");
    throw error;
  }
};

export {
  createJob,
  getJobs,
  getJobById,
  updateJobById,
  uploadJobFile,
  deleteJobById,
  getJobCountsByClient,
  updateJobStage,
  updateJobPrimaryContacts,
  getPrimaryContactsByJobId,
};
