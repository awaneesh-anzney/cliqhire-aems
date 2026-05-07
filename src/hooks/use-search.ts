import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { globalSearch } from "@/services/searchService";
import { SearchParams, SearchResponse } from "@/types/search";
import { useDebounce } from "@/hooks/use-debounce";

export const useSearch = (params: SearchParams, enabled = true) => {
  const debouncedQuery = useDebounce(params.q, 300);

  return useQuery({
    queryKey: ["search", { ...params, q: debouncedQuery }],
    queryFn: () => globalSearch({ ...params, q: debouncedQuery }),
    enabled: enabled && debouncedQuery.trim().length >= 1,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useInfiniteSearch = (params: SearchParams, enabled = true) => {
  const debouncedQuery = useDebounce(params.q, 300);

  return useInfiniteQuery({
    queryKey: ["search-infinite", { ...params, q: debouncedQuery }],
    queryFn: ({ pageParam = 1 }) => 
      globalSearch({ ...params, q: debouncedQuery, page: pageParam as number }),
    enabled: enabled && debouncedQuery.trim().length >= 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useSearchAll = (q: string, limit = 5, enabled = true) => {
  return useSearch({ q, type: 'all', limit }, enabled);
};

