"use client";

import React from "react";
import {
  Users,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Target,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  MinusCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/types/teamMember";
import { Role } from "@/services/roleService";

interface TeamMemberStatsBarProps {
  totalCount: number;
  teamMembers: TeamMember[];
  roles: Role[];
  selectedRoleTab: string;
  onSelectRoleTab: (roleIdOrAll: string) => void;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  className?: string;
}

const getRoleIcon = (roleName: string = "") => {
  const r = roleName.toLowerCase();
  if (r.includes("admin")) return ShieldCheck;
  if (r.includes("manager")) return Briefcase;
  if (r.includes("lead")) return Award;
  if (r.includes("recruiter")) return UserCheck;
  if (r.includes("head") || r.includes("hunter")) return Target;
  if (r.includes("sale")) return Sparkles;
  return Users;
};

export const TeamMemberStatsBar: React.FC<TeamMemberStatsBarProps> = ({
  totalCount,
  teamMembers = [],
  roles = [],
  selectedRoleTab = "all",
  onSelectRoleTab,
  selectedStatus = "All",
  onSelectStatus,
  className,
}) => {
  // Count by role
  const getCountByRole = (roleItem: Role) => {
    return teamMembers.filter((m) => {
      const roleId = roleItem._id || roleItem.id;
      if (m.roleId && (m.roleId === roleId || m.roleId === roleItem._id)) return true;
      return (m.teamRole || "").toLowerCase() === roleItem.name.toLowerCase();
    }).length;
  };

  // Status counts
  const statusCounts = React.useMemo(() => {
    let active = 0;
    let inactive = 0;
    let onLeave = 0;
    let terminated = 0;

    teamMembers.forEach((m) => {
      const s = (m.status || "").toLowerCase();
      if (s === "active") active++;
      else if (s === "inactive") inactive++;
      else if (s === "on leave") onLeave++;
      else if (s === "terminated") terminated++;
    });

    return { active, inactive, onLeave, terminated };
  }, [teamMembers]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 select-none",
        className
      )}
    >
      {/* All Members */}
      <button
        type="button"
        onClick={() => onSelectRoleTab("all")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
          selectedRoleTab === "all"
            ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
            : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
        )}
      >
        <Users className="w-3.5 h-3.5 shrink-0 text-primary" />
        <span className="text-[11px] font-medium">All Members</span>
        <span
          className={cn(
            "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
            selectedRoleTab === "all"
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {totalCount}
        </span>
      </button>

      {/* Dynamic Roles */}
      {roles.map((role) => {
        const roleId = role._id || role.id || role.name;
        const count = getCountByRole(role);
        const isSelected = selectedRoleTab === roleId;
        const RoleIcon = getRoleIcon(role.name);

        return (
          <button
            key={roleId}
            type="button"
            onClick={() => onSelectRoleTab(roleId)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              isSelected
                ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
            )}
          >
            <RoleIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
            <span className="text-[11px] font-medium">{role.name}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
                isSelected
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="h-4 w-px bg-border/80 shrink-0 mx-1" />

      {/* Active Status Pill */}
      {onSelectStatus && (
        <>
          <button
            type="button"
            onClick={() => onSelectStatus(selectedStatus === "Active" ? "All" : "Active")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              selectedStatus === "Active"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-medium">Active</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              {statusCounts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectStatus(selectedStatus === "Inactive" ? "All" : "Inactive")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
              selectedStatus === "Inactive"
                ? "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400 shadow-xs"
                : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <MinusCircle className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] font-medium">Inactive</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              {statusCounts.inactive}
            </span>
          </button>

          {statusCounts.onLeave > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatus(selectedStatus === "On Leave" ? "All" : "On Leave")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0",
                selectedStatus === "On Leave"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] font-medium">On Leave</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                {statusCounts.onLeave}
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
