"use client";

import { useState } from "react";
import { CollapsibleSection } from "@/components/clients/summary/collapsible-section";
import { DetailRow } from "@/components/clients/summary/detail-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobPositions, useJobTeam } from "@/hooks/useJobTeam";
import { DynamicMemberSelectionDialog } from "@/components/jobs/teams/DynamicMemberSelectionDialog";
import type { PopulatedUser } from "@/types/job-team";

// Default positions when API returns empty / fails
const DEFAULT_POSITIONS = [
  { _id: "hiringManager", name: "hiringManager", label: "Hiring Manager", maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 1, isActive: true },
  { _id: "teamLead",      name: "teamLead",      label: "Team Lead",      maxUsers: 1 as number | null, canViewPipeline: true, canModifyPipeline: true, order: 2, isActive: true },
  { _id: "recruiter",     name: "recruiter",     label: "Recruiter",      maxUsers: null,               canViewPipeline: true, canModifyPipeline: true, order: 3, isActive: true },
  { _id: "headhunter",    name: "headhunter",    label: "Head Hunter",    maxUsers: null,               canViewPipeline: true, canModifyPipeline: false, order: 4, isActive: true },
];

interface JobTeamInfoSectionProps {
  jobDetails: any;
  handleUpdateField?: (field: string) => (value: string) => void;
  handleUpdateMultipleFields?: (fields: Record<string, any>) => void;
  canModify?: boolean;
}

export function JobTeamInfoSection({ jobDetails, canModify }: JobTeamInfoSectionProps) {
  const jobId = jobDetails?._id;

  const { data: apiPositions, isLoading: posLoading } = useJobPositions();
  const {
    isLoading: teamLoading,
    assignToPosition,
    getUsersForPosition,
    isAssigning,
  } = useJobTeam({ jobId, enabled: !!jobId });

  const [editPosition, setEditPosition] = useState<{
    name: string;
    label: string;
    maxUsers: number | null;
    currentIds: string[];
  } | null>(null);

  const positions =
    apiPositions && apiPositions.length > 0
      ? apiPositions.filter((p) => p.isActive)
      : DEFAULT_POSITIONS;

  const isLoading = posLoading || teamLoading;

  // Get users with fallback to jobData.jobTeamMembers
  const getUsersForPos = (positionName: string): PopulatedUser[] => {
    const liveUsers = getUsersForPosition(positionName);
    if (liveUsers.length > 0) return liveUsers;

    if (jobDetails?.jobTeamMembers && Array.isArray(jobDetails.jobTeamMembers)) {
      const slot = jobDetails.jobTeamMembers.find((s: any) => s.position === positionName);
      if (slot?.users && Array.isArray(slot.users)) {
        return slot.users.map((u: any) => ({
          _id: u._id || u.id || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          teamRole: u.teamRole || "",
          status: u.status || "Active",
          department: u.department || "",
          phone: u.phone || "",
        }));
      }
    }
    return [];
  };

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
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)
            : positions.map((pos) => {
                const users = getUsersForPos(pos.name);
                const displayValue =
                  users.length > 0
                    ? users.map((u) => `${u.firstName} ${u.lastName}`.trim()).join(", ")
                    : "Not assigned";

                return (
                  <DetailRow
                    key={pos._id || pos.name}
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
