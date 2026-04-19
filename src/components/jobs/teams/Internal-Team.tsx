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
    <div className="bg-white rounded-lg border px-4 py-4 h-[56vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold">Internal Team</h2>
          {totalAssigned > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalAssigned} assigned
            </Badge>
          )}
        </div>
        {teamError && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-500"
            onClick={() => refetchTeam()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>

      {/* Soft warning if positions API failed (defaults are being used) */}
      {positionsError && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>
            Could not load positions from server — using defaults.{" "}
            <button className="underline" onClick={() => refetchPositions()}>
              Retry
            </button>
          </span>
        </div>
      )}

      {/* Position cards */}
      <div className="space-y-3">
        {positions.map((pos) => {
          const assignedUsers = getUsersForPos(pos.name);
          const isFull =
            pos.maxUsers !== null && assignedUsers.length >= pos.maxUsers;
          const colorClass =
            POSITION_COLORS[pos.name] || "text-gray-700 bg-gray-50 border-gray-200";

          return (
            <div
              key={pos._id || pos.name}
              className="border rounded-lg p-4 space-y-2"
            >
              {/* Row: label + button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${colorClass}`}
                  >
                    {pos.label}
                  </span>
                  {pos.maxUsers !== null && (
                    <span className="text-xs text-gray-400">
                      {assignedUsers.length}/{pos.maxUsers}
                    </span>
                  )}
                </div>

                {canModify && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
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
                      : "Edit"}
                  </Button>
                )}
              </div>

              {/* Assigned member rows */}
              {assignedUsers.length > 0 ? (
                <div className="space-y-2">
                  {assignedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        {user.department && (
                          <p className="text-xs text-gray-400 truncate">
                            {user.department}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {canModify && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                            onClick={() =>
                              removeFromPosition(pos.name, user._id)
                            }
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic py-1">
                  <AlertCircle className="h-3 w-3" />
                  Not assigned
                </div>
              )}
            </div>
          );
        })}
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
