import { useQuery } from "@tanstack/react-query";
import { auditLogService, GetAuditLogsParams } from "@/services/auditLogService";

export const useAuditLogs = (params: GetAuditLogsParams) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => auditLogService.getLogs(params),
  });
};

export const useAuditLogSummary = (since?: string) => {
  return useQuery({
    queryKey: ["auditLogSummary", since],
    queryFn: () => auditLogService.getSummary(since),
  });
};

export const useAuditLogEntity = (entityType: string, entityId: string, enabled = true) => {
  return useQuery({
    queryKey: ["auditLogEntity", entityType, entityId],
    queryFn: () => auditLogService.getEntityLogs(entityType, entityId),
    enabled: enabled && !!entityType && !!entityId,
  });
};
