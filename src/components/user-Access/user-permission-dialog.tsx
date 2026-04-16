"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Mail, UserCheck, Zap, Globe, Check, X } from "lucide-react";
import { TeamMember } from "@/types/teamMember";
import { roleService, Role, ModulePermissions } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";

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
  const [fullRole, setFullRole] = useState<Role | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingRoleDetails, setLoadingRoleDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) fetchRoles();
  }, [open]);

  useEffect(() => {
    if (user && user.roleId) {
      setSelectedRoleId(user.roleId);
    } else if (user && user.role) {
      // Find roleId by searching roles for the matching role name
      const matchedRole = roles.find(r => r.name === user.role || r.name === user.teamRole);
      if (matchedRole && typeof matchedRole._id === 'string') {
          setSelectedRoleId(matchedRole._id);
      }
    }
  }, [user, roles]);

  useEffect(() => {
    if (selectedRoleId) {
      setLoadingRoleDetails(true);
      roleService.getRoleById(selectedRoleId).then(res => {
         if (res.success && res.data) {
           setFullRole(res.data);
         }
         setLoadingRoleDetails(false);
      }).catch(() => setLoadingRoleDetails(false));
    } else {
      setFullRole(null);
    }
  }, [selectedRoleId]);

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
      // PUT /api/roles/:roleId/assign/:userId — dono IDs URL mein hain
      // userId = AuthUser._id ya User(profile)._id — backend dono accept karta hai
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

  const selectedRole = fullRole ?? roles.find((r) => r._id === selectedRoleId);

  const enabledMods = selectedRole
    ? PERMISSION_MODULES.filter((m) => {
        const mp = selectedRole.permissions?.[m.moduleKey];
        return mp && Object.values(mp).some(Boolean);
      })
    : [];

  const totalPerms = selectedRole
    ? Object.values(selectedRole.permissions ?? {}).reduce(
        (sum, mp) => sum + Object.values(mp).filter(Boolean).length,
        0,
      )
    : 0;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-brand">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-800">
                {user.firstName} {user.lastName}
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Mail className="h-3 w-3" /> {user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand" /> Assign Role
            </Label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={loadingRoles || saving}
            >
              <SelectTrigger className="h-10">
                <SelectValue
                  placeholder={loadingRoles ? "Loading roles…" : "Choose a role to assign"}
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    <div className="flex items-center gap-2">
                      {role.isSystem ? (
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-brand" />
                      )}
                      <span>{role.name}</span>
                      {role.isSystem && (
                        <span className="text-xs text-slate-400 ml-0.5">(System)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {!loadingRoles && roles.length === 0 && (
                  <div className="px-2 py-3 text-xs text-slate-400 text-center">
                    No roles found. Create roles in Settings first.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Role preview */}
          {loadingRoleDetails ? (
             <div className="text-center text-xs text-slate-500 py-6">Loading role permissions...</div>
          ) : selectedRole ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Role Preview</span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-3 w-3 text-brand" />
                  <span>{totalPerms} permissions</span>
                </div>
              </div>

              {enabledMods.length > 0 ? (
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {enabledMods.map((mod) => {
                      const mp = selectedRole.permissions?.[mod.moduleKey];
                      const actions = ACTIONS.filter((a) => mp?.[a]);
                      return (
                        <div
                          key={mod.moduleKey}
                          className="bg-white rounded-md border border-slate-200 px-2.5 py-2"
                        >
                          <p className="text-[11px] font-semibold text-slate-700 mb-1">
                            {mod.name}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {actions.map((a) => (
                              <span
                                key={a}
                                className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  This role has no permissions configured.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50/80 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedRoleId}
            className="h-9 bg-brand hover:bg-brand/90 text-white gap-2"
          >
            <UserCheck className="h-3.5 w-3.5" />
            {saving ? "Assigning…" : "Assign Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
