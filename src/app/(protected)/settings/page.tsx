"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield, Users, Plus, Check, X, Eye, Edit2, Trash2, Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useRoles } from "@/hooks/useRoles";
import { Role, ModulePermissions } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

// ─── Permission Dialog (Edit permissions of a role) ────────────────────────────
function PermissionDialog({
  role,
  onClose,
  onSave,
}: {
  role: Role;
  onClose: () => void;
  onSave: (set: Record<string, Partial<ModulePermissions>>, remove: string[]) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  // Build matrix from existing permissions or from sidebar modules
  const buildMatrix = () => {
    const matrix: Record<string, Record<ActionKey, boolean>> = {};
    PERMISSION_MODULES.forEach((mod) => {
      const existing = role.permissions?.[mod.moduleKey];
      matrix[mod.moduleKey] = {
        view: existing?.view ?? false,
        create: existing?.create ?? false,
        edit: existing?.edit ?? false,
        delete: existing?.delete ?? false,
      };
    });
    return matrix;
  };

  const [matrix, setMatrix] = useState<Record<string, Record<ActionKey, boolean>>>(buildMatrix);

  const toggle = (moduleKey: string, action: ActionKey, checked: boolean) =>
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: checked },
    }));

  const toggleRow = (moduleKey: string, checked: boolean) =>
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { view: checked, create: checked, edit: checked, delete: checked },
    }));

  const toggleColumn = (action: ActionKey, checked: boolean) =>
    setMatrix((prev) => {
      const next = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        next[mod.moduleKey] = { ...next[mod.moduleKey], [action]: checked };
      });
      return next;
    });

  const isRowChecked = (moduleKey: string) => ACTIONS.every((a) => matrix[moduleKey]?.[a]);
  const isColChecked = (action: ActionKey) => PERMISSION_MODULES.every((mod) => matrix[mod.moduleKey]?.[action]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const set: Record<string, Partial<ModulePermissions>> = {};
      const remove: string[] = [];

      PERMISSION_MODULES.forEach((mod) => {
        const perms = matrix[mod.moduleKey];
        const hasAny = Object.values(perms).some(Boolean);
        if (hasAny) {
          set[mod.moduleKey] = perms;
        } else if (role.permissions?.[mod.moduleKey]) {
          // was enabled before, now all false → remove
          remove.push(mod.moduleKey);
        }
      });

      await onSave(set, remove);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Edit Permissions — {role.name}
          </DialogTitle>
          <DialogDescription>
            Module permissions update karo. Sidebar routes se automatically derive hote hain.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto flex-1 mt-2">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-48">Module</th>
                {ACTIONS.map((action) => (
                  <th key={action} className="text-center px-4 py-3 font-medium text-slate-600 capitalize">
                    <div className="flex flex-col items-center gap-1.5">
                      {action}
                      <Checkbox
                        checked={isColChecked(action)}
                        onCheckedChange={(c) => toggleColumn(action, !!c)}
                        className="h-3.5 w-3.5"
                      />
                    </div>
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-slate-600">All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MODULES.map((mod) => (
                <tr key={mod.moduleKey} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{mod.name}</td>
                  {ACTIONS.map((action) => (
                    <td key={action} className="text-center px-4 py-3">
                      <Checkbox
                        checked={matrix[mod.moduleKey]?.[action] ?? false}
                        onCheckedChange={(c) => toggle(mod.moduleKey, action, !!c)}
                        className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                      />
                    </td>
                  ))}
                  <td className="text-center px-4 py-3">
                    <Switch
                      checked={isRowChecked(mod.moduleKey)}
                      onCheckedChange={(c) => toggleRow(mod.moduleKey, c)}
                      className="data-[state=checked]:bg-brand"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-brand hover:bg-brand/90">
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Name/Description Dialog ─────────────────────────────────────────────
function EditRoleDialog({
  role,
  onClose,
  onSave,
}: {
  role: Role;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Role name required"); return; }
    setSaving(true);
    try {
      await onSave(name.trim(), description.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Naam aur description update karo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Role Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role.isSystem}
              placeholder="Role name"
            />
            {role.isSystem && (
              <p className="text-xs text-slate-400">System role ka naam nahi badal sakta.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-brand hover:bg-brand/90">
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── View Permissions Dialog ───────────────────────────────────────────────────
function ViewPermissionsDialog({ role, onClose }: { role: Role; onClose: () => void }) {
  const perms = role.permissions ?? {};

  // Show all sidebar modules, with role's current values
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role.name} — Permissions</DialogTitle>
          <DialogDescription>Is role ke module-wise permissions.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 border rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            <div>Module</div>
            <div className="text-center">View</div>
            <div className="text-center">Create</div>
            <div className="text-center">Edit</div>
            <div className="text-center">Delete</div>
          </div>
          <div className="divide-y">
            {PERMISSION_MODULES.map((mod) => {
              const mp = perms[mod.moduleKey];
              return (
                <div key={mod.moduleKey} className="grid grid-cols-5 items-center px-4 py-2.5 hover:bg-slate-50/70">
                  <div className="text-sm font-medium text-slate-700">{mod.name}</div>
                  {ACTIONS.map((action) => (
                    <div key={action} className="flex justify-center">
                      {mp?.[action] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-slate-200" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function page() {
  const { roles, loading, fetchRoles, updateRole, updatePermissions, deleteRole } = useRoles();

  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleUpdateName = async (name: string, description: string) => {
    if (!editRole) return;
    const id = editRole._id || editRole.id!;
    await updateRole(id, { name, description });
    toast.success("Role updated");
  };

  const handleUpdatePermissions = async (
    set: Record<string, Partial<ModulePermissions>>,
    remove: string[]
  ) => {
    if (!permRole) return;
    const id = permRole._id || permRole.id!;
    await updatePermissions(id, { set, remove });
    toast.success("Permissions saved");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const id = deleteTarget._id || deleteTarget.id!;
      const res = await deleteRole(id);
      if (res.success) {
        toast.success(`Role "${deleteTarget.name}" deleted`);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand" />
            <h1 className="text-xl font-semibold">Roles & Permissions</h1>
          </div>
          <Button asChild className="bg-brand hover:bg-brand/90">
            <Link href="/settings/roles/create">
              <Plus className="mr-2 h-4 w-4" /> Create Role
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 py-6 px-4">
        <div className="mx-auto w-full max-w-7xl">
          {loading ? (
            <div className="text-center text-slate-500 py-12">Loading roles...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const roleId = role._id || role.id;
                const perms = role.permissions ?? {};
                const enabledModules = PERMISSION_MODULES.filter((mod) => {
                  const mp = perms[mod.moduleKey];
                  return mp && Object.values(mp).some(Boolean);
                });

                return (
                  <Card key={roleId as string} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4 text-brand shrink-0" />
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="outline" className="ml-1 text-xs">System</Badge>
                          )}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-slate-700"
                            onClick={() => setEditRole(role)}
                            title="Edit name/description"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {!role.isSystem && (
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-600"
                              onClick={() => setDeleteTarget(role)}
                              title="Delete role"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs mt-1">{role.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{enabledModules.length} modules enabled</span>
                        {role.userCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {role.userCount} users
                          </span>
                        )}
                      </div>

                      {/* Mini permission dots */}
                      {enabledModules.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {enabledModules.slice(0, 5).map((mod) => (
                            <span
                              key={mod.moduleKey}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand"
                            >
                              {mod.name}
                            </span>
                          ))}
                          {enabledModules.length > 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              +{enabledModules.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline" size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => setViewRole(role)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          className="flex-1 h-8 text-xs border-brand text-brand hover:bg-brand/5"
                          onClick={() => setPermRole(role)}
                        >
                          <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Permissions
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          className="flex-1 h-8 text-xs"
                          asChild
                        >
                          <Link href={`/settings/roles/${roleId}/assign`}>
                            <Users className="mr-1.5 h-3.5 w-3.5" /> Assign
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {!roles.length && !loading && (
                <div className="col-span-full text-center p-12 text-slate-400 border rounded-xl bg-white">
                  <Shield className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600">No roles found</p>
                  <p className="text-sm mt-1">Create your first custom role to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {viewRole && <ViewPermissionsDialog role={viewRole} onClose={() => setViewRole(null)} />}
      {editRole && (
        <EditRoleDialog
          role={editRole}
          onClose={() => setEditRole(null)}
          onSave={handleUpdateName}
        />
      )}
      {permRole && (
        <PermissionDialog
          role={permRole}
          onClose={() => setPermRole(null)}
          onSave={handleUpdatePermissions}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Agar koi user is role pe assigned hai toh delete nahi hoga. Ye action undo nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}