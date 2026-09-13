"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getClientGroupById, linkClientToGroup, deleteClientGroup, ClientGroupMember } from "@/services/clientService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChevronLeft,
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  Merge,
  Loader2,
  Plus,
  Users,
  Briefcase,
  Layers,
  Search,
  ExternalLink,
  UserMinus,
  Check,
  Sparkles,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddClientToGroupModal } from "./AddClientToGroupModal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MergeGroupModal } from "./MergeGroupModal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClientGroupDetailModuleProps {
  groupId: string;
}

export default function ClientGroupDetailModule({ groupId }: ClientGroupDetailModuleProps) {
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ClientGroupMember | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clientGroup", groupId],
    queryFn: () => getClientGroupById(groupId),
  });

  const handleRemoveMember = async (clientId: string) => {
    try {
      await linkClientToGroup(clientId, null);
      toast.success("Client removed from group");
      setMemberToRemove(null);
      refetch();
    } catch (error) {
      toast.error("Failed to remove client from group");
    }
  };

  const handleDeleteGroup = async (force: boolean = false) => {
    try {
      setIsDeleting(true);
      await deleteClientGroup(groupId, force);
      toast.success("Client group deleted");
      router.push("/client-groups");
    } catch (error: any) {
      if (error?.response?.status === 400 && error.response.data?.memberCount) {
        setDeleteWarning(error.response.data.message);
        setShowDeleteConfirm(true);
      } else {
        toast.error(error?.response?.data?.message || "Failed to delete group");
        setShowDeleteConfirm(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!data?.members) return [];
    if (!memberSearch.trim()) return data.members;
    const q = memberSearch.toLowerCase();
    return data.members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q) ||
        m.clientStage?.toLowerCase().includes(q),
    );
  }, [data?.members, memberSearch]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Loading Group Details...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <Button variant="ghost" onClick={() => router.push("/client-groups")} size="sm">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Groups
        </Button>
        <div className="bg-card p-8 rounded-xl border border-border shadow-2xs">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-foreground">Client Group Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            The group you requested could not be found or has been deleted.
          </p>
          <Button onClick={() => router.push("/client-groups")} size="sm">
            Browse All Groups
          </Button>
        </div>
      </div>
    );
  }

  const initials = data.group?.name ? data.group.name.slice(0, 2).toUpperCase() : "CG";

  return (
    <div className="flex flex-col min-h-screen w-full bg-transparent text-foreground">
      <div className="flex-1 p-3 sm:p-4 md:p-5 max-w-7xl w-full mx-auto space-y-4">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => router.push("/client-groups")}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Groups</span>
            </Button>
            <span className="text-white/40">/</span>
            <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
              {data.group.name}
            </span>
          </div>

          {/* Action Menu Trigger on Mobile / Secondary actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddClientModalOpen(true)}
              className="h-8 px-3 text-xs font-bold rounded-xl bg-white text-primary hover:bg-white/90 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> Add Client
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Group Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMergeModalOpen(true)}>
                  <Merge className="w-4 h-4 mr-2 text-muted-foreground" /> Merge with Group
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (data.totalCompanies > 0) {
                      handleDeleteGroup(false);
                    } else {
                      handleDeleteGroup(true);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Executive Hero Banner Card */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <Avatar className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-black text-base shrink-0 shadow-sm">
                <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    {data.group.name}
                  </h1>
                  {data.group.groupCode && (
                    <span className="px-2 py-0.5 rounded-md bg-muted/80 text-xs font-mono font-semibold border border-border/70">
                      {data.group.groupCode}
                    </span>
                  )}
                  {data.primaryClient && (
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold cursor-pointer hover:bg-primary/10"
                      onClick={() => router.push(`/clients/${data.primaryClient?._id}`)}
                    >
                      Primary: {data.primaryClient.name}
                    </Badge>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {data.group.description || "No description configured for this corporate group."}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-semibold rounded-lg"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-semibold rounded-lg"
                onClick={() => setIsMergeModalOpen(true)}
              >
                <Merge className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Merge
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Member Companies
              </span>
              <p className="text-2xl font-bold text-foreground mt-0.5">{data.totalCompanies}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Positions & Jobs
              </span>
              <p className="text-2xl font-bold text-foreground mt-0.5">{data.totalJobCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Stage Distribution</span>
              <Layers className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(data.stageBreakdown || {}).map(([stage, count]) => (
                <span key={stage} className="text-xs px-2 py-0.5 bg-muted/60 rounded-md border border-border/60 font-medium">
                  {stage}: <span className="font-bold text-foreground">{count}</span>
                </span>
              ))}
              {Object.keys(data.stageBreakdown || {}).length === 0 && (
                <span className="text-xs text-muted-foreground italic">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Member Clients Management Section */}
        <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
          {/* Section Header with Search Bar */}
          <div className="p-4 border-b border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Affiliated Member Clients</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {data.members?.length || 0}
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              <Button
                size="sm"
                onClick={() => setIsAddClientModalOpen(true)}
                className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Client
              </Button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <TableHead className="py-3 px-4">Client Name</TableHead>
                  <TableHead className="py-3 px-4">Relationship</TableHead>
                  <TableHead className="py-3 px-4">Stage</TableHead>
                  <TableHead className="py-3 px-4">Industry</TableHead>
                  <TableHead className="py-3 px-4 text-center">Jobs</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 text-xs">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const memberInitials = member.name ? member.name.slice(0, 2).toUpperCase() : "CL";
                    return (
                      <TableRow key={member._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3 px-4 font-semibold text-foreground">
                          <div
                            className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => router.push(`/clients/${member._id}`)}
                          >
                            <Avatar className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                              <AvatarFallback className="rounded-lg">{memberInitials}</AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[200px]">{member.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          {member.role === "primary" ? (
                            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                              Primary Entity
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium">
                              Member
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-muted/80 text-[11px] font-medium border border-border/60">
                            {member.clientStage || "Lead"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-muted-foreground">
                          {member.industry || <span className="text-muted-foreground/40">—</span>}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-center">
                          <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                            {member.jobCount || 0}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                              onClick={() => router.push(`/clients/${member._id}`)}
                            >
                              View <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                              onClick={() => setMemberToRemove(member)}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {memberSearch ? "No members match the search query." : "No clients affiliated with this group yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/40">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const memberInitials = member.name ? member.name.slice(0, 2).toUpperCase() : "CL";
                return (
                  <div key={member._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => router.push(`/clients/${member._id}`)}
                      >
                        <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                          <AvatarFallback className="rounded-lg">{memberInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">{member.industry || "General Industry"}</p>
                        </div>
                      </div>

                      {member.role === "primary" ? (
                        <Badge className="bg-primary text-primary-foreground text-[9px] font-bold uppercase shrink-0">
                          Primary
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                          Member
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>Stage: <strong className="text-foreground">{member.clientStage || "Lead"}</strong></span>
                      <span>Jobs: <strong className="text-foreground">{member.jobCount || 0}</strong></span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => router.push(`/clients/${member._id}`)}
                      >
                        View Client
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setMemberToRemove(member)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {memberSearch ? "No members match search." : "No member clients in this group."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Group Modal */}
      <CreateGroupModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        initialData={data.group}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
      />

      {/* Add Client To Group Modal */}
      <AddClientToGroupModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        mode="pick-client"
        groupId={groupId}
        onSuccess={() => refetch()}
      />

      {/* Merge Group Modal */}
      <MergeGroupModal
        open={isMergeModalOpen}
        onOpenChange={setIsMergeModalOpen}
        sourceGroupId={groupId}
        sourceGroupName={data.group.name}
      />

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Client from Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-bold text-foreground">{memberToRemove?.name}</span> from this group? The client will remain intact in the database, but will no longer be linked to this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium text-xs">
              {deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteGroup(true);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Force Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
