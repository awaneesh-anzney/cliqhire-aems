import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateService, Candidate } from "@/services/candidateService";
import { toast } from "sonner";

export interface CandidateFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  experience?: string;
  location?: string;
  profileId?: string;
  phone?: string;
  noticePeriod?: string;
}

export function useCandidates(params: CandidateFilters) {
  return useQuery({
    queryKey: ["candidates", params],
    queryFn: () => candidateService.getCandidates(params),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidateService.getCandidateById(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData | Partial<Candidate>) => candidateService.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create candidate");
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Candidate> }) => 
      candidateService.updateCandidate(id, data),
    onSuccess: (updatedCandidate) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", updatedCandidate._id] });
      toast.success("Candidate updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update candidate");
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => candidateService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete candidate");
    },
  });
}

export function useUpdateCandidateField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, fieldKey, value }: { id: string; fieldKey: string; value: any }) => 
      candidateService.updateCandidateField(id, fieldKey, value),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        if (response.candidate?._id) {
          queryClient.invalidateQueries({ queryKey: ["candidate", response.candidate._id] });
        }
      }
    },
  });
}
