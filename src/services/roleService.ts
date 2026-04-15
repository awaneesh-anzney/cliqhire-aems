import { api } from '@/lib/axios-config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  _id: string;
  id?: string;
  name: string;
  displayName?: string;
  description?: string;
  isSystem?: boolean;
  userCount?: number;
  permissions?: Record<string, ModulePermissions>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolesListResponse {
  success: boolean;
  data: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RoleDetailResponse {
  success: boolean;
  data: Role;
}

export interface MyPermissionsResponse {
  success: boolean;
  data: {
    roleId: string;
    role: string;
    permissions: Record<string, ModulePermissions>;
  };
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    name: string;
    oldRole: string;
    newRole: string;
    roleId: string;
  };
}

// ─── Role Service ─────────────────────────────────────────────────────────────

export const roleService = {
  /**
   * GET /api/roles
   * Permissions nahi aate — sirf naam, description, userCount
   */
  getRoles: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isSystem?: boolean;
  }): Promise<RolesListResponse> => {
    const response = await api.get('/api/roles', { params });
    return response.data;
  },

  /**
   * GET /api/roles/:id
   * Full role detail WITH permissions
   */
  getRoleById: async (id: string): Promise<RoleDetailResponse> => {
    const response = await api.get(`/api/roles/${id}`);
    return response.data;
  },

  /**
   * POST /api/roles
   * Naya role banao — permissions optional
   */
  createRole: async (data: {
    name: string;
    description?: string;
    permissions?: Record<string, Partial<ModulePermissions>>;
  }): Promise<RoleDetailResponse> => {
    const response = await api.post('/api/roles', data);
    return response.data;
  },

  /**
   * PUT /api/roles/:id
   * Sirf naam aur description update
   */
  updateRole: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<RoleDetailResponse> => {
    const response = await api.put(`/api/roles/${id}`, data);
    return response.data;
  },

  /**
   * PATCH /api/roles/:id/permissions
   * set   → modules add/update karo
   * remove → module keys array — ye modules hata do
   */
  updatePermissions: async (
    id: string,
    data: {
      set?: Record<string, Partial<ModulePermissions>>;
      remove?: string[];
    }
  ): Promise<RoleDetailResponse> => {
    const response = await api.patch(`/api/roles/${id}/permissions`, data);
    return response.data;
  },

  /**
   * DELETE /api/roles/:id
   */
  deleteRole: async (id: string): Promise<{ success: boolean; message: string; affectedUsers?: number }> => {
    const response = await api.delete(`/api/roles/${id}`);
    return response.data;
  },

  /**
   * PUT /api/roles/:roleId/assign/:userId
   * User ka role change — body kuch nahi, sirf URL params
   */
  assignRoleToUser: async (roleId: string, userId: string): Promise<AssignRoleResponse> => {
    const response = await api.put(`/api/roles/${roleId}/assign/${userId}`);
    return response.data;
  },

  /**
   * GET /api/roles/my-permissions
   */
  getMyPermissions: async (): Promise<MyPermissionsResponse> => {
    const response = await api.get('/api/roles/my-permissions');
    return response.data;
  },
};