"use client";

import { useState, startTransition } from "react";
import { CollapsibleSection } from "@/components/clients/summary/collapsible-section";
import { DetailRow } from "@/components/clients/summary/detail-row";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TeamSelectionDialog } from "./team-selection-dialog";

interface CandidateTeamInfoSectionProps {
  candidateDetails: any;
  handleUpdateField: (field: string) => (value: string) => void;
}

export function CandidateTeamInfoSection({ candidateDetails, handleUpdateField }: CandidateTeamInfoSectionProps) {
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  // Helper function to parse team assignment data
  const getTeamAssignmentData = () => {
    try {
      if (candidateDetails.teamAssignment) {
        return JSON.parse(candidateDetails.teamAssignment);
      }
    } catch (error) {
      console.warn("Failed to parse team assignment data:", error);
    }
    return null;
  };

  const teamAssignmentData = getTeamAssignmentData();

  // Get current team member details (prefer JSON data, fallback to individual fields)
  const currentRecruitmentManager = teamAssignmentData?.recruitmentManager
    ? teamAssignmentData.recruitmentManager
    : candidateDetails.recruitmentManagerId
      ? { name: candidateDetails.recruitmentManager || "Not assigned" }
      : null;

  const currentTeamLead = teamAssignmentData?.teamLead
    ? teamAssignmentData.teamLead
    : candidateDetails.teamLeadId
      ? { name: candidateDetails.teamLead || "Not assigned" }
      : null;

  const currentRecruiter = teamAssignmentData?.recruiter
    ? teamAssignmentData.recruiter
    : candidateDetails.recruiterId
      ? { name: candidateDetails.recruiter || "Not assigned" }
      : null;

  const handleTeamSelectionSave = (selections: {
    recruitmentManager?: any;
    teamLead?: any;
    recruiter?: any;
  }) => {
    const getFullName = (m: any) => {
      if (!m) return "";
      return `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.name || m.email || "";
    };

    // Create a comprehensive team data object
    const teamData = {
      recruitmentManager: selections.recruitmentManager
        ? {
            id: selections.recruitmentManager._id || selections.recruitmentManager.id,
            name: getFullName(selections.recruitmentManager),
            email: selections.recruitmentManager.email,
            phone: selections.recruitmentManager.phone,
            teamSize: selections.recruitmentManager.teamSize,
          }
        : null,
      teamLead: selections.teamLead
        ? {
            id: selections.teamLead._id || selections.teamLead.id,
            name: getFullName(selections.teamLead),
            email: selections.teamLead.email,
            phone: selections.teamLead.phone,
            teamSize: selections.teamLead.teamSize,
            managerId: selections.teamLead.manager,
          }
        : null,
      recruiter: selections.recruiter
        ? {
            id: selections.recruiter._id || selections.recruiter.id,
            name: getFullName(selections.recruiter),
            email: selections.recruiter.email,
            phone: selections.recruiter.phone,
            teamLeadId: selections.recruiter.manager,
          }
        : null,
      lastUpdated: new Date().toISOString(),
    };

    // Primary update: Store complete team data as JSON (single API call)
    const teamDataString = JSON.stringify(teamData);
    handleUpdateField("teamAssignment")(teamDataString);

    // Fallback: Update individual fields for backward compatibility (batched)
    startTransition(() => {
      // Update IDs for relationships
      handleUpdateField("recruitmentManagerId")(teamData.recruitmentManager?.id || "");
      handleUpdateField("teamLeadId")(teamData.teamLead?.id || "");
      handleUpdateField("recruiterId")(teamData.recruiter?.id || "");

      // Update names for display
      handleUpdateField("recruitmentManager")(teamData.recruitmentManager?.name || "");
      handleUpdateField("teamLead")(teamData.teamLead?.name || "");
      handleUpdateField("recruiter")(teamData.recruiter?.name || "");
    });
  };

  return (
    <CollapsibleSection title="Candidate Team Info">
      <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
        {/* Section Header with Edit Button */}
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="text-sm font-medium text-gray-900">Team Assignment</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setIsTeamDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Team
          </Button>
        </div>

        {/* Team Details - Read Only */}
        <div className="space-y-3 pt-1">
          <DetailRow
            label="Recruitment Manager"
            value={currentRecruitmentManager?.name || candidateDetails.recruitmentManager || "Not assigned"}
            onUpdate={() => {}} // No edit functionality
            disableInternalEdit={true} // Disable edit button
          />
          <DetailRow
            label="Team Lead"
            value={currentTeamLead?.name || candidateDetails.teamLead || "Not assigned"}
            onUpdate={() => {}} // No edit functionality
            disableInternalEdit={true} // Disable edit button
          />
          <DetailRow
            label="Recruiter"
            value={currentRecruiter?.name || candidateDetails.recruiter || "Not assigned"}
            onUpdate={() => {}} // No edit functionality
            disableInternalEdit={true} // Disable edit button
          />
        </div>
      </div>

      <TeamSelectionDialog
        open={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        onSave={handleTeamSelectionSave}
        initialSelections={{
          recruitmentManagerId: currentRecruitmentManager?.id || currentRecruitmentManager?._id || candidateDetails.recruitmentManagerId,
          teamLeadId: currentTeamLead?.id || currentTeamLead?._id || candidateDetails.teamLeadId,
          recruiterId: currentRecruiter?.id || currentRecruiter?._id || candidateDetails.recruiterId,
        }}
      />
    </CollapsibleSection>
  );
} 