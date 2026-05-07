import { useQuery } from "@tanstack/react-query";
import { globalSearch } from "@/services/searchService";
import { SearchParams, SearchResponse } from "@/types/search";
import { useDebounce } from "@/hooks/use-debounce";

export const useSearch = (params: SearchParams, enabled = true) => {
  const debouncedQuery = useDebounce(params.q, 300);

  return useQuery({
    queryKey: ["search", { ...params, q: debouncedQuery }],
    queryFn: () => globalSearch({ ...params, q: debouncedQuery }),
    enabled: enabled && debouncedQuery.trim().length >= 1,
    staleTime: 1000 * 30, // 30 seconds (matches server cache)
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useSearchAll = (q: string, limit = 5, enabled = true) => {
  return useSearch({ q, type: 'all', limit }, enabled);
};
