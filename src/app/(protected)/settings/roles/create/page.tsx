"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Shield, 
  CheckSquare2, 
  Lock, 
  Layout, 
  FileCheck2, 
  Save,
  CheckCircle2,
  Info
} from "lucide-react";
import { roleService } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

const ACTION_META: Record<ActionKey, { label: string; color: string; desc: string }> = {
  view:   { label: "View",   color: "text-blue-600 bg-blue-50 border-blue-100",     desc: "Read-only access" },
  create: { label: "Create", color: "text-emerald-600 bg-emerald-50 border-emerald-100", desc: "Allow entries" },
  edit:   { label: "Edit",   color: "text-amber-600 bg-amber-50 border-amber-100", desc: "Modify data" },
  delete: { label: "Delete", color: "text-red-600 bg-red-50 border-red-100",      desc: "Remove records" },
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
    <div className="min-h-screen bg-muted/50">
      {/* Premium Sticky Header */}
      <div className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-30 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/settings")}
              className="h-10 w-10 rounded-xl border-border hover:bg-muted shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Button>
            <div className="flex items-center gap-4 border-l pl-6 border-border">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-foreground tracking-tight leading-none mb-1">Create Access Role</h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> {totalChecked} PERMISSIONS ACROSS {enabledCount} MODULES
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                onClick={() => router.push("/settings")} 
                className="font-bold text-muted-foreground hover:bg-muted px-6 h-11"
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-11 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-xl gap-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isLoading ? "Saving..." : "Launch Role"}
              </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-10 max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-card rounded-3xl border border-border shadow-sm p-8 space-y-8 sticky top-32">
             <div className="space-y-1">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 block">Identity & Purpose</Label>
                <div className="space-y-6">
                   <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Role Name <span className="text-primary">*</span></Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="e.g. Talent Acquisition Manager"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="pl-10 h-12 border-border font-bold focus:border-primary transition-all text-sm"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium px-1">Unique identifier — displayed during assignment and in the dashboard.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Detailed Description</Label>
                    <textarea
                      placeholder="Briefly describe what users under this role can execute within the platform..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full min-h-[120px] p-4 text-sm font-medium border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground font-medium px-1">Optional — provides additional context for the team.</p>
                  </div>
                </div>
             </div>

             <div className="pt-8 border-t border-border">
               <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground leading-relaxed font-semibold">
                    The permission matrix on the right is derived automatically from the active system modules. You can granularly control access for each route.
                  </p>
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
             {/* Header */}
             <div className="px-10 py-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-muted rounded-lg">
                      <Layout className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Permission Registry</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="h-10 px-6 font-bold text-foreground rounded-xl border-border hover:bg-muted gap-2 transition-all shadow-sm active:scale-95"
                >
                  <CheckSquare2 className="h-4 w-4" />
                  {allOn ? "Deselect All" : "Full Access Toggle"}
                </Button>
             </div>

             <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full text-sm border-collapse min-w-[700px]">
                   <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-10 py-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest w-64">System Module</th>
                        {ACTIONS.map(a => (
                          <th key={a} className="text-center px-4 py-6 w-32">
                             <div className="flex flex-col items-center gap-4">
                                <div className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter shadow-sm", ACTION_META[a].color)}>
                                   {ACTION_META[a].label}
                                </div>
                                <Checkbox
                                  checked={isColAll(a)}
                                  onCheckedChange={v => toggleCol(a, !!v)}
                                  className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-border transition-all cursor-pointer"
                                />
                             </div>
                          </th>
                        ))}
                        <th className="text-center px-6 py-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Full Control</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {PERMISSION_MODULES.map((mod) => {
                        const active = isRowAny(mod.moduleKey);
                        const allRow = isRowAll(mod.moduleKey);
                        return (
                          <tr
                            key={mod.moduleKey}
                            className={cn(
                              "group transition-all duration-300",
                              active ? "bg-primary/[0.02]" : "hover:bg-muted/50"
                            )}
                          >
                             <td className="px-10 py-5">
                                <div className="flex items-center gap-4">
                                   <div className={cn(
                                     "w-2 h-10 rounded-full transition-all duration-500",
                                     active ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-muted"
                                   )} />
                                   <div className="flex flex-col">
                                      <span className={cn(
                                        "text-base font-bold transition-colors",
                                        active ? "text-foreground" : "text-muted-foreground"
                                      )}>
                                        {mod.name}
                                      </span>
                                      {active && <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Active Permissions</span>}
                                   </div>
                                </div>
                             </td>
                             {ACTIONS.map(a => (
                               <td key={a} className="text-center px-4 py-5">
                                 <Checkbox
                                   checked={matrix[mod.moduleKey]?.[a] ?? false}
                                   onCheckedChange={v => toggle(mod.moduleKey, a, !!v)}
                                   className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-border transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                 />
                               </td>
                             ))}
                             <td className="text-center px-6 py-5">
                               <div className="flex justify-center">
                                 <Switch
                                   checked={allRow}
                                   onCheckedChange={v => toggleRow(mod.moduleKey, v)}
                                   className="data-[state=checked]:bg-primary scale-90 shadow-sm"
                                 />
                               </div>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>

             {/* Dynamic Summary Footer */}
             <div className="px-10 py-5 bg-muted border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-border bg-primary/20 flex items-center justify-center">
                          <FileCheck2 className="w-3 h-3 text-primary" />
                        </div>
                      ))}
                   </div>
                   <p className="text-xs font-bold text-muted-foreground ml-2">
                     <span className="text-primary">{totalChecked}</span> permissions successfully configured.
                   </p>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                  You can modify these permissions later in the Roles settings.
                </p>
             </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);