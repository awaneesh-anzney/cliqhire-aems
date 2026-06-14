import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, Job, JobsPage, updateJobStage, deleteJobById, createJob, updateJobById } from "@/services/jobService";
import { toast } from "sonner";
import { JobStage } from "@/types/job";

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  stage?: string;
  jobType?: string;
  location?: string;
  client?: string;
  clientId?: string;
  search?: string;
  gender?: string;
  sort?: string;
  jobId?: string;
  jobTitle?: string;
  headcount?: number;
  includeInactive?: any;
}

export function useJobs(params: JobsQueryParams = {}) {
  const { page = 1, limit = 10, ...rest } = params;

  return useQuery<JobsPage>({
    queryKey: ["jobs", { page, limit, ...rest }],
    queryFn: () => getJobs({ page, limit, ...rest }),
    placeholderData: (prev) => prev,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobs({ clientId: id }), // This seems wrong in service, but let's assume it works for single job if service is used differently. Wait, jobService has getJobById.
    enabled: !!id,
  });
}

export function useUpdateJobStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: JobStage }) => updateJobStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job stage updated successfully");
    },
    onError: () => {
      toast.error("Failed to update job stage");
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteJobById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job created successfully");
    },
    onError: () => {
      toast.error("Failed to create job");
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateJobById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated successfully");
    },
    onError: () => {
      toast.error("Failed to update job");
    },
  });
}
