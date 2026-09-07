"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
import { getTeamMembers, deleteTeamMember } from "@/services/teamMembersService";
import { roleService, Role } from "@/services/roleService";
import { useExportUsers } from "@/hooks/useExportUsers";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCw,
  Download,
  Plus,
  Loader2,
  X,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Redesigned components
import { TeamMemberStatsBar } from "@/components/teamMembers/TeamMemberStatsBar";
import { TeamMemberFilterDrawer } from "@/components/teamMembers/TeamMemberFilterDrawer";
import { TeamMemberTableRow } from "@/components/teamMembers/TeamMemberTableRow";
import { TeamMemberCardView } from "@/components/teamMembers/TeamMemberCardView";
import { TeamMemberPagination } from "@/components/teamMembers/TeamMemberPagination";

// Modals
import { CreateTeamMemberModal } from "@/components/create-teamMembers-modal/create-teamMembers-modal";
import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
import { DeleteTeamMemberDialog } from "@/components/teamMembers/delete-team-member-dialog";

export default function TeamMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const highlightId = searchParams?.get("highlight") || undefined;

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleTab, setSelectedRoleTab] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Drawer specific filters
  const [drawerName, setDrawerName] = useState("");
  const [drawerEmail, setDrawerEmail] = useState("");
  const [drawerPhone, setDrawerPhone] = useState("");
  const [drawerLocation, setDrawerLocation] = useState("");
  const [drawerDepartment, setDrawerDepartment] = useState("");
  const [drawerExperience, setDrawerExperience] = useState("");
  const [drawerRole, setDrawerRole] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("teammembers_view_mode") as "table" | "grid";
    if (saved) {
      setViewMode(saved);
    } else {
      setViewMode(window.innerWidth < 1024 ? "grid" : "table");
    }
  }, []);

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("teammembers_view_mode", mode);
  };

  // Queries
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => getTeamMembers(),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const allTeamMembers: TeamMember[] = data?.teamMembers ?? [];

  const { data: rolesRes } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  });
  const roles: Role[] = rolesRes?.data ?? [];

  // Mutations
  const { mutateAsync: exportUsersMutation } = useExportUsers();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      toast.success("Team member deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete team member");
    },
  });

  const handleStatusChange = (id: string, newStatus: TeamMemberStatus) => {
    queryClient.setQueryData(["teamMembers"], (oldData: any) => {
      if (!oldData?.teamMembers) return oldData;
      return {
        ...oldData,
        teamMembers: oldData.teamMembers.map((tm: TeamMember) =>
          tm._id === id ? { ...tm, status: newStatus } : tm
        ),
      };
    });
    toast.success("Status updated");
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    deleteMutation.mutate(memberToDelete._id);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (drawerName.trim()) count++;
    if (drawerEmail.trim()) count++;
    if (drawerPhone.trim()) count++;
    if (drawerLocation.trim()) count++;
    if (drawerDepartment.trim()) count++;
    if (drawerExperience.trim()) count++;
    if (drawerRole !== "All") count++;
    if (selectedStatus !== "All") count++;
    return count;
  }, [
    drawerName,
    drawerEmail,
    drawerPhone,
    drawerLocation,
    drawerDepartment,
    drawerExperience,
    drawerRole,
    selectedStatus,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setDrawerName("");
    setDrawerEmail("");
    setDrawerPhone("");
    setDrawerLocation("");
    setDrawerDepartment("");
    setDrawerExperience("");
    setDrawerRole("All");
    setSelectedStatus("All");
    setSelectedRoleTab("all");
    setCurrentPage(1);
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allTeamMembers.filter((m) => {
      // Role Tab Filter
      if (selectedRoleTab !== "all") {
        const selectedRole = roles.find(
          (r) => (r._id || r.id) === selectedRoleTab
        );
        if (selectedRole) {
          const matchesRoleId =
            m.roleId &&
            (m.roleId === selectedRole._id || m.roleId === selectedRole.id);
          const matchesRoleName =
            (m.teamRole || "").toLowerCase() === selectedRole.name.toLowerCase();
          if (!matchesRoleId && !matchesRoleName) return false;
        }
      }

      // Drawer Role Filter
      if (drawerRole !== "All") {
        const roleMatch = roles.find((r) => (r._id || r.id || r.name) === drawerRole);
        if (roleMatch) {
          const matchesId = m.roleId && (m.roleId === roleMatch._id || m.roleId === roleMatch.id);
          const matchesName = (m.teamRole || "").toLowerCase() === roleMatch.name.toLowerCase();
          if (!matchesId && !matchesName) return false;
        }
      }

      // Status Filter
      if (selectedStatus !== "All") {
        if ((m.status || "").toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Quick Search Query (name, email, phone, location, role)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
        const email = (m.email || "").toLowerCase();
        const phone = (m.phone || "").toLowerCase();
        const location = (m.location || "").toLowerCase();
        const role = (m.teamRole || m.role || "").toLowerCase();
        const dept = (m.department || "").toLowerCase();
        const memberId = (m.teamMemberId || "").toLowerCase();

        const matches =
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          location.includes(q) ||
          role.includes(q) ||
          dept.includes(q) ||
          memberId.includes(q);

        if (!matches) return false;
      }

      // Drawer Name
      if (drawerName.trim()) {
        const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
        if (!fullName.includes(drawerName.toLowerCase())) return false;
      }

      // Drawer Email
      if (drawerEmail.trim()) {
        if (!(m.email || "").toLowerCase().includes(drawerEmail.toLowerCase())) {
          return false;
        }
      }

      // Drawer Phone
      if (drawerPhone.trim()) {
        if (!(m.phone || "").toLowerCase().includes(drawerPhone.toLowerCase())) {
          return false;
        }
      }

      // Drawer Location
      if (drawerLocation.trim()) {
        if (
          !(m.location || "").toLowerCase().includes(drawerLocation.toLowerCase())
        ) {
          return false;
        }
      }

      // Drawer Department
      if (drawerDepartment.trim()) {
        if (
          !(m.department || "")
            .toLowerCase()
            .includes(drawerDepartment.toLowerCase())
        ) {
          return false;
        }
      }

      // Drawer Experience
      if (drawerExperience.trim()) {
        if (
          !(m.experience || "")
            .toLowerCase()
            .includes(drawerExperience.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allTeamMembers,
    selectedRoleTab,
    drawerRole,
    selectedStatus,
    searchQuery,
    drawerName,
    drawerEmail,
    drawerPhone,
    drawerLocation,
    drawerDepartment,
    drawerExperience,
    roles,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedRoleTab,
    selectedStatus,
    drawerName,
    drawerEmail,
    drawerPhone,
    drawerLocation,
    drawerDepartment,
    drawerExperience,
    drawerRole,
  ]);

  // Pagination calculation
  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  return (
    <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col min-h-0 overflow-hidden bg-background p-2 sm:p-3 md:p-3.5 gap-2 select-none">
      {/* Top Command Header */}
      <div className="flex-shrink-0 bg-card rounded-2xl border border-border/80 shadow-xs p-2.5 sm:px-3.5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                Team Members
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                {allTeamMembers.length} members
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              Manage organization staff, roles, credentials, and access statuses
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md min-w-[180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Quick search by name, email, role or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-8.5 text-xs bg-muted/30 border border-border/70 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 px-2.5 rounded-xl border-border/70 text-xs font-semibold hover:bg-muted/60"
            title="Refresh team members"
          >
            <RotateCw
              className={cn("w-3.5 h-3.5", isFetching && "animate-spin text-primary")}
            />
          </Button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-muted/40 border border-border/70 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                viewMode === "table"
                  ? "bg-card text-primary shadow-xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                viewMode === "grid"
                  ? "bg-card text-primary shadow-xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Drawer Button */}
          <Button
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            className="h-8.5 px-2.5 sm:px-3 rounded-xl border-border/70 text-xs font-semibold gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-foreground text-primary text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="h-8.5 px-2.5 sm:px-3 rounded-xl border-border/70 text-xs font-semibold gap-1.5 hover:bg-muted/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Add Member */}
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="h-8.5 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>

      {/* Role & Status KPI Stats Bar */}
      <div className="flex-shrink-0">
        <TeamMemberStatsBar
          totalCount={allTeamMembers.length}
          teamMembers={allTeamMembers}
          roles={roles}
          selectedRoleTab={selectedRoleTab}
          onSelectRoleTab={(tab) => setSelectedRoleTab(tab)}
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Syncing Team Members...
              </span>
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  No team members found
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try adjusting your search query, role selection, or filters.
                </p>
              </div>
              {(searchQuery || activeFiltersCount > 0 || selectedRoleTab !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="rounded-xl text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Responsive Grid Deck */
            <TeamMemberCardView
              teamMembers={paginatedMembers}
              highlightId={highlightId}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteClick}
            />
          ) : (
            /* High-Density Data Table */
            <Table className="w-full border-separate border-spacing-0 table-auto min-w-[950px]">
              <TableHeader className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md">
                <TableRow className="border-b border-border/70 hover:bg-muted/95">
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[100px]">
                    ID
                  </TableHead>
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[200px]">
                    Member Info
                  </TableHead>
                  <TableHead className="px-3.5 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[220px]">
                    Contact
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">
                    Location
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[110px]">
                    Experience
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[130px]">
                    Role
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[140px]">
                    Status
                  </TableHead>
                  <TableHead className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TeamMemberTableRow
                    key={member._id}
                    member={member}
                    isHighlighted={highlightId === member._id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Compact Single-Line Pagination Footer */}
        <div className="flex-shrink-0 bg-card border-t border-border/70">
          <TeamMemberPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalMembers={totalMembers}
            pageSize={pageSize}
            setPageSize={setPageSize}
            handlePageChange={(page) => {
              if (page >= 1 && page <= totalPages) setCurrentPage(page);
            }}
            membersLength={paginatedMembers.length}
          />
        </div>
      </div>

      {/* Filter Slide-over Drawer */}
      <TeamMemberFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        roles={roles}
        nameInput={drawerName}
        setNameInput={setDrawerName}
        emailInput={drawerEmail}
        setEmailInput={setDrawerEmail}
        phoneInput={drawerPhone}
        setPhoneInput={setDrawerPhone}
        locationInput={drawerLocation}
        setLocationInput={setDrawerLocation}
        departmentInput={drawerDepartment}
        setDepartmentInput={setDrawerDepartment}
        experienceInput={drawerExperience}
        setExperienceInput={setDrawerExperience}
        selectedRole={drawerRole}
        setSelectedRole={setDrawerRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onClearAll={clearAllFilters}
        activeCount={activeFiltersCount}
      />

      {/* Create Team Member Modal */}
      <CreateTeamMemberModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
          setCreateModalOpen(false);
          refetch();
        }}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        title="Export Team Members"
        description="Download CSV report of team members."
        onExport={(params: ExportFilterParams | undefined) =>
          exportUsersMutation(params)
        }
        filename="team_members"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTeamMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teamMemberName={
          memberToDelete
            ? `${memberToDelete.firstName || ""} ${memberToDelete.lastName || ""}`.trim()
            : ""
        }
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
