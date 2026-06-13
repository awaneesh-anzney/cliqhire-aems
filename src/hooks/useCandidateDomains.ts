import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateDomainService } from "@/services/candidateDomainService";
import { toast } from "sonner";

export interface UseCandidateDomainsParams {
  page?: number;
  limit?: number;
  name?: string;
  search?: string;
  isActive?: boolean;
}

export const useCandidateDomains = (params?: UseCandidateDomainsParams) => {
  return useQuery({
    queryKey: ["candidateDomains", params],
    queryFn: () => candidateDomainService.getCandidateDomains(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCandidateDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainData: { name: string; description?: string; isActive?: boolean }) =>
      candidateDomainService.createCandidateDomain(domainData),
    onSuccess: (newDomain) => {
      queryClient.invalidateQueries({ queryKey: ["candidateDomains"] });
      toast.success(`Domain "${newDomain.name}" created successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || "Failed to create domain";
      toast.error(message);
    },
  });
};
