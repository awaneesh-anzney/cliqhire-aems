"use client";

import React from "react";
import { Role } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";
import {
  Shield,
  Zap,
  Check,
  X,
  Loader2,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

interface MemberAccessMatrixProps {
  currentRoleName?: string;
  roles: Role[];
  selectedRoleId: string;
  setSelectedRoleId: (id: string) => void;
  selectedRole: Role | null;
  loadingRoleDetails: boolean;
  isLoadingRoles: boolean;
  isAssigning: boolean;
  onAssignRole: () => void;
  userRoleId?: string;
}

export const MemberAccessMatrix: React.FC<MemberAccessMatrixProps> = ({
  currentRoleName = "Unassigned",
  roles = [],
  selectedRoleId,
  setSelectedRoleId,
  selectedRole,
  loadingRoleDetails,
  isLoadingRoles,
  isAssigning,
  onAssignRole,
  userRoleId,
}) => {
  // Total actions enabled
  const totalPerms = selectedRole
    ? Object.values(selectedRole.permissions ?? {}).reduce(
        (sum, mp) => sum + Object.values(mp).filter(Boolean).length,
        0
      )
    : 0;

  // Enabled modules
  const enabledMods = selectedRole
    ? PERMISSION_MODULES.filter((m) => {
        const mp = selectedRole.permissions?.[m.moduleKey];
        return mp && Object.values(mp).some(Boolean);
      })
    : [];

  const isStatsLoading =
    loadingRoleDetails || (!!selectedRoleId && !selectedRole);
  const isAssignDisabled =
    !selectedRoleId || isAssigning || userRoleId === selectedRoleId;

  return (
    <div className="space-y-3.5 select-none flex flex-col h-full">
      {/* Top 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
        {/* Current Role Card */}
        <div className="bg-card p-3.5 rounded-2xl border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Current Role
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground block truncate">
              {currentRoleName.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Total Actions Card */}
        <div className="bg-card p-3.5 rounded-2xl border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Capabilities
            </span>
            <div className="flex items-baseline gap-1">
              {isStatsLoading ? (
                <div className="h-5 w-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-sm sm:text-base font-black text-foreground">
                    {totalPerms}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    actions
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Accessible Modules Card */}
        <div className="bg-card p-3.5 rounded-2xl border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Module Access
            </span>
            <div className="flex items-baseline gap-1">
              {isStatsLoading ? (
                <div className="h-5 w-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-sm sm:text-base font-black text-foreground">
                    {enabledMods.length}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    of {PERMISSION_MODULES.length} modules
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Console: Role Assignment & Matrix */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Action Header */}
        <div className="p-3.5 sm:px-4 sm:py-3 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Authority & Effective Access
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Assign organizational role and inspect authorized capabilities
              </p>
            </div>
          </div>

          {/* Role Dropdown & Assign Button */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isLoadingRoles || isAssigning}
            >
              <SelectTrigger className="h-8.5 w-48 sm:w-56 text-xs bg-card border-border/80 font-medium rounded-xl">
                <SelectValue
                  placeholder={isLoadingRoles ? "Loading roles..." : "Select Role"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                {roles.map((r) => (
                  <SelectItem
                    key={r._id || r.id}
                    value={(r._id || r.id) as string}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.name}</span>
                      {r.isSystem && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                          System
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={onAssignRole}
              disabled={isAssignDisabled}
              size="sm"
              className="h-8.5 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Assign Role</span>
              )}
            </Button>
          </div>
        </div>

        {/* Matrix Body Container */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {loadingRoleDetails ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Loading Access Matrix...
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Validating organizational permissions
                </p>
              </div>
            </div>
          ) : selectedRole ? (
            <div className="space-y-4">
              {/* Matrix Label */}
              <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-foreground uppercase tracking-wider">
                    Effective Matrix for:
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {selectedRole.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {enabledMods.length} Modules Active
                </span>
              </div>

              {/* Module Cards Grid */}
              {enabledMods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {enabledMods.map((mod) => {
                    const mp = selectedRole.permissions?.[mod.moduleKey];
                    const activeCount = ACTIONS.filter((a) => mp?.[a]).length;

                    return (
                      <div
                        key={mod.moduleKey}
                        className="bg-card rounded-xl p-3.5 border border-border/70 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-foreground tracking-tight truncate">
                            {mod.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                            {activeCount} / 4
                          </span>
                        </div>

                        {/* Action Chips */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {ACTIONS.map((a) => {
                            const isGranted = !!mp?.[a];
                            return (
                              <div
                                key={a}
                                className={cn(
                                  "flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-colors text-center",
                                  isGranted
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-2xs font-black"
                                    : "bg-muted/30 text-muted-foreground/40 border-border/40 line-through select-none"
                                )}
                              >
                                {isGranted && (
                                  <Check className="w-2.5 h-2.5 shrink-0 stroke-[3]" />
                                )}
                                <span className="truncate">{a}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    No Module Access Granted
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    This role has no permissions configured across application modules.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Select Role to Preview Matrix
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose a role from the dropdown above to inspect and assign capabilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
