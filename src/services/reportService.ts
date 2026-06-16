import { api } from "@/lib/axios-config";

export interface GenerateWeeklyReportParams {
  clientId: string;
  jobStages: string[];
  candidateStages: string[];
  candidateStageStatuses: Record<string, string[]>;
  positionId?: string;
  onProgress?: (percent: number) => void;
}

export async function generateWeeklyReport({
  clientId,
  jobStages,
  candidateStages,
  candidateStageStatuses,
  positionId,
  onProgress,
}: GenerateWeeklyReportParams): Promise<{ blob: Blob; filename: string }> {
  const url = `/api/reports/generate-weekly-report`;

  // Flatten candidate statuses from the record to a single array then join
  const candidateStatusesStr = Object.values(candidateStageStatuses).flat().join(",");

  const response = await api.get(url, {
    params: {
      clientId,
      jobStages,
      candidateStages,
      candidateStageStatuses,
      positionId,
    },
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      const total = progressEvent.total ?? 0;
      if (onProgress && total > 0) {
        const percentCompleted = Math.min(100, Math.round((progressEvent.loaded * 100) / total));
        onProgress(percentCompleted);
      }
    },
  });

  // Try to extract a filename from the Content-Disposition header
  const disposition = response.headers?.["content-disposition"] as string | undefined;
  let filename = `weekly-report-${clientId}-${new Date().toISOString().split("T")[0]}.xlsx`;
  if (disposition) {
    const match = /filename\*?=(?:UTF-8''|")?([^\";\n]+)/i.exec(disposition);
    if (match && match[1]) {
      try {
        filename = decodeURIComponent(match[1].replace(/\"/g, ""));
      } catch {
        filename = match[1].replace(/\"/g, "");
      }
    }
  }

  const blob = new Blob([response.data], {
    type:
      response.headers?.["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return { blob, filename };
}
