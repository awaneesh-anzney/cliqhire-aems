"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, Zap, CheckSquare2 } from "lucide-react";
import { roleService } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

const ACTION_META: Record<ActionKey, { label: string; color: string; desc: string }> = {
  view:   { label: "View",   color: "text-sky-600 bg-sky-50 border-sky-200",     desc: "Can see & read" },
  create: { label: "Create", color: "text-emerald-600 bg-emerald-50 border-emerald-200", desc: "Can add new" },
  edit:   { label: "Edit",   color: "text-amber-600 bg-amber-50 border-amber-200", desc: "Can update" },
  delete: { label: "Delete", color: "text-red-600 bg-red-50 border-red-200",      desc: "Can remove" },
};

function buildInitialMatrix() {
  const m: Record<string, Record<ActionKey, boolean>> = {};
  PERMISSION_MODULES.forEach(mod => {
    m[mod.moduleKey] = { view: false, create: false, edit: false, delete: false };
  });
  return m;
}

export default function CreateRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matrix, setMatrix] = useState(buildInitialMatrix);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (mk: string, a: ActionKey, v: boolean) =>
    setMatrix(p => ({ ...p, [mk]: { ...p[mk], [a]: v } }));

  const toggleRow = (mk: string, v: boolean) =>
    setMatrix(p => ({ ...p, [mk]: { view: v, create: v, edit: v, delete: v } }));

  const toggleCol = (a: ActionKey, v: boolean) =>
    setMatrix(p => {
      const n = { ...p };
      PERMISSION_MODULES.forEach(m => { n[m.moduleKey] = { ...n[m.moduleKey], [a]: v }; });
      return n;
    });

  const isRowAll = (mk: string) => ACTIONS.every(a => matrix[mk]?.[a]);
  const isRowAny = (mk: string) => ACTIONS.some(a => matrix[mk]?.[a]);
  const isColAll = (a: ActionKey) => PERMISSION_MODULES.every(m => matrix[m.moduleKey]?.[a]);

  const enabledCount = PERMISSION_MODULES.filter(m => isRowAny(m.moduleKey)).length;
  const totalChecked = PERMISSION_MODULES.reduce(
    (sum, m) => sum + ACTIONS.filter(a => matrix[m.moduleKey]?.[a]).length, 0
  );

  const handleSelectAll = () => {
    const allOn = PERMISSION_MODULES.every(m => isRowAll(m.moduleKey));
    setMatrix(p => {
      const n = { ...p };
      PERMISSION_MODULES.forEach(m => {
        n[m.moduleKey] = { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn };
      });
      return n;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Role name is required"); return; }
    setIsLoading(true);
    try {
      const permissions: Record<string, Record<ActionKey, boolean>> = {};
      PERMISSION_MODULES.forEach(mod => {
        const p = matrix[mod.moduleKey];
        if (Object.values(p).some(Boolean)) permissions[mod.moduleKey] = p;
      });
      await roleService.createRole({ name: name.trim(), description: description.trim(), permissions });
      toast.success("Role created successfully!");
      router.push("/settings");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to create role");
    } finally {
      setIsLoading(false);
    }
  };

  const allOn = PERMISSION_MODULES.every(m => isRowAll(m.moduleKey));

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost" size="icon"
            onClick={() => router.push("/settings")}
            className="h-9 w-9 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800">Create New Role</h1>
              <p className="text-xs text-slate-500">
                {enabledCount} modules • {totalChecked} permissions selected
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/settings")} className="h-9 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-9 text-xs bg-brand hover:bg-brand/90 text-white gap-2"
            >
              {isLoading ? "Creating…" : <><Zap className="h-3.5 w-3.5" /> Create Role</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-5">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Role Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Role Name <span className="text-red-500 normal-case">*</span>
              </Label>
              <Input
                placeholder="e.g. Senior Recruiter"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-10"
                required
              />
              <p className="text-xs text-slate-400">Unique naam — frontend aur assign karte waqt dikhega</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description</Label>
              <Input
                placeholder="What can this role do?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-slate-400">Optional — team ke liye context</p>
            </div>
          </div>
        </div>

        {/* Permission Matrix Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Matrix header */}
          <div className="px-6 py-4 border-b bg-slate-50/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Permission Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Modules sidebar routes se auto-derive hote hain
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs gap-1.5"
            >
              <CheckSquare2 className="h-3.5 w-3.5" />
              {allOn ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="text-left px-6 py-3 font-medium text-slate-500 text-xs w-48">Module</th>
                  {ACTIONS.map(a => (
                    <th key={a} className="text-center px-4 py-3 w-28">
                      <div className="flex flex-col items-center gap-2">
                        <div>
                          <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${ACTION_META[a].color}`}>
                            {a}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">{ACTION_META[a].desc}</p>
                        </div>
                        <Checkbox
                          checked={isColAll(a)}
                          onCheckedChange={v => toggleCol(a, !!v)}
                          className="h-4 w-4 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                          title={`Toggle all ${a}`}
                        />
                      </div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 w-20">Full</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MODULES.map((mod, i) => {
                  const active = isRowAny(mod.moduleKey);
                  return (
                    <tr
                      key={mod.moduleKey}
                      className={`border-b border-slate-100 transition-colors ${
                        active ? "bg-brand/[0.015]" : i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      } hover:bg-brand/[0.03]`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2 w-2 rounded-full shrink-0 transition-colors ${active ? "bg-brand" : "bg-slate-200"}`} />
                          <span className={`text-sm font-medium transition-colors ${active ? "text-slate-800" : "text-slate-400"}`}>
                            {mod.name}
                          </span>
                        </div>
                      </td>
                      {ACTIONS.map(a => (
                        <td key={a} className="text-center px-4 py-3.5">
                          <Checkbox
                            checked={matrix[mod.moduleKey]?.[a] ?? false}
                            onCheckedChange={v => toggle(mod.moduleKey, a, !!v)}
                            className="h-4 w-4 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                          />
                        </td>
                      ))}
                      <td className="text-center px-4 py-3.5">
                        <Switch
                          checked={isRowAll(mod.moduleKey)}
                          onCheckedChange={v => toggleRow(mod.moduleKey, v)}
                          className="data-[state=checked]:bg-brand scale-90"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="px-6 py-3 border-t bg-slate-50/80 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              <strong className="text-brand">{totalChecked}</strong> permissions across{" "}
              <strong className="text-slate-600">{enabledCount}</strong> modules selected
            </p>
            <p className="text-xs text-slate-400">
              Baad mein Settings mein PATCH se change kar sakte ho
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}