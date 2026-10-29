import { api } from "@/lib/axios-config";
import {
  HiredCandidatesFilterParams,
  HiredCandidatesResponse,
} from "@/types/hiredCandidate";

/**
 * Service for fetching and exporting Hired Candidates reports.
 * Endpoints correspond to /api/reports/hired-candidates and /api/reports/hired-candidates/export.
 */
export const hiredCandidatesService = {
  /**
   * Fetches paginated hired candidates list along with summary metrics.
   * @param params Query filter parameters
   */
  getHiredCandidates: async (
    params?: HiredCandidatesFilterParams
  ): Promise<HiredCandidatesResponse> => {
    try {
      // Clean undefined or empty parameters
      const cleanParams: Record<string, any> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = value;
          }
        });
      }

      const response = await api.get<HiredCandidatesResponse>(
        "/api/reports/hired-candidates",
        {
          params: cleanParams,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching hired candidates:", error);
      throw error;
    }
  },

  /**
   * Downloads styled Excel report for hired candidates.
   * @param params Query filter parameters
   */
  exportHiredCandidates: async (
    params?: HiredCandidatesFilterParams
  ): Promise<Blob> => {
    try {
      const cleanParams: Record<string, any> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Do not send page/limit to export endpoint as stated in the API doc
          if (key === "page" || key === "limit") return;
          if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = value;
          }
        });
      }

      const response = await api.get("/api/reports/hired-candidates/export", {
        params: cleanParams,
        responseType: "blob",
      });

      return response.data;
    } catch (error) {
      console.error("Error exporting hired candidates Excel:", error);
      throw error;
    }
  },

  /**
   * Triggers a browser file download of the exported Excel spreadsheet.
   * @param params Query filter parameters
   */
  downloadExcelReport: async (
    params?: HiredCandidatesFilterParams
  ): Promise<void> => {
    const blob = await hiredCandidatesService.exportHiredCandidates(params);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Hired_Candidates_Report_${params?.timeframe || "all"}_${dateStr}.xlsx`;

    const blobUrl = window.URL.createObjectURL(
      new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },
};

