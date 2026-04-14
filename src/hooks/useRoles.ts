import { useState, useCallback } from 'react';
import { roleService, Role } from '@/services/roleService';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.getRoles();
      
      let fetchedRoles: Role[] = [];
      if (Array.isArray(data)) {
        fetchedRoles = data;
      } else if (data?.data && Array.isArray(data.data)) {
        fetchedRoles = data.data;
      } else if (data?.data?.roles && Array.isArray(data.data.roles)) {
        fetchedRoles = data.data.roles;
      } else if (data?.roles && Array.isArray(data.roles)) {
        fetchedRoles = data.roles;
      }
      
      setRoles(fetchedRoles);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (data: Partial<Role>) => {
    try {
      const newRole = await roleService.createRole(data);
      await fetchRoles(); // Refresh
      return newRole;
    } catch (err) {
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      await fetchRoles(); // Refresh list after deleting
    } catch (err) {
      throw err;
    }
  };

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    deleteRole
  };
}
