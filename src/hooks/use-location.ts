import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/services/location-service";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Hook for city search suggestions with debouncing and caching
 * @param query - Search term
 * @param enabled - Whether the query is enabled
 * @returns TanStack Query result
 */
export const useCitySearch = (query: string, enabled = true) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["cities", debouncedQuery],
    queryFn: () => searchCities(debouncedQuery),
    enabled: enabled && debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours (matches server cache)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
