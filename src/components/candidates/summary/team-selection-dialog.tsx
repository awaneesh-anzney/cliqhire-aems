"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getTeamMembers } from "@/services/teamMembersService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TeamMember } from "@/types/teamMember";

// Since we are removing hardcoded data, we use TeamMember type from our types
export type RecruitmentManager = TeamMember;
export type TeamLead = TeamMember;
export type Recruiter = TeamMember;

interface TeamSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (selections: {
    recruitmentManager?: RecruitmentManager;
    teamLead?: TeamLead;
    recruiter?: Recruiter;
  }) => void;
  initialSelections?: {
    recruitmentManagerId?: string;
    teamLeadId?: string;
    recruiterId?: string;
  };
}

export function TeamSelectionDialog({
  open,
  onClose,
  onSave,
  initialSelections,
}: TeamSelectionDialogProps) {
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState<string>("");
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>("");

  // Fetch all team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ["teamMembersForSelection"],
    queryFn: () => getTeamMembers(),
    enabled: open,
  });

  const allMembers = useMemo(() => teamData?.teamMembers || [], [teamData]);

  // Filter members by role
  const recruitmentManagers = useMemo(() => 
    allMembers.filter(m => m.teamRole === "ADMIN" || m.teamRole === "HIRING_MANAGER"),
    [allMembers]
  );

  const teamLeads = useMemo(() => 
    allMembers.filter(m => m.teamRole === "TEAM_LEAD"),
    [allMembers]
  );

  const recruiters = useMemo(() => 
    allMembers.filter(m => m.teamRole === "RECRUITER"),
    [allMembers]
  );

  // Filter team leads by selected manager if relationships exist
  const availableTeamLeads = useMemo(() => {
    if (!selectedManagerId) return [];
    // If we have parent relationship in data, use it; otherwise show all team leads
    const filtered = teamLeads.filter(tl => tl.manager === selectedManagerId);
    return filtered.length > 0 ? filtered : teamLeads;
  }, [selectedManagerId, teamLeads]);

  // Filter recruiters by selected team lead if relationships exist
  const availableRecruiters = useMemo(() => {
    if (!selectedTeamLeadId) return [];
    const filtered = recruiters.filter(r => r.manager === selectedTeamLeadId);
    return filtered.length > 0 ? filtered : recruiters;
  }, [selectedTeamLeadId, recruiters]);

  // Initialize with current selections
  useEffect(() => {
    if (initialSelections && open && !isLoading) {
      setSelectedManagerId(initialSelections.recruitmentManagerId || "");
      setSelectedTeamLeadId(initialSelections.teamLeadId || "");
      setSelectedRecruiterId(initialSelections.recruiterId || "");
    }
  }, [initialSelections, open, isLoading]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (selectedManagerId && availableTeamLeads.length > 0) {
      const isValidTeamLead = availableTeamLeads.some((tl) => tl._id === selectedTeamLeadId);
      if (!isValidTeamLead && selectedTeamLeadId) {
        setSelectedTeamLeadId("");
        setSelectedRecruiterId("");
      }
    }
  }, [selectedManagerId, availableTeamLeads]);

  useEffect(() => {
    if (selectedTeamLeadId && availableRecruiters.length > 0) {
      const isValidRecruiter = availableRecruiters.some((r) => r._id === selectedRecruiterId);
      if (!isValidRecruiter && selectedRecruiterId) {
        setSelectedRecruiterId("");
      }
    }
  }, [selectedTeamLeadId, availableRecruiters]);

  const handleSave = () => {
    const selections = {
      recruitmentManager: allMembers.find(m => m._id === selectedManagerId),
      teamLead: allMembers.find(m => m._id === selectedTeamLeadId),
      recruiter: allMembers.find(m => m._id === selectedRecruiterId),
    };

    onSave(selections);
    onClose();
  };

  const handleCancel = () => {
    if (initialSelections) {
      setSelectedManagerId(initialSelections.recruitmentManagerId || "");
      setSelectedTeamLeadId(initialSelections.teamLeadId || "");
      setSelectedRecruiterId(initialSelections.recruiterId || "");
    } else {
      setSelectedManagerId("");
      setSelectedTeamLeadId("");
      setSelectedRecruiterId("");
    }
    onClose();
  };

  const getMemberName = (m: TeamMember) => `${m.firstName} ${m.lastName}`.trim() || m.email;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Candidate Team Assignment</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Loading team members...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Recruitment Manager Selection */}
            <div className="space-y-2">
              <Label htmlFor="recruitment-manager">Recruitment Manager</Label>
              <Select
                value={selectedManagerId}
                onValueChange={(value) => setSelectedManagerId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Recruitment Manager" />
                </SelectTrigger>
                <SelectContent>
                  {recruitmentManagers.map((manager) => (
                    <SelectItem key={manager._id} value={manager._id}>
                      {getMemberName(manager)}
                    </SelectItem>
                  ))}
                  {recruitmentManagers.length === 0 && (
                    <div className="p-2 text-xs text-muted-foreground">No managers found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Team Lead Selection */}
            <div className="space-y-2">
              <Label htmlFor="team-lead">Team Lead</Label>
              <Select
                value={selectedTeamLeadId}
                onValueChange={(value) => setSelectedTeamLeadId(value)}
                disabled={!selectedManagerId}
              >
                <SelectTrigger className={!selectedManagerId ? "opacity-50" : ""}>
                  <SelectValue
                    placeholder={
                      !selectedManagerId ? "Select a Recruitment Manager first" : "Select a Team Lead"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTeamLeads.map((teamLead) => (
                    <SelectItem key={teamLead._id} value={teamLead._id}>
                      {getMemberName(teamLead)}
                    </SelectItem>
                  ))}
                  {availableTeamLeads.length === 0 && selectedManagerId && (
                    <div className="p-2 text-xs text-muted-foreground">No team leads found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Recruiter Selection */}
            <div className="space-y-2">
              <Label htmlFor="recruiter">Recruiter</Label>
              <Select
                value={selectedRecruiterId}
                onValueChange={(value) => setSelectedRecruiterId(value)}
                disabled={!selectedTeamLeadId}
              >
                <SelectTrigger className={!selectedTeamLeadId ? "opacity-50" : ""}>
                  <SelectValue
                    placeholder={
                      !selectedTeamLeadId ? "Select a Team Lead first" : "Select a Recruiter"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableRecruiters.map((recruiter) => (
                    <SelectItem key={recruiter._id} value={recruiter._id}>
                      {getMemberName(recruiter)}
                    </SelectItem>
                  ))}
                  {availableRecruiters.length === 0 && selectedTeamLeadId && (
                    <div className="p-2 text-xs text-muted-foreground">No recruiters found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

