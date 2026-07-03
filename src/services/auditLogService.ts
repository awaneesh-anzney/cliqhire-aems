import { api } from "@/lib/axios-config";

export interface AuditLogActor {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

export interface AuditLog {
  _id: string;
  actor: AuditLogActor | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  changes?: { before: any; after: any } | null;
  metadata?: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogSummary {
  entityType: string;
  count: number;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogSummaryResponse {
  success: boolean;
  since: string;
  data: AuditLogSummary[];
}

export interface AuditLogEntityResponse {
  success: boolean;
  data: AuditLog[];
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  actor?: string;
  entityId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export const auditLogService = {
  getLogs: async (params?: GetAuditLogsParams): Promise<AuditLogResponse> => {
    const response = await api.get("/api/audit-log", { params });
    return response.data;
  },

  getEntityLogs: async (entityType: string, entityId: string): Promise<AuditLogEntityResponse> => {
    const response = await api.get(`/api/audit-log/entity/${entityType}/${entityId}`);
    return response.data;
  },

  getSummary: async (since?: string): Promise<AuditLogSummaryResponse> => {
    const response = await api.get("/api/audit-log/summary", { params: { since } });
    return response.data;
  },
};
