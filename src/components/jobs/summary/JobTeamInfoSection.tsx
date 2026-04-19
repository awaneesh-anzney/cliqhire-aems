"use client";

import { useState } from "react";
import { CollapsibleSection } from "@/components/clients/summary/collapsible-section";
import { DetailRow } from "@/components/clients/summary/detail-row";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobPositions, useJobTeam } from "@/hooks/useJobTeam";
import { DynamicMemberSelectionDialog } from "@/components/jobs/teams/DynamicMemberSelectionDialog";

interface JobTeamInfoSectionProps {
  jobDetails: any;
  handleUpdateField?: (field: string) => (value: string) => void;
  handleUpdateMultipleFields?: (fields: Record<string, any>) => void;
  canModify?: boolean;
}

/**
 * Displays team assignment in the Job Summary tab.
 * Reads from the new /api/jobs/:id/team endpoint via useJobTeam hook.
 * Positions are dynamic from /api/job-positions.
 */
export function JobTeamInfoSection({
  jobDetails,
  canModify,
}: JobTeamInfoSectionProps) {
  const jobId = jobDetails?._id;

  const { data: positions = [], isLoading: posLoading } = useJobPositions();
  const { team, isLoading: teamLoading, assignToPosition, getUsersForPosition, isAssigning } =
    useJobTeam({ jobId, enabled: !!jobId });

  const [editPosition, setEditPosition] = useState<{
    name: string;
    label: string;
    maxUsers: number | null;
    currentIds: string[];
  } | null>(null);

  const isLoading = posLoading || teamLoading;

  if (!jobId) return null;

  const handleAssign = async (memberIds: string[]) => {
    if (!editPosition) return;
    await assignToPosition(editPosition.name, memberIds);
    setEditPosition(null);
  };

  return (
    <CollapsibleSection title="Job Team Info">
      <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="text-sm font-medium text-gray-900">Team Assignment</h3>
          {isLoading && (
            <span className="text-xs text-gray-400 animate-pulse">Loading…</span>
          )}
        </div>

        <div className="space-y-3 pt-1">
          {isLoading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)
            : positions
                .filter((p) => p.isActive)
                .map((pos) => {
                  const users = getUsersForPosition(pos.name);
                  const displayValue =
                    users.length > 0
                      ? users
                          .map((u) => `${u.firstName} ${u.lastName}`.trim())
                          .join(", ")
                      : "Not assigned";

                  return (
                    <DetailRow
                      key={pos._id}
                      label={pos.label}
                      value={displayValue}
                      onUpdate={() => {}}
                      customEdit={
                        canModify
                          ? () =>
                              setEditPosition({
                                name: pos.name,
                                label: pos.label,
                                maxUsers: pos.maxUsers,
                                currentIds: users.map((u) => u._id),
                              })
                          : undefined
                      }
                      alwaysShowEdit={canModify}
                    />
                  );
                })}
        </div>
      </div>

      {editPosition && (
        <DynamicMemberSelectionDialog
          open={!!editPosition}
          onClose={() => setEditPosition(null)}
          title={`Assign ${editPosition.label}`}
          positionName={editPosition.name}
          maxUsers={editPosition.maxUsers}
          initialSelections={editPosition.currentIds}
          onSelect={handleAssign}
          isLoading={isAssigning}
        />
      )}
    </CollapsibleSection>
  );
}
