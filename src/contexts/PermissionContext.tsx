"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { roleService, ModulePermissions } from "@/services/roleService";
import { useAuth } from "@/contexts/AuthContext";

type ActionType = "view" | "create" | "edit" | "delete";

interface PermissionContextType {
  permissions: Record<string, ModulePermissions>;
  roleId: string | null;
  roleName: string | null;
  loading: boolean;
  hasPermission: (module: string, action: ActionType) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, ModulePermissions>>({});
  const [roleId, setRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions({});
      setRoleId(null);
      setRoleName(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await roleService.getMyPermissions();
      // API returns: { success: true, data: { roleId, role, permissions } }
      const data = res?.data;
      setPermissions((data?.permissions as Record<string, ModulePermissions>) ?? {});
      setRoleId(data?.roleId ?? null);
      setRoleName(data?.role ?? null);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions({});
      setRoleId(null);
      setRoleName(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  /**
   * ADMIN always has all permissions.
   * Others: check permissions[module][action]
   * Module key is case-insensitive (checks as-is + lowercase + uppercase).
   */
  const hasPermission = (module: string, action: ActionType): boolean => {
    if (user?.role === "ADMIN") return true;
    if (!permissions) return false;

    const mp =
      permissions[module] ??
      permissions[module.toLowerCase()] ??
      permissions[module.toUpperCase()];

    if (!mp) return false;
    return mp[action] === true;
  };

  return (
    <PermissionContext.Provider
      value={{ permissions, roleId, roleName, loading, hasPermission, refreshPermissions: fetchPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}