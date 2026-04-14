import { api } from '@/lib/axios-config';

export interface Role {
  _id: string;
  id?: string;
  name: string;
  displayName?: string;
  description?: string;
  permissions: Record<string, any>;
  isDefault?: boolean;
}

export const roleService = {
  // POST /api/roles
  createRole: async (data: Partial<Role>) => {
    const response = await api.post('/api/roles', data);
    return response.data;
  },

  // GET /api/roles
  getRoles: async () => {
    const response = await api.get('/api/roles');
    return response.data;
  },

  // PUT /api/roles/:id
  updateRole: async (id: string, data: Partial<Role>) => {
    const response = await api.put(`/api/roles/${id}`, data);
    return response.data;
  },

  // DELETE /api/roles/:id
  deleteRole: async (id: string) => {
    const response = await api.delete(`/api/roles/${id}`);
    return response.data;
  },

  // PUT /api/users/:id/role
  assignRoleToUser: async (userId: string, roleId: string) => {
    const response = await api.put(`/api/users/${userId}/role`, { roleId });
    return response.data;
  },

  // PUT /api/users/:id/permissions
  updateUserCustomPermissions: async (userId: string, customPermissions: string[]) => {
    const response = await api.put(`/api/users/${userId}/permissions`, { customPermissions });
    return response.data;
  }
};
