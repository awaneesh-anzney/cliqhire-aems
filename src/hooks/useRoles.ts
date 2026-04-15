import { useState, useCallback } from 'react';
import { roleService, Role, ModulePermissions } from '@/services/roleService';
import { toast } from 'sonner';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roleService.getRoles();
      setRoles(res?.data ?? []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (data: {
    name: string;
    description?: string;
    permissions?: Record<string, Partial<ModulePermissions>>;
  }) => {
    const res = await roleService.createRole(data);
    await fetchRoles();
    return res;
  };

  const updateRole = async (id: string, data: { name?: string; description?: string }) => {
    const res = await roleService.updateRole(id, data);
    await fetchRoles();
    return res;
  };

  const updatePermissions = async (
    id: string,
    data: { set?: Record<string, Partial<ModulePermissions>>; remove?: string[] }
  ) => {
    const res = await roleService.updatePermissions(id, data);
    await fetchRoles();
    return res;
  };

  const deleteRole = async (id: string) => {
    const res = await roleService.deleteRole(id);
    if (res.success) {
      await fetchRoles();
    }
    return res;
  };

  const assignRoleToUser = async (roleId: string, userId: string) => {
    const res = await roleService.assignRoleToUser(roleId, userId);
    return res;
  };

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    updatePermissions,
    deleteRole,
    assignRoleToUser,
  };
}