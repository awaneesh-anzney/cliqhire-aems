"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2, Users, UserCheck, UserCog, Crown, Eye, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
import { RegisterUserDialog } from "@/components/teamMembers/register-user-dialog";
import { DeleteTeamMemberDialog } from "@/components/teamMembers/delete-team-member-dialog";
import { getTeamMembers, deleteTeamMember } from "@/services/teamMembersService";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";

interface TeamMembersTabsProps {
  onTeamMemberClick?: (teamMemberId: string) => void;
  highlightId?: string; // ID of team member to highlight
}

const headerArr = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Location",
  "Experience",
  "Team Role",
  "Status",
  "Actions",
];

// Team role color mapping
const getTeamRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
  const normalizedRole = role?.toLowerCase() || "";

  switch (normalizedRole) {
    case "admin":
    case "administrator":
      return "destructive"; // Red
    case "hiring manager":
    case "hiring_manager":
    case "hir":
      return "default"; // Blue
    case "team lead":
    case "team_lead":
    case "lead":
      return "secondary"; // Gray
    case "recruiter":
    case "recruiters":
    case "rec":
      return "outline"; // Border only
    case "head hunter":
    case "head_hunter":
    case "head enter":
    case "headenter":
      return "destructive"; // Red
    case "sales team":
    case "sales_team":
    case "sales":
      return "secondary"; // Gray
    default:
      return "outline"; // Default for unknown roles
  }
};

