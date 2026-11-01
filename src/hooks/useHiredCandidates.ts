import { useQuery, useMutation } from "@tanstack/react-query";
import { hiredCandidatesService } from "@/services/hiredCandidatesService";
import {
  HiredCandidatesFilterParams,
  HiredCandidatesResponse,
} from "@/types/hiredCandidate";
import { toast } from "sonner";

/**
 * Hook to fetch paginated hired candidates list with analytical summary.
 * Uses TanStack Query for caching and smooth pagination transitions.
 */
export const useHiredCandidates = (params: HiredCandidatesFilterParams) => {
  return useQuery<HiredCandidatesResponse, Error>({
    queryKey: ["hired-candidates", params],
    queryFn: () => hiredCandidatesService.getHiredCandidates(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Mutation hook for triggering direct Excel download with feedback toasts.
 */
export const useExportHiredCandidates = () => {
  return useMutation({
    mutationFn: (params?: HiredCandidatesFilterParams) =>
      hiredCandidatesService.downloadExcelReport(params),
    onSuccess: () => {
      toast.success("Excel report downloaded successfully");
    },
    onError: (error: any) => {
      console.error("Failed to export hired candidates:", error);
      toast.error(
        error?.response?.data?.message || "Failed to download Excel report"
      );
    },
  });
};

