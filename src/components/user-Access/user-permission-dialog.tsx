"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Mail, User } from "lucide-react";
import { TeamMember } from "@/types/teamMember";
import { roleService, Role, ModulePermissions } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

interface UserPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: TeamMember | null;
  onPermissionsUpdated?: () => void;
}

export function UserPermissionDialog({
  open,
  onOpenChange,
  user,
  onPermissionsUpdated,
}: UserPermissionDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all roles on open
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await roleService.getRoles();
      setRoles(res?.data ?? []);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSave = async () => {
    if (!user?._id || !selectedRoleId) {
      toast.error("Please select a role");
      return;
    }
    setSaving(true);
    try {
      // PUT /api/roles/:roleId/assign/:userId
      const res = await roleService.assignRoleToUser(selectedRoleId, user._id);
      toast.success(res.message || "Role assigned successfully");
      onPermissionsUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to assign role");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role — {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            Is user ko ek role assign karo. Role ke permissions automatically apply honge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User Info */}
          <div className="p-3 rounded-lg bg-slate-50 border text-sm space-y-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <User className="h-3.5 w-3.5" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <Label>Select Role</Label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={loadingRoles || saving}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Choose a role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    <div className="flex items-center gap-2">
                      <span>{role.name}</span>
                      {role.isSystem && (
                        <span className="text-xs text-slate-400">(System)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show selected role's module summary */}
          {selectedRoleId && (() => {
            const role = roles.find((r) => r._id === selectedRoleId);
            if (!role?.permissions) return null;
            const enabled = PERMISSION_MODULES.filter((mod) => {
              const mp = role.permissions![mod.moduleKey];
              return mp && Object.values(mp).some(Boolean);
            });
            if (enabled.length === 0) return null;
            return (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Modules with access</Label>
                <div className="flex flex-wrap gap-1.5">
                  {enabled.map((mod) => (
                    <span
                      key={mod.moduleKey}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand"
                    >
                      {mod.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedRoleId}
            className="bg-brand hover:bg-brand/90"
          >
            {saving ? "Assigning..." : "Assign Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}