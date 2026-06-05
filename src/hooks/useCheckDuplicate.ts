import { useQuery } from "@tanstack/react-query";
import { candidateService } from "@/services/candidateService";

/**
 * Hook to check if a candidate duplicate exists by field (email, phone, or linkedin)
 */
export function useCheckDuplicate(field: 'email' | 'phone' | 'linkedin', value: string) {
  const trimmed = value?.trim();
  return useQuery({
    queryKey: ["check-duplicate", field, trimmed],
    queryFn: () => candidateService.checkDuplicate(field, trimmed),
    enabled: !!trimmed,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false,
  });
}
