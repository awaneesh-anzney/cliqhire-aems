"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

// Default positions — used when /api/job-positions returns empty or fails
const DEFAULT_POSITIONS = [
  { _id: "hiringManager", name: "hiringManager", label: "Hiring Manager", maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 1, isActive: true },
  { _id: "teamLead",      name: "teamLead",      label: "Team Lead",      maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 2, isActive: true },
  { _id: "recruiter",     name: "recruiter",     label: "Recruiter",      maxUsers: null,               canViewPipeline: true, canModifyPipeline: true, order: 3, isActive: true },
  { _id: "headhunter",    name: "headhunter",    label: "Head Hunter",    maxUsers: null,               canViewPipeline: true, canModifyPipeline: false, order: 4, isActive: true },
];

const POSITION_COLORS: Record<string, string> = {
  hiringManager: "text-blue-700 bg-blue-50 border-blue-200",
  teamLead:      "text-green-700 bg-green-50 border-green-200",
  recruiter:     "text-purple-700 bg-purple-50 border-purple-200",
  headhunter:    "text-orange-700 bg-orange-50 border-orange-200",
};

export function InternalTeam({ jobId, jobData, canModify }: InternalTeamProps) {
  const [editState, setEditState] = useState<EditState | null>(null);

  // Fetch dynamic positions from /api/job-positions
  const {
    data: apiPositions,
    isLoading: positionsLoading,
    isError: positionsError,
    refetch: refetchPositions,
  } = useJobPositions();

  // Fetch & mutate team from /api/jobs/:id/team
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

  // Use API positions if they returned data, else use defaults
  const positions =
    apiPositions && apiPositions.length > 0
      ? apiPositions.filter((p) => p.isActive)
      : DEFAULT_POSITIONS;

  const isLoading = positionsLoading || teamLoading;

  /**
   * Get users for a position.
   * Priority:
   *   1. Live data from useJobTeam hook (/api/jobs/:id/team)
   *   2. Fallback from jobData.jobTeamMembers (populated by getJobById)
   */
  const getUsersForPos = (positionName: string): PopulatedUser[] => {
    const liveUsers = getUsersForPosition(positionName);
    if (liveUsers.length > 0) return liveUsers;

    // Fallback: parse from jobData already in memory
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border px-4 py-4 h-[56vh] overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const totalAssigned = positions.reduce(
    (sum, p) => sum + getUsersForPos(p.name).length,
    0
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Internal Team</h2>
            {totalAssigned > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {totalAssigned} Members Assigned
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {teamError && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => refetchTeam()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {/* Soft warning if positions API failed */}
        {positionsError && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Using default positions — server sync failed.{" "}
              <button className="underline hover:text-amber-700 ml-1" onClick={() => refetchPositions()}>
                Retry sync
              </button>
            </span>
          </div>
        )}

        {/* Position cards */}
        <div className="space-y-6">
          {positions.map((pos) => {
            const assignedUsers = getUsersForPos(pos.name);
            const isFull =
              pos.maxUsers !== null && assignedUsers.length >= pos.maxUsers;
            const colorClass =
              POSITION_COLORS[pos.name] || "text-slate-700 bg-slate-50 border-slate-200";

            return (
              <div
                key={pos._id || pos.name}
                className="space-y-3"
              >
                {/* Row: label + button */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.05em] px-2.5 py-1 rounded-md border ${colorClass}`}
                    >
                      {pos.label}
                    </span>
                    {pos.maxUsers !== null && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {assignedUsers.length} / {pos.maxUsers}
                      </span>
                    )}
                  </div>

                  {canModify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold uppercase text-brand hover:bg-brand/10 transition-colors"
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
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      ) : assignedUsers.length === 0 ? (
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      ) : (
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {assignedUsers.length === 0
                        ? "Assign"
                        : isFull
                        ? "Change"
                        : "Manage"}
                    </Button>
                  )}
                </div>

                {/* Assigned member rows */}
                {assignedUsers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {assignedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:border-slate-200 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                {user.email}
                              </p>
                              {user.department && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <p className="text-[10px] text-brand/70 font-medium truncate">
                                    {user.department}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {canModify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                removeFromPosition(pos.name, user._id)
                              }
                              disabled={isRemoving}
                            >
                              {isRemoving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl py-4 justify-center">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No {pos.label} assigned yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignment dialog */}
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
