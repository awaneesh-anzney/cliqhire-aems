"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { roleService } from "@/services/roleService";
import { useAuth } from "@/contexts/AuthContext";

type ActionType = "view" | "create" | "edit" | "delete";

interface PermissionContextType {
  permissions: Record<string, any>;
  roleName: string | null;
  loading: boolean;
  hasPermission: (module: string, action: ActionType) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions({});
      setRoleName(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await roleService.getMyPermissions();
      // The API returns: { success: true, data: { role: "...", permissions: {...} } }
      const data = res?.data || res;
      
      setPermissions(data?.permissions || {});
      setRoleName(data?.role || null);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions({});
      setRoleName(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (module: string, action: ActionType): boolean => {
    // If Admin, they typically have all access. (Optional fallback logic)
    if (user?.role === "ADMIN") return true;

    if (!permissions) return false;
    
    // Check module (case-insensitive for safety)
    const modulePerms = permissions[module] || permissions[module.toLowerCase()] || permissions[module.toUpperCase()];
    if (!modulePerms) return false;

    return modulePerms[action] === true || modulePerms[action] === "true";
  };

  return (
    <PermissionContext.Provider value={{ permissions, roleName, loading, hasPermission, refreshPermissions: fetchPermissions }}>
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
