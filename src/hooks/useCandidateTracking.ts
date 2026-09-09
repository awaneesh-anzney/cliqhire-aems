"use client";

import { useQuery } from "@tanstack/react-query";
import { candidateService } from "@/services/candidateService";
import { initializeAuth } from "@/lib/axios-config";

export interface CandidateTrackingParams {
  page?: number;
  limit?: number;
  pipelineStatus?: string;
  stage?: string;
  clientId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useCandidateTracking(candidateId: string, params: CandidateTrackingParams) {
  return useQuery({
    queryKey: ["candidate-tracking", candidateId, params],
    queryFn: async () => {
      await initializeAuth();
      return candidateService.getCandidatePipelines(candidateId, params);
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
