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
} from "lucide-react";
import { useJobPositions, useJobTeam } from "@/hooks/useJobTeam";
import { DynamicMemberSelectionDialog } from "./DynamicMemberSelectionDialog";
import { toast } from "sonner";
import type { PopulatedUser } from "@/types/job-team";

interface InternalTeamProps {
  jobId: string;
  jobData?: any; // kept for backward compat but team is now fetched fresh
  canModify?: boolean;
}

interface EditState {
  position: string;
  positionLabel: string;
  maxUsers: number | null;
  currentUserIds: string[];
}

export function InternalTeam({ jobId, canModify }: InternalTeamProps) {
  const [editState, setEditState] = useState<EditState | null>(null);

  // Fetch dynamic positions
  const { data: positions = [], isLoading: positionsLoading } = useJobPositions();

  // Fetch & mutate job team
  const {
    team,
    isLoading: teamLoading,
    isAssigning,
    isRemoving,
    assignToPosition,
    removeFromPosition,
    getUsersForPosition,
  } = useJobTeam({ jobId });

  const isLoading = positionsLoading || teamLoading;

  const handleOpenEdit = (
    position: string,
    positionLabel: string,
    maxUsers: number | null,
    currentUsers: PopulatedUser[]
  ) => {
    setEditState({
      position,
      positionLabel,
      maxUsers,
      currentUserIds: currentUsers.map((u) => u._id),
    });
  };

  const handleAssign = async (memberIds: string[]) => {
    if (!editState) return;
    await assignToPosition(editState.position, memberIds);
    setEditState(null);
  };

  const handleRemove = async (position: string, userId: string) => {
    await removeFromPosition(position, userId);
  };

  const positionColors: Record<string, string> = {
    hiringManager: "text-blue-600 bg-blue-50 border-blue-200",
    teamLead: "text-green-600 bg-green-50 border-green-200",
    recruiter: "text-purple-600 bg-purple-50 border-purple-200",
    headhunter: "text-orange-600 bg-orange-50 border-orange-200",
  };

  const getPositionColor = (positionName: string) =>
    positionColors[positionName] || "text-gray-600 bg-gray-50 border-gray-200";

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border px-4 py-4 h-[56vh] overflow-y-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Only show active positions
  const activePositions = positions.filter((p) => p.isActive);
  const hasAnyTeamMembers = team.some((t) => t.users.length > 0);

  return (
    <div className="bg-white rounded-lg border px-4 py-4 h-[56vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold">Internal Team</h2>
          {hasAnyTeamMembers && (
            <Badge variant="secondary" className="text-xs">
              {team.reduce((sum, t) => sum + t.users.length, 0)} assigned
            </Badge>
          )}
        </div>
      </div>

      {/* Position cards */}
      <div className="space-y-3">
        {activePositions.map((pos) => {
          const assignedUsers = getUsersForPosition(pos.name);
          const isFull = pos.maxUsers !== null && assignedUsers.length >= pos.maxUsers;
          const colorClass = getPositionColor(pos.name);

          return (
            <div key={pos._id} className="border rounded-lg p-4 space-y-2">
              {/* Position header */}
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

                {canModify && !isFull && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      handleOpenEdit(pos.name, pos.label, pos.maxUsers, assignedUsers)
                    }
                    disabled={isAssigning || isRemoving}
                  >
                    {isAssigning ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <UserPlus className="h-3 w-3 mr-1" />
                    )}
                    {assignedUsers.length === 0 ? "Assign" : "Add"}
                  </Button>
                )}

                {canModify && isFull && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      handleOpenEdit(pos.name, pos.label, pos.maxUsers, assignedUsers)
                    }
                    disabled={isAssigning || isRemoving}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                )}
              </div>

              {/* Assigned members */}
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
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-gray-400 truncate">{user.department}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {canModify && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemove(pos.name, user._id)}
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

        {activePositions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            <Users className="h-10 w-10 mb-2 opacity-50" />
            No position types configured. Ask admin to set up job positions.
          </div>
        )}
      </div>

      {/* Member selection dialog */}
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
