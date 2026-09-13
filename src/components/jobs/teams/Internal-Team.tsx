"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useJobPositions, useJobTeam } from "@/hooks/useJobTeam";
import { DynamicMemberSelectionDialog } from "./DynamicMemberSelectionDialog";
import type { PopulatedUser } from "@/types/job-team";

interface InternalTeamProps {
  jobId: string;
  jobData?: any;
  canModify?: boolean;
}

interface EditState {
  position: string;
  positionLabel: string;
  maxUsers: number | null;
  currentUserIds: string[];
}

const DEFAULT_POSITIONS = [
  { _id: "hiringManager", name: "hiringManager", label: "Hiring Manager", maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 1, isActive: true },
  { _id: "teamLead",      name: "teamLead",      label: "Team Lead",      maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 2, isActive: true },
  { _id: "recruiter",     name: "recruiter",     label: "Recruiter",      maxUsers: null,               canViewPipeline: true, canModifyPipeline: true, order: 3, isActive: true },
  { _id: "headhunter",    name: "headhunter",    label: "Head Hunter",    maxUsers: null,               canViewPipeline: true, canModifyPipeline: false, order: 4, isActive: true },
];

const POSITION_COLORS: Record<string, string> = {
  hiringManager: "text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20",
  teamLead:      "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  recruiter:     "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20",
  headhunter:    "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20",
};

export function InternalTeam({ jobId, jobData, canModify }: InternalTeamProps) {
  const [editState, setEditState] = useState<EditState | null>(null);

  const {
    data: apiPositions,
    isLoading: positionsLoading,
    isError: positionsError,
    refetch: refetchPositions,
  } = useJobPositions();

  const {
    isLoading: teamLoading,
    isError: teamError,
    isAssigning,
    isRemoving,
    assignToPosition,
    removeFromPosition,
    getUsersForPosition,
    refetch: refetchTeam,
  } = useJobTeam({ jobId, enabled: !!jobId });

  const positions =
    apiPositions && apiPositions.length > 0
      ? apiPositions.filter((p) => p.isActive)
      : DEFAULT_POSITIONS;

  const isLoading = positionsLoading || teamLoading;

  const getUsersForPos = (positionName: string): PopulatedUser[] => {
    const liveUsers = getUsersForPosition(positionName);
    if (liveUsers.length > 0) return liveUsers;

    if (jobData?.jobTeamMembers && Array.isArray(jobData.jobTeamMembers)) {
      const slot = jobData.jobTeamMembers.find(
        (s: any) => s.position === positionName
      );
      if (slot?.users && Array.isArray(slot.users)) {
        return slot.users.map((u: any) => ({
          _id:        u._id || u.id || "",
          firstName:  u.firstName || "",
          lastName:   u.lastName  || "",
          email:      u.email     || "",
          teamRole:   u.teamRole  || "",
          status:     u.status    || "Active",
          department: u.department || "",
          phone:      u.phone     || "",
        }));
      }
    }

    return [];
  };

  const handleAssign = async (memberIds: string[]) => {
    if (!editState) return;
    await assignToPosition(editState.position, memberIds);
    setEditState(null);
  };

  const totalAssigned = positions.reduce(
    (acc, pos) => acc + getUsersForPos(pos.name).length,
    0
  );

  return (
    <div className="bg-card rounded-xl border border-border/70 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60 bg-muted/25">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Internal Team</h3>
            {totalAssigned > 0 && (
              <p className="text-[10px] font-medium text-muted-foreground">
                {totalAssigned} member{totalAssigned !== 1 ? "s" : ""} assigned
              </p>
            )}
          </div>
        </div>

        {teamError && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:bg-destructive/10"
            onClick={() => refetchTeam()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {positionsError && (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Using default positions.{" "}
              <button className="underline hover:text-amber-800 ml-1 font-semibold" onClick={() => refetchPositions()}>
                Retry sync
              </button>
            </span>
          </div>
        )}

        {/* Position Cards */}
        <div className="space-y-3">
          {positions.map((pos) => {
            const assignedUsers = getUsersForPos(pos.name);
            const isFull =
              pos.maxUsers !== null && assignedUsers.length >= pos.maxUsers;
            const colorClass =
              POSITION_COLORS[pos.name] || "text-foreground bg-muted border-border/50";

            return (
              <div key={pos._id || pos.name} className="space-y-1.5">
                {/* Position Header */}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
                      {pos.label}
                    </span>
                    {pos.maxUsers !== null && (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/40 font-medium">
                        {assignedUsers.length} / {pos.maxUsers}
                      </span>
                    )}
                  </div>

                  {canModify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                      onClick={() =>
                        setEditState({
                          position:      pos.name,
                          positionLabel: pos.label,
                          maxUsers:      pos.maxUsers,
                          currentUserIds: assignedUsers.map((u) => u._id),
                        })
                      }
                      disabled={isAssigning || isRemoving}
                    >
                      {isAssigning ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : assignedUsers.length === 0 ? (
                        <UserPlus className="h-3 w-3 mr-1" />
                      ) : (
                        <Pencil className="h-3 w-3 mr-1" />
                      )}
                      {assignedUsers.length === 0
                        ? "Assign"
                        : isFull
                        ? "Change"
                        : "Manage"}
                    </Button>
                  )}
                </div>

                {/* Assigned Member Cards */}
                {assignedUsers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {assignedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between bg-muted/15 border border-border/50 rounded-lg p-2 hover:border-border/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate leading-tight">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                              <span className="truncate max-w-[130px]">{user.email}</span>
                              {user.department && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{user.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {canModify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                              onClick={() => removeFromPosition(pos.name, user._id)}
                              disabled={isRemoving}
                              title="Remove member"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/15 border border-dashed border-border/60 rounded-lg py-2 justify-center">
                    <AlertCircle className="h-3 w-3" />
                    <span>No {pos.label} assigned yet</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Member Selection Dialog */}
      {editState && (
        <DynamicMemberSelectionDialog
          open={!!editState}
          onClose={() => setEditState(null)}
          title={`Assign ${editState.positionLabel}`}
          positionName={editState.position}
          maxUsers={editState.maxUsers}
          initialSelections={editState.currentUserIds}
          onSelect={handleAssign}
          isLoading={isAssigning}
        />
      )}
    </div>
  );
}