// Team role color classes for custom styling - matching status badge style
const getTeamRoleColorClass = (role: string): string => {
  const normalizedRole = role?.toLowerCase() || "";

  switch (normalizedRole) {
    case "admin":
    case "administrator":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "hiring manager":
    case "hiring_manager":
    case "hir":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "team lead":
    case "team_lead":
    case "lead":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "recruiter":
    case "recruiters":
    case "rec":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "head hunter":
    case "head_hunter":
    case "head enter":
    case "headenter":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "sales team":
    case "sales_team":
    case "sales":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Function to format team role display - replace underscores with spaces
const formatTeamRoleDisplay = (role: string): string => {
  if (!role) return "Not Assigned";
  return role.replace(/_/g, " ");
};

export function TeamMembersTabs({ onTeamMemberClick, highlightId }: TeamMembersTabsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState<TeamMember | null>(null);

  // React Query setup
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => getTeamMembers(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30_000,
  });
  const dataTeamMembers: TeamMember[] = data?.teamMembers ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      // Refresh list after successful deletion
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setDeleteDialogOpen(false);
      setTeamMemberToDelete(null);
    },
  });

  const handleStatusChange = async (teamMemberId: string, newStatus: TeamMemberStatus) => {
    // Optimistically update cache for status changes
    queryClient.setQueryData(["teamMembers"], (oldData: any) => {
      if (!oldData?.teamMembers) return oldData;
      return {
        ...oldData,
        teamMembers: oldData.teamMembers.map((tm: TeamMember) =>
          tm._id === teamMemberId ? { ...tm, status: newStatus } : tm
        ),
      };
    });
    // Do not refetch here; mutation in TeamMemberStatusBadge will invalidate once
  };

  const handleRegisterUser = (teamMember: TeamMember) => {
    setSelectedTeamMember(teamMember);
    setRegisterDialogOpen(true);
  };

  const handleCloseRegisterDialog = () => {
    setRegisterDialogOpen(false);
    setSelectedTeamMember(null);
  };

  const handleDeleteTeamMember = (teamMember: TeamMember) => {
    setTeamMemberToDelete(teamMember);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTeamMember = async () => {
    if (!teamMemberToDelete) return;
    deleteMutation.mutate(teamMemberToDelete._id);
  };

  const cancelDeleteTeamMember = () => {
    setDeleteDialogOpen(false);
    setTeamMemberToDelete(null);
  };



  // Get counts for each role
  const getCountByRole = (role: string) => {
    const normalize = (r?: string) => {
      const base = (r || "").toLowerCase().replace(/\s+/g, "_");
      if (["admin", "administrator"].includes(base)) return "admin";
      if (["hiring_manager", "hiring", "hir"].includes(base)) return "hiring_manager";
      if (["team_lead", "lead"].includes(base)) return "team_lead";
      if (["recruiter", "recruiters", "rec"].includes(base)) return "recruiter";
      if (["head_hunter", "head_enter", "headenter"].includes(base)) return "head_hunter";
      if (["sales_team", "sales"].includes(base)) return "sales_team";
      return base;
    };
    const target = normalize(role);
    return dataTeamMembers.filter(member =>
      normalize(member.teamRole) === target ||
      normalize((member as any).role) === target
    ).length;
  };

  // Filter team members based on active tab
  const getFilteredTeamMembers = () => {
    switch (activeTab) {
      case "all":
        return dataTeamMembers;
      case "admin":
        return dataTeamMembers.filter(member =>
          member.teamRole === "ADMIN" ||
          member.teamRole === "Admin" ||
          (member as any).role === "Admin" ||
          (member as any).role === "ADMIN" ||
          (member as any).role === "Administrator"
        );
      case "hiring-manager":
        return dataTeamMembers.filter(member =>
          member.teamRole === "HIRING_MANAGER" ||
          member.teamRole === "Hiring Manager" ||
          member.role === "Hiring Manager"
        );
      case "team-lead":
        return dataTeamMembers.filter(member =>
          member.teamRole === "TEAM_LEAD" ||
          member.teamRole === "Team Lead" ||
          member.role === "Team Lead"
        );
      case "recruiters":
        return dataTeamMembers.filter(member =>
          member.teamRole === "RECRUITER" ||
          member.teamRole === "Recruiters" ||
          member.role === "Recruiters"
        );
      case "sales-team":
        return dataTeamMembers.filter(member =>
          member.teamRole === "SALES_TEAM" ||
          member.teamRole === "Sales Team" ||
          member.role === "Sales Team"
        );
      case "head-enter":
        return dataTeamMembers.filter(member =>
          member.teamRole === "HEAD_HUNTER" ||
          member.teamRole === "Head Enter" ||
          member.role === "HEAD_HUNTER"
        );
      default:
        return dataTeamMembers;
    }
  };

  const filteredTeamMembers = getFilteredTeamMembers();

  const renderTeamMembersTable = (members: TeamMember[]) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={headerArr.length} className="h-[calc(100vh-240px)] text-center">
            <div className="py-24">
              <div className="text-center">Loading team members...</div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (members.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={headerArr.length} className="h-[calc(100vh-240px)] text-center">
            <div className="py-24">
              <div className="text-center">No team members found in this category</div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return members.map((teamMember) => {
      const isHighlighted = highlightId && teamMember._id === highlightId;

      return (
        <TableRow
          key={teamMember._id}
          className={`hover:bg-muted/50 transition-colors ${isHighlighted ? 'bg-brand/5' : ''
            }`}
        >
          <TableCell className="text-sm font-medium">
            <span
              className="font-medium text-slate-900 hover:text-brand hover:underline cursor-pointer transition-colors block"
              onClick={() => onTeamMemberClick?.(teamMember._id)}
            >
              {teamMember.firstName}
            </span>
          </TableCell>
          <TableCell className="text-sm">{teamMember.lastName}</TableCell>
          <TableCell className="text-sm">{teamMember.email}</TableCell>
          <TableCell className="text-sm">{teamMember.phone}</TableCell>
          <TableCell className="text-sm">{teamMember.location}</TableCell>
          <TableCell className="text-sm">{teamMember.experience}</TableCell>
          <TableCell className="text-sm">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTeamRoleColorClass(teamMember.teamRole || "")}`}
              style={{
                transition: 'none',
                pointerEvents: 'none'
              }}
            >
              {formatTeamRoleDisplay(teamMember.teamRole || "")}
            </span>
          </TableCell>

          <TableCell className="text-sm">
            <TeamMemberStatusBadge
              id={teamMember._id}
              status={teamMember.status}
              onStatusChange={handleStatusChange}
            />
          </TableCell>
          <TableCell className="text-sm">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleRegisterUser(teamMember);
                }}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Register User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeamMember(teamMember);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="flex border-b border-slate-200 w-full rounded-none justify-start h-12 bg-white px-2 shrink-0 overflow-x-auto">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <Users className="h-4 w-4" />
            All
            <Badge variant="secondary" className="ml-1 text-xs">
              {dataTeamMembers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("ADMIN")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="hiring-manager"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            Hiring Manager
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("HIRING_MANAGER")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="team-lead"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <UserCog className="h-4 w-4" />
            Team Lead
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("TEAM_LEAD")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="recruiters"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <Users className="h-4 w-4" />
            Recruiters
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("RECRUITER")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="sales-team"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <Users className="h-4 w-4" />
            Sales Team
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("SALES_TEAM")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="head-enter"
            className="data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:text-brand text-slate-500 hover:text-slate-900 data-[state=active]:shadow-none rounded-none flex items-center gap-2 h-12 px-6 border-b-2 border-transparent transition-colors"
          >
            <Crown className="h-4 w-4" />
            Head Hunter
            <Badge variant="secondary" className="ml-1 text-xs">
              {getCountByRole("HEAD_HUNTER")}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {["all", "admin", "hiring-manager", "team-lead", "recruiters", "sales-team", "head-enter"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="p-0 mt-0 flex-1 overflow-auto relative">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 hover:bg-slate-50 text-slate-700">
                  {headerArr.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTeamMembersTable(filteredTeamMembers)}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>

      {
        selectedTeamMember && (
          <RegisterUserDialog
            isOpen={registerDialogOpen}
            onClose={handleCloseRegisterDialog}
            teamMemberId={selectedTeamMember._id}
            teamMemberName={selectedTeamMember.firstName + " " + selectedTeamMember.lastName}
            teamMemberEmail={selectedTeamMember.email}
          />
        )
      }

      <DeleteTeamMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teamMemberName={teamMemberToDelete?.firstName + " " + teamMemberToDelete?.lastName || ""}
        onConfirm={confirmDeleteTeamMember}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
