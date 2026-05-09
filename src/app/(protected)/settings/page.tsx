"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Plus,
  Check,
  X,
  Eye,
  Edit2,
  Trash2,
  Settings2,
  ChevronRight,
  Search,
  MoreHorizontal,
  Zap,
  Lock,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoles } from "@/hooks/useRoles";
import { roleService, Role, ModulePermissions } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

const ACTION_COLORS: Record<ActionKey, string> = {
  view: "text-sky-600 bg-sky-50 border-sky-200",
  create: "text-emerald-600 bg-emerald-50 border-emerald-200",
  edit: "text-amber-600 bg-amber-50 border-amber-200",
  delete: "text-red-600 bg-red-50 border-red-200",
};

// ─── Permission Matrix Dialog ─────────────────────────────────────────────────
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
  const [loading, setLoading] = useState(true);
  const [fullRole, setFullRole] = useState<Role | null>(null);

  const buildMatrix = (r?: Role) => {
    const m: Record<string, Record<ActionKey, boolean>> = {};
    PERMISSION_MODULES.forEach((mod) => {
      const ex = r?.permissions?.[mod.moduleKey];
      m[mod.moduleKey] = {
        view: ex?.view ?? false,
        create: ex?.create ?? false,
        edit: ex?.edit ?? false,
        delete: ex?.delete ?? false,
      };
    });
    return m;
  };

  const [matrix, setMatrix] = useState(() => buildMatrix());

  useEffect(() => {
    const id = role._id || role.id;
    if (id) {
      roleService.getRoleById(id).then((res) => {
        if (res.success && res.data) {
          setFullRole(res.data);
          setMatrix(buildMatrix(res.data));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [role]);

  const toggle = (mk: string, a: ActionKey, v: boolean) =>
    setMatrix((p) => ({ ...p, [mk]: { ...p[mk], [a]: v } }));
  const toggleRow = (mk: string, v: boolean) =>
    setMatrix((p) => ({ ...p, [mk]: { view: v, create: v, edit: v, delete: v } }));
  const toggleCol = (a: ActionKey, v: boolean) =>
    setMatrix((p) => {
      const n = { ...p };
      PERMISSION_MODULES.forEach((m) => {
        n[m.moduleKey] = { ...n[m.moduleKey], [a]: v };
      });
      return n;
    });

  const isRowAll = (mk: string) => ACTIONS.every((a) => matrix[mk]?.[a]);
  const isColAll = (a: ActionKey) => PERMISSION_MODULES.every((m) => matrix[m.moduleKey]?.[a]);
  const isRowAny = (mk: string) => ACTIONS.some((a) => matrix[mk]?.[a]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const set: Record<string, Partial<ModulePermissions>> = {};
      const remove: string[] = [];
      PERMISSION_MODULES.forEach((mod) => {
        const perms = matrix[mod.moduleKey];
        if (Object.values(perms).some(Boolean)) {
          set[mod.moduleKey] = perms;
        } else if (role.permissions?.[mod.moduleKey]) {
          remove.push(mod.moduleKey);
        }
      });
      await onSave(set, remove);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const totalEnabled = PERMISSION_MODULES.filter((m) => isRowAny(m.moduleKey)).length;

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 text-center text-muted-foreground">
          Loading permissions...
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Permissions — <span className="text-brand">{role.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {totalEnabled} of {PERMISSION_MODULES.length} modules active
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-5 py-3 font-semibold text-foreground w-44 text-xs uppercase tracking-wide">
                  Module
                </th>
                {ACTIONS.map((a) => (
                  <th key={a} className="text-center px-4 py-3 w-28">
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${ACTION_COLORS[a]}`}
                      >
                        {a}
                      </span>
                      <Checkbox
                        checked={isColAll(a)}
                        onCheckedChange={(v) => toggleCol(a, !!v)}
                        className="h-3.5 w-3.5 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        title={`Toggle all ${a}`}
                      />
                    </div>
                  </th>
                ))}
                <th className="text-center px-4 py-3 w-20 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  All
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((mod, i) => {
                const rowActive = isRowAny(mod.moduleKey);
                return (
                  <tr
                    key={mod.moduleKey}
                    className={`border-b border-border transition-colors ${
                      rowActive ? "bg-brand/[0.02]" : "hover:bg-muted/60"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${rowActive ? "bg-brand" : "bg-muted"}`}
                        />
                        <span
                          className={`text-sm font-medium ${rowActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {mod.name}
                        </span>
                      </div>
                    </td>
                    {ACTIONS.map((a) => (
                      <td key={a} className="text-center px-4 py-3">
                        <Checkbox
                          checked={matrix[mod.moduleKey]?.[a] ?? false}
                          onCheckedChange={(v) => toggle(mod.moduleKey, a, !!v)}
                          className="h-4 w-4 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                      </td>
                    ))}
                    <td className="text-center px-4 py-3">
                      <Switch
                        checked={isRowAll(mod.moduleKey)}
                        onCheckedChange={(v) => toggleRow(mod.moduleKey, v)}
                        className="data-[state=checked]:bg-brand scale-90"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/80">
          <Button variant="outline" onClick={onClose} disabled={saving} className="h-9">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 bg-brand hover:bg-brand/90 text-white"
          >
            {saving ? "Saving…" : "Save Permissions"}
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
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
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
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Edit2 className="h-4 w-4 text-brand" />
            </div>
            <DialogTitle>Edit Role</DialogTitle>
          </div>
          <DialogDescription>Update the role name and description.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Role Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role.isSystem}
              placeholder="Role name"
              className="h-10"
            />
            {role.isSystem && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> System role naam change nahi ho sakta
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Description
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What can this role do?"
              className="h-10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="h-9">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 bg-brand hover:bg-brand/90 text-white"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── View Permissions Dialog ───────────────────────────────────────────────────
function ViewPermissionsDialog({ role, onClose }: { role: Role; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [fullRole, setFullRole] = useState<Role | null>(null);

  useEffect(() => {
    const id = role._id || role.id;
    if (id) {
      roleService.getRoleById(id).then((res) => {
        if (res.success && res.data) {
          setFullRole(res.data);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [role]);

  const perms = fullRole?.permissions ?? role.permissions ?? {};
  const enabledCount = PERMISSION_MODULES.filter((m) => {
    const mp = perms[m.moduleKey];
    return mp && Object.values(mp).some(Boolean);
  }).length;

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-sm p-6 text-center text-muted-foreground">
          Loading permissions...
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-brand" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{role.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {enabledCount} of {PERMISSION_MODULES.length} modules enabled
              </DialogDescription>
            </div>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-muted border-b">
                <th className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-44">
                  Module
                </th>
                {ACTIONS.map((a) => (
                  <th key={a} className="text-center px-4 py-2.5 w-24">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${ACTION_COLORS[a]}`}
                    >
                      {a}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((mod) => {
                const mp = perms[mod.moduleKey];
                const hasAny = mp && Object.values(mp).some(Boolean);
                return (
                  <tr
                    key={mod.moduleKey}
                    className={`border-b border-border ${hasAny ? "" : "opacity-40"}`}
                  >
                    <td className="px-5 py-2.5 font-medium text-foreground flex items-center gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${hasAny ? "bg-brand" : "bg-muted"}`}
                      />
                      {mod.name}
                    </td>
                    {ACTIONS.map((a) => (
                      <td key={a} className="text-center px-4 py-2.5">
                        {mp?.[a] ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t bg-muted">
          <Button variant="outline" onClick={onClose} className="h-9">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({
  role,
  onEdit,
  onPermissions,
  onDelete,
}: {
  role: Role;
  onEdit: () => void;
  onPermissions: () => void;
  onDelete: () => void;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const perms = role.permissions ?? {};
  const enabledMods = PERMISSION_MODULES.filter((m) => {
    const mp = perms[m.moduleKey];
    return mp && Object.values(mp).some(Boolean);
  });
  const totalPerms = Object.values(perms).reduce((sum, mp) => {
    return sum + Object.values(mp).filter(Boolean).length;
  }, 0);

  return (
    <>
      <div className="group bg-card rounded-xl border border-border hover:border-brand/40 hover:shadow-md shadow-sm transition-all duration-200 flex flex-col overflow-hidden">
        {/* Top strip — color indicator */}
        <div
          className={`h-1 w-full ${role.isSystem ? "bg-gradient-to-r from-slate-400 to-slate-500" : "bg-gradient-to-r from-brand to-brand/60"}`}
        />

        <div className="p-5 flex-1 flex flex-col">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${role.isSystem ? "bg-muted" : "bg-brand/10"}`}
              >
                {role.isSystem ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Shield className="h-4 w-4 text-brand" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
                  {role.name}
                </h3>
                {role.isSystem && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    System Role
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setViewOpen(true)} className="gap-2 text-xs">
                  <Eye className="h-3.5 w-3.5" /> View Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs">
                  <Edit2 className="h-3.5 w-3.5" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPermissions} className="gap-2 text-xs">
                  <Settings2 className="h-3.5 w-3.5" /> Edit Permissions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 text-xs">
                  <Link href={`/settings/roles/${role._id || role.id}/assign`}>
                    <Users className="h-3.5 w-3.5" /> Assign Users
                  </Link>
                </DropdownMenuItem>
                {!role.isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="gap-2 text-xs text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Role
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {role.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {role.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-brand" />
              <strong className="text-foreground">{totalPerms}</strong> permissions
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <strong className="text-foreground">{role.userCount ?? 0}</strong> users
            </span>
          </div>

          {/* Module chips */}
          {enabledMods.length > 0 ? (
            <div className="flex flex-wrap gap-1 mb-4">
              {enabledMods.slice(0, 4).map((m) => (
                <span
                  key={m.moduleKey}
                  className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-brand/8 text-brand border border-brand/15"
                >
                  {m.name}
                </span>
              ))}
              {enabledMods.length > 4 && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  +{enabledMods.length - 4}
                </span>
              )}
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber-400" /> No permissions set
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 hover:border-brand hover:text-brand"
              onClick={() => setViewOpen(true)}
            >
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 bg-brand hover:bg-brand/90 text-white"
              onClick={onPermissions}
            >
              <Settings2 className="h-3.5 w-3.5" /> Permissions
            </Button>
          </div>
        </div>
      </div>

      {viewOpen && <ViewPermissionsDialog role={role} onClose={() => setViewOpen(false)} />}
    </>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsRolesPage() {
  const { roles, loading, fetchRoles, updateRole, updatePermissions, deleteRole } = useRoles();
  const [search, setSearch] = useState("");
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const systemRoles = filtered.filter((r) => r.isSystem);
  const customRoles = filtered.filter((r) => !r.isSystem);

  const handleUpdateName = async (name: string, description: string) => {
    if (!editRole) return;
    await updateRole(editRole._id || editRole.id!, { name, description });
    toast.success("Role updated");
  };

  const handleUpdatePermissions = async (
    set: Record<string, Partial<ModulePermissions>>,
    remove: string[],
  ) => {
    if (!permRole) return;
    await updatePermissions(permRole._id || permRole.id!, { set, remove });
    toast.success("Permissions saved");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteRole(deleteTarget._id || deleteTarget.id!);
      if (res.success) toast.success(`"${deleteTarget.name}" deleted`);
      else toast.error(res.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/60">
      {/* Page Header */}
      <div className="bg-card border-b sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Roles & Permissions</h1>
              <p className="text-xs text-muted-foreground">
                {roles.length} total roles • {roles.filter((r) => !r.isSystem).length} custom
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search roles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-56 text-sm"
              />
            </div>
            <Button
              asChild
              className="h-9 bg-brand hover:bg-brand/90 text-white gap-2 text-xs font-medium"
            >
              <Link href="/settings/roles/create">
                <Plus className="h-4 w-4" /> Create Role
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border h-52 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Custom Roles */}
            {customRoles.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Custom Roles
                  </h2>
                  <div className="h-px flex-1 bg-muted" />
                  <Badge variant="secondary" className="text-xs">
                    {customRoles.length}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {customRoles.map((role) => (
                    <RoleCard
                      key={role._id || role.id}
                      role={role}
                      onEdit={() => setEditRole(role)}
                      onPermissions={() => setPermRole(role)}
                      onDelete={() => setDeleteTarget(role)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* System Roles */}
            {systemRoles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    System Roles
                  </h2>
                  <div className="h-px flex-1 bg-muted" />
                  <Badge variant="secondary" className="text-xs">
                    {systemRoles.length}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {systemRoles.map((role) => (
                    <RoleCard
                      key={role._id || role.id}
                      role={role}
                      onEdit={() => setEditRole(role)}
                      onPermissions={() => setPermRole(role)}
                      onDelete={() => setDeleteTarget(role)}
                    />
                  ))}
                </div>
              </section>
            )}

            {!filtered.length && (
              <div className="text-center py-20">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No roles found</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {search
                    ? `No results for "${search}"`
                    : "Create your first custom role to get started."}
                </p>
                {!search && (
                  <Button
                    asChild
                    className="mt-4 h-9 bg-brand hover:bg-brand/90 text-white gap-2 text-xs"
                  >
                    <Link href="/settings/roles/create">
                      <Plus className="h-4 w-4" /> Create Role
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
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
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Agar koi user is role pe assigned hai toh delete nahi hoga. Ye action undo nahi ho
              sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting…" : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
