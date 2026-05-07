import { api } from "@/lib/axios-config";
import { CitySuggestion } from "@/types/location";

/**
 * Search for cities/populated places matching the query string
 * @param q - Search term (min 2 characters)
 * @returns Promise with array of city suggestions
 */
export const searchCities = async (q: string): Promise<CitySuggestion[]> => {
  if (!q || q.trim().length < 2) {
    return [];
  }

  const response = await api.get<CitySuggestion[]>("/api/location/cities", {
    params: { q: q.trim() },
  });

  return response.data;
};
