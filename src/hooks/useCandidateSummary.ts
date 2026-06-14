import { useQuery } from '@tanstack/react-query';
import { getCandidateSummary } from '@/services/recruitmentPipelineService';

export function useCandidateSummary(pipelineId: string, candidateId: string) {
  return useQuery({
    queryKey: ['candidate-summary', pipelineId, candidateId],
    queryFn: async () => {
      const response = await getCandidateSummary(pipelineId, candidateId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch candidate summary');
      }
      return response.data;
    },
    enabled: !!pipelineId && !!candidateId,
  });
}
