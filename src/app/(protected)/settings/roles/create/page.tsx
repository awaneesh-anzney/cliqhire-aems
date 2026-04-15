"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, CheckSquare } from "lucide-react";
import { roleService } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

function buildInitialMatrix() {
  const matrix: Record<string, Record<ActionKey, boolean>> = {};
  PERMISSION_MODULES.forEach((mod) => {
    matrix[mod.moduleKey] = { view: false, create: false, edit: false, delete: false };
  });
  return matrix;
}

export default function page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matrix, setMatrix] = useState<Record<string, Record<ActionKey, boolean>>>(buildInitialMatrix());
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (moduleKey: string, action: ActionKey, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: checked },
    }));
  };

  // Toggle entire row
  const toggleRow = (moduleKey: string, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { view: checked, create: checked, edit: checked, delete: checked },
    }));
  };

  // Toggle entire column
  const toggleColumn = (action: ActionKey, checked: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        next[mod.moduleKey] = { ...next[mod.moduleKey], [action]: checked };
      });
      return next;
    });
  };

  const isRowChecked = (moduleKey: string) =>
    ACTIONS.every((a) => matrix[moduleKey]?.[a]);

  const isColChecked = (action: ActionKey) =>
    PERMISSION_MODULES.every((mod) => matrix[mod.moduleKey]?.[action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsLoading(true);
    try {
      // Only send modules that have at least one permission enabled
      const permissions: Record<string, Record<ActionKey, boolean>> = {};
      PERMISSION_MODULES.forEach((mod) => {
        const perms = matrix[mod.moduleKey];
        if (Object.values(perms).some(Boolean)) {
          permissions[mod.moduleKey] = perms;
        }
      });

      await roleService.createRole({ name: name.trim(), description: description.trim(), permissions });
      toast.success("Role created successfully!");
      router.push("/settings");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create role";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand" />
            <h1 className="text-xl font-semibold">Create New Role</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Role Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Role Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="e.g. Senior Recruiter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Describes what this role can do"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Permission Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modules yahan sidebar routes se automatically derive hote hain.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {PERMISSION_MODULES.length} modules
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left px-6 py-3 font-medium text-slate-600 w-52">Module</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="text-center px-4 py-3 font-medium text-slate-600 capitalize">
                          <div className="flex flex-col items-center gap-1.5">
                            {action}
                            <Checkbox
                              checked={isColChecked(action)}
                              onCheckedChange={(c) => toggleColumn(action, !!c)}
                              className="h-3.5 w-3.5"
                              title={`Toggle all ${action}`}
                            />
                          </div>
                        </th>
                      ))}
                      <th className="text-center px-4 py-3 font-medium text-slate-600">All</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PERMISSION_MODULES.map((mod) => (
                      <tr key={mod.moduleKey} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-700">{mod.name}</td>
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
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-brand hover:bg-brand/90">
                {isLoading ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}