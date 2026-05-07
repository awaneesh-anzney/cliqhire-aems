import { api } from "@/lib/axios-config";
import { SearchParams, SearchResponse } from "@/types/search";

/**
 * Global search across multiple entities (candidates, clients, jobs, users, temp)
 * @param params - Search parameters (query, type, page, limit, status)
 * @returns Promise with search results
 */
export const globalSearch = async (params: SearchParams): Promise<SearchResponse> => {
    const { q, type = 'all', page = 1, limit = 5, status = "" } = params;

    // Validate query length
    if (!q || q.trim().length < 1) {
        throw new Error("Search query (q) is required");
    }

    const response = await api.get<SearchResponse>("/api/search", {
        params: {
            q: q.trim(),
            type,
            page,
            limit,
            status
        }
    });

    return response.data;
};

/**
 * Entity-specific search shortcuts
 */
export const searchCandidates = (q: string, page = 1, limit = 10, status = "") => 
    globalSearch({ q, type: 'candidates', page, limit, status });

export const searchClients = (q: string, page = 1, limit = 10, status = "") => 
    globalSearch({ q, type: 'clients', page, limit, status });

export const searchJobs = (q: string, page = 1, limit = 10, status = "") => 
    globalSearch({ q, type: 'jobs', page, limit, status });

export const searchUsers = (q: string, page = 1, limit = 10, status = "") => 
    globalSearch({ q, type: 'users', page, limit, status });

export const searchTempCandidates = (q: string, page = 1, limit = 10) => 
    globalSearch({ q, type: 'temp', page, limit });

