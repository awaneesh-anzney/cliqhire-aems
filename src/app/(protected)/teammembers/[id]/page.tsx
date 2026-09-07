"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Shield,
  Edit2,
  Save,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  getTeamMemberById,
  updateTeamMemberStatus,
  updateTeamMember,
} from "@/services/teamMembersService";
import { roleService, Role } from "@/services/roleService";
import { TeamMemberStatus } from "@/types/teamMember";
import { MemberProfileCard } from "@/components/teamMembers/MemberProfileCard";
import { MemberAccessMatrix } from "@/components/teamMembers/MemberAccessMatrix";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamMemberId = params?.id as string;

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [fullRole, setFullRole] = useState<Role | null>(null);
  const [loadingRoleDetails, setLoadingRoleDetails] = useState(false);

  // Edit variables
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "SA",
    location: "",
    experience: "",
  });

  // Queries
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["teamMember", teamMemberId],
    queryFn: () => getTeamMemberById(teamMemberId),
    enabled: !!teamMemberId,
  });

  const { data: rolesRes, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  });
  const roles = rolesRes?.data ?? [];

  // Mutations
  const assignRoleMutation = useMutation({
    mutationFn: (roleId: string) =>
      roleService.assignRoleToUser(roleId, teamMemberId),
    onSuccess: (data) => {
      toast.success(data.message || "Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to assign role");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeamMemberStatus }) =>
      updateTeamMemberStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      toast.success("Status updated");
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: any) =>
      updateTeamMember({ _id: teamMemberId, ...data }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error.message ??
          "Failed to update profile"
      );
    },
  });

  // Match initial role
  useEffect(() => {
    if (user && roles.length > 0 && !selectedRoleId) {
      if (user.roleId) {
        setSelectedRoleId(user.roleId);
      } else if (user.teamRole || user.role) {
        const targetName = (user.teamRole || user.role || "")
          .toLowerCase()
          .replace(/_/g, " ");
        const matchedRole = roles.find(
          (r) =>
            r.name.toLowerCase() === targetName ||
            r.name.toLowerCase().replace(/_/g, " ") === targetName ||
            (r.id && r.id === user.roleId)
        );

        if (matchedRole && (matchedRole._id || matchedRole.id)) {
          setSelectedRoleId((matchedRole._id || matchedRole.id) as string);
        }
      }
    }
  }, [user, roles, selectedRoleId]);

  // Fetch full role details when selected role changes
  useEffect(() => {
    if (selectedRoleId) {
      setLoadingRoleDetails(true);
      roleService
        .getRoleById(selectedRoleId)
        .then((res) => {
          if (res.success && res.data) {
            setFullRole(res.data);
          }
          setLoadingRoleDetails(false);
        })
        .catch(() => setLoadingRoleDetails(false));
    } else {
      setFullRole(null);
    }
  }, [selectedRoleId]);

  const handleSaveRole = () => {
    if (!selectedRoleId) {
      toast.error("Please select a role first");
      return;
    }
    assignRoleMutation.mutate(selectedRoleId);
  };

  const handleStatusChange = async (id: string, newStatus: TeamMemberStatus) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const handleEditToggle = () => {
    if (!isEditing && user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "SA",
        location: user.location || "",
        experience: user.experience || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditSubmit = () => {
    if (
      !editForm.firstName.trim() ||
      !editForm.lastName.trim() ||
      !editForm.email.trim()
    ) {
      toast.error("First Name, Last Name and Email are required");
      return;
    }
    editMutation.mutate(editForm);
  };

  if (isLoadingUser) {
    return (
      <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2 select-none">
        <div className="flex-shrink-0 bg-card rounded-2xl border border-border/80 shadow-xs p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
            <div className="h-5 w-40 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          <div className="lg:w-80 xl:w-96 bg-card rounded-2xl border border-border/80 p-6 animate-pulse" />
          <div className="flex-1 bg-card rounded-2xl border border-border/80 p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col items-center justify-center p-6 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Team Member Not Found
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            The profile you are trying to view does not exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => router.push("/teammembers")}
          variant="outline"
          size="sm"
          className="mt-2 rounded-xl text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Team Members
        </Button>
      </div>
    );
  }

  const selectedRole =
    fullRole &&
    (fullRole._id === selectedRoleId || fullRole.id === selectedRoleId)
      ? fullRole
      : null;

  return (
    <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2 select-none">
      {/* Top Command Bar */}
      <div className="flex-shrink-0 bg-card rounded-2xl border border-border/80 shadow-xs p-2.5 sm:px-3.5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Back button & Member Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/teammembers")}
            className="h-8.5 w-8.5 p-0 rounded-xl border-border/70 hover:bg-muted/60 shrink-0"
            title="Back to Team Members"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                {isEditing
                  ? "Editing Profile"
                  : `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "Member Profile"}
              </h1>
              {user.teamMemberId && (
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 uppercase shrink-0">
                  #{user.teamMemberId}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              {user.email || "No email"} • {user.teamRole || "Team Member"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Badge */}
          <div className="scale-90 origin-right">
            <TeamMemberStatusBadge
              id={user._id}
              status={user.status}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Edit / Save / Cancel Toggle */}
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditToggle}
              className="h-8.5 px-3 rounded-xl border-border/70 text-xs font-semibold gap-1.5 hover:bg-muted/60"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditToggle}
                className="h-8.5 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditSubmit}
                disabled={editMutation.isPending}
                className="h-8.5 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Workstation Body */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 overflow-hidden">
        {/* Left Column: Identity & Contact Profile Card */}
        <div className="lg:w-80 xl:w-96 shrink-0 h-full overflow-y-auto custom-scrollbar">
          <MemberProfileCard
            member={user}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Right Column: Role Authority & Capability Matrix */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar">
          <MemberAccessMatrix
            currentRoleName={user.teamRole || user.role || "Unassigned"}
            roles={roles}
            selectedRoleId={selectedRoleId}
            setSelectedRoleId={setSelectedRoleId}
            selectedRole={selectedRole}
            loadingRoleDetails={loadingRoleDetails}
            isLoadingRoles={isLoadingRoles}
            isAssigning={assignRoleMutation.isPending}
            onAssignRole={handleSaveRole}
            userRoleId={user.roleId}
          />
        </div>
      </div>
    </div>
  );
}
